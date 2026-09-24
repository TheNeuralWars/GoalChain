# FC-S02 QC — 2026-09-11T05:39:44Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado en renders finales
- token: present (len 838) — secretos no impresos
- smoke FC-S02-01: OK -> full gen lanzada
- cut: si (FC-S02_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S03 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token_present True len 838
- Nota: primer intento full (05:27Z) API HTTP 403 transient -> fallback CLI sin timeout (colgado ~4min); proceso matado. Smoke+full posteriores: API 200 OK.

## Logs
- smoke: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S02_smoke_20260911_053130.log
- gen (abortado CLI hang): /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S02_gen_20260911_052705.log
- gen (ok): /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S02_gen_20260911_053232.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S02_run_20260911T053727Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S02_status.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S02-01 | xAI API (smoke) | xAI API (smoke) |
| FC-S02-02 | xAI API | xAI API |
| FC-S02-03 | xAI API | xAI API |
| FC-S02-04 | xAI API | xAI API |
| FC-S02-05 | xAI API | xAI API |
| FC-S02-06 | xAI API | xAI API |
| FC-S02-07 | xAI API | xAI API |
| FC-S02-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S02-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-01.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -24.6 / -10.9 |
| FC-S02-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-02.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -26.0 / -11.4 |
| FC-S02-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-03.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -26.3 / -11.9 |
| FC-S02-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-04.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -24.2 / -10.5 |
| FC-S02-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-05.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -26.9 / -14.3 |
| FC-S02-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-06.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -25.9 / -9.3 |
| FC-S02-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-07.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -19.4 / -1.8 |
| FC-S02-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02-08.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -22.5 / -9.8 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S02/FC-S02_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / 44100 AAC stereo; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: AAC 44.1kHz stereo (NO mute); mean **-23.7 dB** / max **-1.8 dB**
- size: 13840257 bytes

## Failures
- ninguna en renders finales
- incidente operativo: 1x API 403 transient + CLI hang (abortado); no cuenta como shot fail

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S03 storyboard ausente -> next_pending null

## Ledger
- FC-S02 status: rendered_8_8
- FC-S01: intacto
- next_pending: null
