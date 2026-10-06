#!/usr/bin/env bash
# deploy_goalworld_site.sh — deploy the GoalWorld landing (goalworld_site/) to a served tree.
#
# What it does (deploy subcommand, default):
#   1. fetch + check out a ref (default origin/main) in a DEDICATED deploy worktree
#      (never the live main checkouts at /home/ubuntu/GoalChain or /data/apps/GoalChain)
#   2. build goalworld_site -> dist/
#   3. back up every target file the deploy is about to touch into a timestamped tarball
#   4. rsync dist/ INTO the target (merge, never --delete: other pipelines depend on files
#      living in the target that are not part of the landing)
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

usage() { sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; }

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
        [ -e "$TARGET/$p" ] && echo "$p" >> "$LIST"
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
