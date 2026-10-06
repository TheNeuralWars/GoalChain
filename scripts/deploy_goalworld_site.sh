#!/usr/bin/env bash
# deploy_goalworld_site.sh — deploy the GoalWorld landing (goalworld_site/) to a served tree.
#
# What it does (deploy subcommand, default):
#   1. fetch + check out a ref (default origin/main) in a DEDICATED deploy worktree
#      (never the live main checkouts at /home/ubuntu/GoalChain or /data/apps/GoalChain)
#   2. build goalworld_site -> dist/
#   2b. ship the press-kit zip (64 MB, gitignored — kept on disk only) into dist/press/
#       and dist/assets/ so every deploy re-syncs it (it survives restages/rollbacks)
#   2c. write the landing manifest (default /data/work/goalworld-landing.paths): the
#       paths the landing owns in the target; scripts/pages/stage_public_tree.py
#       preserves exactly these across deploy_origin.sh's rsync --delete restages
#   3. back up every target file the deploy is about to touch into a timestamped tarball
#      (the 64 MB press-kit zip is excluded: content-stable, kept out of backups)
#   4. rsync dist/ into the target (merge, never --delete: other pipelines depend on files
#      living in the target that are not part of the landing)
#
# The deploy holds the same lock deploy_origin.sh uses (git-dir/deploy-origin.lock) so a
# concurrent 5-min origin restage cannot race the rsync below.
#
# Subcommands / flags:
#   deploy                 (default) build + backup + rsync
#   rollback [--backup F]  restore the latest (or given) backup tarball over the target
#   --ref REF              git ref to deploy (default origin/main)
#   --target DIR           target tree (default /data/apps/GoalChain/_site_public)
#   --repo DIR             git repo to fetch from (default /data/apps/GoalChain)
#   --worktree DIR         deploy worktree (default /data/work/gw-site-deploy)
#   --backup-dir DIR       where tarballs live (default /data/work/goalworld-site-backups/<target-name>)
#   --dry-run              show exactly what would change, change nothing
#   --full-backup          tar the WHOLE target (slow/big) instead of the deploy surface only
#
# Why the backup is the deploy surface by default: the default target is a ~3 GB
# live tree (a docker bind mount) that other pipelines write into; a full tarball
# per deploy would eat the disk. The deploy only overwrites files it ships, so
# those are exactly the files rollback needs. Use --full-backup for a complete copy.
#
# NEVER deletes anything outside the shipped file set. NEVER replaces the target
# directory itself (bind-mount safe: rsync into it, never rm/mv the directory).
set -euo pipefail

REPO="${GOALCHAIN_REPO_PATH:-/data/apps/GoalChain}"
WORKTREE="${GOALWORLD_DEPLOY_WORKTREE:-/data/work/gw-site-deploy}"
TARGET="${GOALWORLD_DEPLOY_TARGET:-/data/apps/GoalChain/_site_public}"
BACKUP_DIR="${GOALWORLD_BACKUP_DIR:-}"
REF="origin/main"
DRY=0
FULL_BACKUP=0
CMD="deploy"
BACKUP_FILE=""
MANIFEST="${GOALWORLD_LANDING_MANIFEST:-/data/work/goalworld-landing.paths}"
PRESS_NAME="PressKit_GoalChain.zip"

usage() { sed -n '2,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    deploy|rollback) CMD="$1" ;;
    --ref) REF="$2"; shift ;;
    --target) TARGET="$2"; shift ;;
    --repo) REPO="$2"; shift ;;
    --worktree) WORKTREE="$2"; shift ;;
    --backup-dir) BACKUP_DIR="$2"; shift ;;
    --backup) BACKUP_FILE="$2"; shift ;;
    --dry-run) DRY=1 ;;
    --full-backup) FULL_BACKUP=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

ts() { date -u '+%Y%m%dT%H%M%SZ'; }
log() { echo "[$(date -u '+%F %T UTC')] $*"; }

[ -n "$BACKUP_DIR" ] || BACKUP_DIR="/data/work/goalworld-site-backups/$(basename "$TARGET")"

# ---------------------------------------------------------------- rollback ---
do_rollback() {
  if [ -z "$BACKUP_FILE" ]; then
    BACKUP_FILE="$(ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1 || true)"
  fi
  if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "no backup found under $BACKUP_DIR (or --backup file missing)" >&2
    exit 1
  fi
  log "rollback target=$TARGET from $(basename "$BACKUP_FILE")"
  if [ "$DRY" = 1 ]; then
    tar -tzf "$BACKUP_FILE" | sed 's/^/  would restore: /'
    exit 0
  fi
  mkdir -p "$TARGET"
  tar -xzf "$BACKUP_FILE" -C "$TARGET"
  chmod -R a+rX "$TARGET" 2>/dev/null || true
  log "rollback done: $(tar -tzf "$BACKUP_FILE" | wc -l) paths restored"
}

# ------------------------------------------------------------------ deploy ---
do_deploy() {
  log "deploy: ref=$REF target=$TARGET dry-run=$DRY"

  # 1. dedicated deploy worktree (the live checkouts are never checked out / reset)
  if [ ! -d "$WORKTREE/.git" ] && [ ! -f "$WORKTREE/.git" ]; then
    log "creating deploy worktree at $WORKTREE"
    if [ "$DRY" = 1 ]; then
      echo "  would: git -C $REPO worktree add --detach $WORKTREE $REF"
    else
      git -C "$REPO" worktree add --detach "$WORKTREE" "$REF" >/dev/null
    fi
  fi
  if [ "$DRY" = 0 ]; then
    git -C "$WORKTREE" fetch --quiet origin
    git -C "$WORKTREE" checkout --quiet --detach "$REF"
    git -C "$WORKTREE" reset --quiet --hard "$REF"
  fi
  SHA="$(git -C "$WORKTREE" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  log "deploy worktree at $SHA ($REF)"

  # 2. build
  if [ "$DRY" = 0 ]; then
    node "$WORKTREE/goalworld_site/build.mjs"
  else
    echo "  would: node $WORKTREE/goalworld_site/build.mjs"
  fi
  DIST="$WORKTREE/goalworld_site/dist"
  if [ ! -s "$DIST/index.html" ]; then
    if [ "$DRY" = 1 ]; then
      DIST=""   # nothing built yet in dry-run — skip the rsync preview
    else
      echo "build output missing: $DIST/index.html" >&2
      exit 1
    fi
  fi

  # 2b. press-kit zip (64 MB, gitignored — kept on disk only): re-sync it with every
  # deploy so it survives the origin restage and rollbacks. Served at
  # /press/PressKit_GoalChain.zip (linked from the webapp Press Kit page) and at the
  # legacy /assets/PressKit_GoalChain.zip URL (public download since 2026-09-10).
  PRESS_SRC=""
  for cand in "${GOALWORLD_PRESS_KIT:-}" "/data/work/goalworld-press/$PRESS_NAME" \
              "$TARGET/press/$PRESS_NAME" "$TARGET/assets/$PRESS_NAME" \
              "$REPO/docs/assets/$PRESS_NAME" "$REPO/goalchain_webapp/public/$PRESS_NAME"; do
    if [ -n "$cand" ] && [ -f "$cand" ]; then PRESS_SRC="$cand"; break; fi
  done
  if [ -n "$PRESS_SRC" ]; then
    log "press kit: ship $PRESS_SRC -> dist/press/ + dist/assets/ ($(du -m "$PRESS_SRC" | cut -f1) MB)"
    if [ "$DRY" = 0 ] && [ -n "$DIST" ]; then
      mkdir -p "$DIST/press" "$DIST/assets"
      cp -f "$PRESS_SRC" "$DIST/press/$PRESS_NAME"
      cp -f "$PRESS_SRC" "$DIST/assets/$PRESS_NAME"
    fi
  else
    log "WARN: press-kit source not found — $PRESS_NAME not re-shipped (existing target copies kept)"
  fi

  # serialize with the 5-min origin restage (deploy_origin.sh holds the same lock for
  # its whole run) so its rsync --delete cannot race the writes below
  if [ "$DRY" = 0 ]; then
    GITDIR="$(git -C "$REPO" rev-parse --absolute-git-dir 2>/dev/null || true)"
    if [ -n "$GITDIR" ]; then
      exec 9>"$GITDIR/deploy-origin.lock"
      flock -w 900 9 || log "WARN: could not take deploy-origin.lock within 900s — proceeding unlocked"
    fi
  fi

  # 2c. landing manifest (see header): written BEFORE the rsync so any later restage
  # preserves the full new surface
  if [ "$DRY" = 0 ] && [ -n "$DIST" ]; then
    {
      echo "# generated by scripts/deploy_goalworld_site.sh — landing-owned paths in the"
      echo "# served tree; scripts/pages/stage_public_tree.py preserves these verbatim"
      echo "# across deploy_origin.sh restages. Regenerated on every landing deploy."
      ( cd "$DIST" && find . -type f | sed 's|^\./||' | LC_ALL=C sort )
    } > "$MANIFEST.tmp"
    mv "$MANIFEST.tmp" "$MANIFEST"
    log "landing manifest: $(grep -cv '^#' "$MANIFEST") paths -> $MANIFEST"
  fi

  # 3. backup the deploy surface (or the full tree with --full-backup)
  mkdir -p "$BACKUP_DIR"
  STAMP="$(ts)"
  BK="$BACKUP_DIR/${STAMP}-${SHA}.tar.gz"
  mkdir -p "$TARGET"
  if [ -n "$DIST" ]; then
    if [ "$FULL_BACKUP" = 1 ]; then
      log "backup (FULL target) -> $BK"
      [ "$DRY" = 1 ] || tar -czf "$BK" -C "$TARGET" .
    else
      # only the paths this deploy will overwrite (nothing is ever deleted)
      LIST="$BACKUP_DIR/${STAMP}-${SHA}.paths"
      ( cd "$DIST" && find . -type f | sed 's|^\./||' ) > "$LIST.tmp"
      : > "$LIST"
      while read -r p; do
        case "$p" in
          # content-stable 64 MB press-kit zip: kept out of backups (it is preserved
          # across restages via the landing manifest and never changes content)
          */PressKit_GoalChain.zip) continue ;;
        esac
        if [ -e "$TARGET/$p" ]; then echo "$p" >> "$LIST"; fi
      done < "$LIST.tmp"
      rm -f "$LIST.tmp"
      log "backup (deploy surface: $(wc -l < "$LIST") existing paths) -> $BK"
      if [ "$DRY" = 0 ]; then
        if [ -s "$LIST" ]; then
          tar -czf "$BK" -C "$TARGET" -T "$LIST"
        else
          tar -czf "$BK" -C "$TARGET" --files-from /dev/null
        fi
      fi
    fi
  fi

  # 4. rsync dist/ into the target — merge mode, no --delete (see header)
  log "rsync dist/ -> $TARGET"
  if [ "$DRY" = 1 ]; then
    if [ -n "$DIST" ]; then
      rsync -ain --out-format='  %n%L' "$DIST/" "$TARGET/" | head -40
    else
      echo "  (dry-run: no build output yet to preview)"
    fi
    echo "  (dry-run: nothing written; backup not created)"
    exit 0
  fi
  rsync -a "$DIST/" "$TARGET/"
  chmod -R a+rX "$TARGET" 2>/dev/null || true

  # sanity: the hub must exist after deploy (bind mount stays intact)
  [ -s "$TARGET/index.html" ] || { echo "SANITY FAILED: target has no index.html" >&2; exit 1; }
  log "deploy done: $(basename "$BK") is the rollback point"
  log "  rollback with: $0 rollback --target $TARGET"
}

case "$CMD" in
  rollback) do_rollback ;;
  deploy) do_deploy ;;
esac
