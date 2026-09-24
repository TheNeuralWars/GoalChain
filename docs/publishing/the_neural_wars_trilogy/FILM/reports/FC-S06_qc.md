# FC-S06 QC — 2026-09-11T06:43:25Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S06_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S07 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S06_gen_20260911_063536.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S06_run_20260911T064158Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S06_status.json
- ffprobe: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S06_ffprobe.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S06-01 | xAI API | xAI API |
| FC-S06-02 | xAI API | xAI API |
| FC-S06-03 | xAI API | xAI API |
| FC-S06-04 | xAI API | xAI API |
| FC-S06-05 | xAI API | xAI API |
| FC-S06-06 | xAI API | xAI API |
| FC-S06-07 | xAI API | xAI API |
| FC-S06-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S06-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -17.7 / -4.7 |
| FC-S06-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -15.7 / -1.2 |
| FC-S06-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -21.1 / -6.8 |
| FC-S06-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -21.9 / -6.2 |
| FC-S06-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -14.4 / -0.3 |
| FC-S06-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -25.3 / -9.9 |
| FC-S06-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-07.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -31.9 / -15.9 |
| FC-S06-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06-08.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -21.1 / -2.6 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S06/FC-S06_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / AAC stereo esperado; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: aac 44100Hz stereo (NO mute); mean **-18.8 dB** / max **-0.0 dB**
- size: 16964998 bytes
- nota: Non-monotonic DTS warnings posibles en concat (mismo patrón S01–S05); duración OK

## Failures
- ninguna

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S07 storyboard ausente -> next_pending null

## Ledger
- FC-S06 status: rendered_8_8
- FC-S01 / FC-S02 / FC-S03 / FC-S04 / FC-S05: intactos
- next_pending: null

