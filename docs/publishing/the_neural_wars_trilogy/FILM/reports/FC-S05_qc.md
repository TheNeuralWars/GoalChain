# FC-S05 QC — 2026-09-11T06:28:10Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S05_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S06 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S05_gen_20260911_062051.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S05_run_20260911T062725Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S05_status.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S05-01 | xAI API | xAI API |
| FC-S05-02 | xAI API | xAI API |
| FC-S05-03 | xAI API | xAI API |
| FC-S05-04 | xAI API | xAI API |
| FC-S05-05 | xAI API | xAI API |
| FC-S05-06 | xAI API | xAI API |
| FC-S05-07 | xAI API | xAI API |
| FC-S05-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S05-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -25.0 / -6.9 |
| FC-S05-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -31.9 / -12.7 |
| FC-S05-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -19.4 / -6.1 |
| FC-S05-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -23.1 / -9.2 |
| FC-S05-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -32.6 / -16.7 |
| FC-S05-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -17.1 / -2.1 |
| FC-S05-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-07.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -23.9 / -10.1 |
| FC-S05-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05-08.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -14.4 / -1.1 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S05/FC-S05_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / AAC stereo; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: aac 44100Hz stereo (NO mute); mean **-20.0 dB** / max **-1.0 dB**
- size: 23053813 bytes
- nota: Non-monotonic DTS warnings posibles en concat (mismo patrón S01–S04); duración OK

## Failures
- ninguna

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S06 storyboard ausente -> next_pending null

## Ledger
- FC-S05 status: rendered_8_8
- FC-S01 / FC-S02 / FC-S03 / FC-S04: intactos
- next_pending: null
