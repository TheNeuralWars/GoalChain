#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# scan_film_continuity.sh -- Fractured Code film QC runner (GoalChain)
#
# Wraps ContinuityGuard (local, zero-network) with the GoalChain-specific
# staging + reporting pipeline in cg_continuity_core.py.
#
#   ./scan_film_continuity.sh                     # all scenes with a cut
#   ./scan_film_continuity.sh --scenes FC-S01 FC-S03
#   ./scan_film_continuity.sh --all
#   ./scan_film_continuity.sh --skip-face         # physics passes only
#
# Outputs (default --out-dir):
#   film_continuity_report.json     aggregated, machine-readable
#   film_continuity_report.md       human summary
#   continuityguard_report.json     raw ContinuityGuard scan JSON per pass
#
# Read-only with respect to the renders: nothing is re-encoded or regenerated.
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE="${SCRIPT_DIR}/cg_continuity_core.py"

FILM_ROOT="${FILM_ROOT:-/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM}"
OUT_DIR="${OUT_DIR:-/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard}"
CG_BIN="${CG_BIN:-/data/apps/tools/node_modules/.bin/continuityguard}"
CG_PY="${CG_PY:-/data/apps/tools/cg-venv/bin/python}"
CG_FPS="${CG_FPS:-2.3}"
FACE_FPS="${FACE_FPS:-1.0}"

SCENES=()
SKIP_FACE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scenes)      shift; while [[ $# -gt 0 && "$1" != --* ]]; do SCENES+=("$1"); shift; done ;;
    --all)         SCENES=(); shift ;;
    --out-dir)     OUT_DIR="$2"; shift 2 ;;
    --film-root)   FILM_ROOT="$2"; shift 2 ;;
    --cg-fps)      CG_FPS="$2"; shift 2 ;;
    --face-fps)    FACE_FPS="$2"; shift 2 ;;
    --skip-face)   SKIP_FACE=1; shift ;;
    -h|--help)     sed -n '2,25p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 64 ;;
  esac
done

fail=0
[[ -x "$CG_BIN" || -f "$CG_BIN" ]] || { echo "FAIL: ContinuityGuard CLI not found at $CG_BIN" >&2; fail=1; }
[[ -f "$CORE" ]]                   || { echo "FAIL: core script missing: $CORE" >&2; fail=1; }
command -v ffmpeg  >/dev/null      || { echo "FAIL: ffmpeg not on PATH" >&2; fail=1; }
command -v ffprobe >/dev/null      || { echo "FAIL: ffprobe not on PATH" >&2; fail=1; }
if [[ "$SKIP_FACE" -eq 0 ]]; then
  [[ -x "$CG_PY" ]] || { echo "FAIL: face-crop venv python not found at $CG_PY (or use --skip-face)" >&2; fail=1; }
fi
[[ -d "$FILM_ROOT/renders" ]]      || { echo "FAIL: no renders dir under $FILM_ROOT" >&2; fail=1; }
[[ "$fail" -eq 0 ]] || exit 1

mkdir -p "$OUT_DIR"

ARGS=(--film-root "$FILM_ROOT" --out-dir "$OUT_DIR" --cg-bin "$CG_BIN"
      --cg-python "$CG_PY" --fps "$CG_FPS" --face-fps "$FACE_FPS")
if [[ ${#SCENES[@]} -gt 0 ]]; then
  ARGS+=(--scenes "${SCENES[@]}")
fi
[[ "$SKIP_FACE" -eq 1 ]] && ARGS+=(--skip-face)

echo "[scan_film_continuity] film root : $FILM_ROOT"
echo "[scan_film_continuity] out dir   : $OUT_DIR"
echo "[scan_film_continuity] scenes    : ${SCENES[*]:-<all with a cut>}"
echo "[scan_film_continuity] cg fps    : $CG_FPS   face fps: $FACE_FPS"

exec python3 "$CORE" "${ARGS[@]}"
