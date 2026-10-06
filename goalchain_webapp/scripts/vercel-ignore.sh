#!/usr/bin/env bash
# Vercel "Ignored Build Step" (vercel.json ignoreCommand) for the goalchain_webapp project.
#
# Contract: exit 0 = skip this build (deployment CANCELED), exit 1 = continue building.
# Runs from the project Root Directory (goalchain_webapp/) on Vercel, but every git
# path below is anchored at the repository toplevel so it also works from the repo root.
#
# Rule: build only when the pushed change touches goalchain_webapp/ or goalchain-sdk/
# (the webapp depends on ../goalchain-sdk). Anything else (landing site, docs, ops,
# scripts) cancels the webapp build.
set -u

# Not a git checkout (e.g. `vercel deploy` tarball upload): never skip — just build.
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "ignore: not a git checkout — building"; exit 1; }

CUR="${VERCEL_GIT_COMMIT_SHA:-HEAD}"
if ! git -C "$ROOT" rev-parse --verify -q "${CUR}^{commit}" >/dev/null; then
  echo "ignore: cannot resolve current commit '$CUR' — building"
  exit 1
fi

PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$PREV" ] || ! git -C "$ROOT" rev-parse --verify -q "${PREV}^{commit}" >/dev/null; then
  # Fallback: single-commit diff. Unknown parent (root commit / shallow clone) -> build.
  PREV="$(git -C "$ROOT" rev-parse --verify -q "${CUR}^" 2>/dev/null || true)"
fi
if [ -z "$PREV" ]; then
  echo "ignore: no previous commit to diff against — building"
  exit 1
fi

if git -C "$ROOT" diff --quiet "$PREV" "$CUR" -- goalchain_webapp goalchain-sdk; then
  echo "ignore: no changes under goalchain_webapp/ or goalchain-sdk/ ($PREV..$CUR) — skipping build"
  exit 0
fi

echo "ignore: changes under goalchain_webapp/ or goalchain-sdk/ ($PREV..$CUR) — building"
exit 1
