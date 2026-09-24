# FC-S04 QC — 2026-09-11T06:14:04Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S04_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S05 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S04_gen_20260911_060612.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S04_run_20260911T061206Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S04_status.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S04-01 | xAI API | xAI API |
| FC-S04-02 | xAI API | xAI API |
| FC-S04-03 | xAI API | xAI API |
| FC-S04-04 | xAI API | xAI API |
| FC-S04-05 | xAI API | xAI API |
| FC-S04-06 | xAI API | xAI API |
| FC-S04-07 | xAI API | xAI API |
| FC-S04-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S04-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -23.2 / -10.2 |
| FC-S04-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -30.2 / -14.2 |
| FC-S04-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -25.7 / -6.8 |
| FC-S04-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -25.5 / -11.1 |
| FC-S04-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -20.2 / -8.2 |
| FC-S04-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -29.0 / -14.0 |
| FC-S04-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-07.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -19.8 / -6.8 |
| FC-S04-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04-08.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -20.8 / -0.8 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S04/FC-S04_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / 44100 AAC stereo; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: AAC 44100Hz stereo (NO mute); mean **-22.9 dB** / max **-0.8 dB**
- size: 14497268 bytes
- nota: Non-monotonic DTS warnings posibles en concat (mismo patrón S01–S03); duración OK

## Failures
- ninguna

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S05 storyboard ausente -> next_pending null

## Ledger
- FC-S04 status: rendered_8_8
- FC-S01 / FC-S02 / FC-S03: intactos
- next_pending: null

