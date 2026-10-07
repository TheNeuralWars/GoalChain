#!/usr/bin/env bash
# Deploy the public site to the Caddy origin (goalworld.fun is served from this host through
# the Cloudflare tunnel; Caddy serves the files directly, so static changes need no reload).
#
# Builds the staged tree in a SCRATCH dir and rsyncs it INTO the served directory. It must
# never delete/recreate the served directory itself: that path is a docker bind mount, and
# replacing it leaves the running container pointing at the old inode (empty site).
set -euo pipefail
REPO="${GOALCHAIN_REPO_PATH:-/data/apps/GoalChain}"
SERVED="$REPO/_site_public"
SCRATCH="$REPO/_site_public.new"
cd "$REPO"

# 2026-09-25 FIX (goalworld.fun 404): serialize runs. The 5-min timer and a manual run after a
# commit raced on the shared $SCRATCH: one run's `rm -rf` emptied the tree while the other was
# staging, then the survivor rsync --delete'd a PARTIAL tree into $SERVED (index.html gone)
# and recorded .deploy-last.head, so later runs saw "no docs changes" and never repaired it.
# Every caller (timer or manual) must go through this lock.
exec 9>"$(git rev-parse --git-dir)/deploy-origin.lock"   # lock lives inside .git: no untracked noise
if ! flock -w 900 9; then
  echo "$(date -u '+%F %T UTC') another deploy_origin.sh still running after 900s; skipping"
  exit 0
fi

git fetch --quiet origin main
# BUGFIX: comparing HEAD against origin/main says "no docs changes" when the commit was
# made ON THIS HOST (push makes them identical), so local commits silently never deployed.
# Compare against the LAST DEPLOYED commit instead; fall back to origin/main on first run.
LAST_DEPLOYED="$(cat "$REPO/.deploy-last.head" 2>/dev/null || echo origin/main)"
# DEPLOY_FORCE=1 restages even when nothing changed (used to repair a broken served tree).
if [ "${DEPLOY_FORCE:-0}" != 1 ] && git diff --quiet "$LAST_DEPLOYED" HEAD -- docs scripts/pages; then
  echo "$(date -u '+%F %T UTC') no docs changes since ${LAST_DEPLOYED:0:8}"
  exit 0
fi

git pull --quiet --ff-only origin main

rm -rf "$SCRATCH"
python3 scripts/pages/stage_public_tree.py --src docs --dst "$SCRATCH" >/dev/null
python3 scripts/pages/guard_published_tree.py --root "$SCRATCH" --patterns docs \
  || { echo "GUARD FAILED: refusing to publish an unclean tree"; exit 1; }

# Refuse to rsync --delete an incomplete tree over the live site.
for f in index.html goalworld.html; do
  [ -s "$SCRATCH/$f" ] || { echo "SANITY FAILED: staged tree lacks $f; not publishing"; exit 1; }
done

mkdir -p "$SERVED"
rsync -a --delete "$SCRATCH/" "$SERVED/"
rm -rf "$SCRATCH"
chmod -R a+rX "$SERVED"
git rev-parse HEAD > "$REPO/.deploy-last.head"
echo "$(date -u '+%F %T UTC') restaged $(git rev-parse --short HEAD)"
