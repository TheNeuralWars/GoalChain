#!/bin/bash
# Rebuild i2v videos for every Neural Wars scene (parallel, novel_film_builder).
# Requires: per-shot .mp4 already removed so --skip-existing regenerates video only
# and reuses the existing still (.png).
set -u
FILM=/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM
BUILDER=/data/apps/GoalChain/scripts/video_automation/novel_film_builder.py
LOGS=/data/apps/GoalChain/scripts/video_automation/nw_regen_20260914/logs
mkdir -p "$LOGS"
CONC=4

run_one () {
  local scene="$1"
  python3 "$BUILDER" --storyboard "$FILM/scenes/${scene}.json" --outdir "$FILM" \
      --skip-existing --max-shots 8 > "$LOGS/build_${scene}_$(date +%H%M%S).log" 2>&1
}

for scene in FC-S01 FC-S02 FC-S03 FC-S04 FC-S05 FC-S06 FC-S07 FC-S08; do
  while [ "$(jobs -rp | wc -l)" -ge "$CONC" ]; do wait -n; done
  run_one "$scene" &
  echo "launched $scene pid=$!"
done
wait
echo "ALL SCENES DONE"
