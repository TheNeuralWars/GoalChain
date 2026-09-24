# FC-S07 QC — 2026-09-11T07:04:07Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S07_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S08 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S07_gen_20260911_065615.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S07_run_20260911T070159Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S07_status.json
- ffprobe: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S07_ffprobe.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S07-01 | xAI API | xAI API |
| FC-S07-02 | xAI API | xAI API |
| FC-S07-03 | xAI API | xAI API |
| FC-S07-04 | xAI API | xAI API |
| FC-S07-05 | xAI API | xAI API |
| FC-S07-06 | xAI API | xAI API |
| FC-S07-07 | xAI API | xAI API |
| FC-S07-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S07-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -20.0 / -6.5 |
| FC-S07-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -19.3 / -6.7 |
| FC-S07-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -16.6 / -2.8 |
| FC-S07-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -29.7 / -13.7 |
| FC-S07-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -23.1 / -10.3 |
| FC-S07-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -20.4 / -2.6 |
| FC-S07-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-07.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -35.5 / -22.1 |
| FC-S07-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07-08.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -22.2 / -1.3 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S07/FC-S07_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / AAC stereo esperado; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: aac 44100Hz stereo (NO mute); mean **-20.9 dB** / max **-1.3 dB**
- size: 13563764 bytes
- nota: Non-monotonic DTS warnings posibles en concat (mismo patrón S01–S06); duración OK

## Failures
- ninguna

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S08 storyboard ausente -> next_pending null

## Ledger
- FC-S07 status: rendered_8_8
- FC-S01 / FC-S02 / FC-S03 / FC-S04 / FC-S05 / FC-S06: intactos
- next_pending: null
