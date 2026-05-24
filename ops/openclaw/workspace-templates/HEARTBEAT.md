# HEARTBEAT — GoalChain ops checks

On each heartbeat, do this in order (lightweight; skip if nothing changed since last run):

1. Run: `bash ~/hermes/scripts/sync.sh` — note if pull changed files
2. Run: `bash ~/hermes/scripts/openclaw-context.sh` — use output as status basis
3. If open PRs or blocked briefs changed, append a 3–8 line summary to `memory/YYYY-MM-DD.md` (today UTC date)
4. If economy health URL is configured in `~/hermes/config.env` and health fails, flag P1 to Nico

Do **not** spawn implementation work on heartbeat — only observe and record.

If Nico asked for silence, respect `memory/heartbeat-quiet.md` if present.
