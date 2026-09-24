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

git fetch --quiet origin main
# BUGFIX: comparing HEAD against origin/main says "no docs changes" when the commit was
# made ON THIS HOST (push makes them identical), so local commits silently never deployed.
# Compare against the LAST DEPLOYED commit instead; fall back to origin/main on first run.
LAST_DEPLOYED="$(cat "$REPO/.deploy-last.head" 2>/dev/null || echo origin/main)"
if git diff --quiet "$LAST_DEPLOYED" HEAD -- docs scripts/pages; then
  echo "$(date -u '+%F %T UTC') no docs changes since ${LAST_DEPLOYED:0:8}"
  exit 0
fi

git pull --quiet --ff-only origin main

rm -rf "$SCRATCH"
python3 scripts/pages/stage_public_tree.py --src docs --dst "$SCRATCH" >/dev/null
python3 scripts/pages/guard_published_tree.py --root "$SCRATCH" --patterns docs \
  || { echo "GUARD FAILED: refusing to publish an unclean tree"; exit 1; }

mkdir -p "$SERVED"
rsync -a --delete "$SCRATCH/" "$SERVED/"
rm -rf "$SCRATCH"
chmod -R a+rX "$SERVED"
git rev-parse HEAD > "$REPO/.deploy-last.head"
echo "$(date -u '+%F %T UTC') restaged $(git rev-parse --short HEAD)"
