# FC-S03 QC — 2026-09-11T05:54:35Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (auth.json); CLI no usado
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S03_cut_v1.mp4)
- publish: no / manuscript: no tocado
- next_pending: null (FC-S04 storyboard ausente)

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S03_gen_20260911_054716.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S03_run_20260911T055302Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S03_status.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S03-01 | xAI API | xAI API |
| FC-S03-02 | xAI API | xAI API |
| FC-S03-03 | xAI API | xAI API |
| FC-S03-04 | xAI API | xAI API |
| FC-S03-05 | xAI API | xAI API |
| FC-S03-06 | xAI API | xAI API |
| FC-S03-07 | xAI API | xAI API |
| FC-S03-08 | xAI API | xAI API |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S03-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -37.2 / -23.6 |
| FC-S03-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -29.2 / -13.1 |
| FC-S03-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -30.5 / -15.4 |
| FC-S03-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -22.2 / -6.7 |
| FC-S03-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -28.4 / -11.1 |
| FC-S03-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -27.0 / -12.0 |
| FC-S03-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-07.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -32.5 / -18.0 |
| FC-S03-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03-08.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -20.0 / -3.5 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S03/FC-S03_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (todos ya 848x480 / 44100 AAC stereo; sin normalize)
- duration: **64.356s**
- video: h264 848x480
- audio: AAC 44.1kHz stereo (NO mute); mean **-25.5 dB** / max **-3.6 dB**
- size: 11879385 bytes
- nota: Non-monotonic DTS warnings en concat (mismo patrón S01/S02); duración OK

## Failures
- ninguna

## Blockers
- ninguno para montaje/QC
- approved: ninguno (shots_approved=[])
- no publish
- FC-S04 storyboard ausente -> next_pending null

## Ledger
- FC-S03 status: rendered_8_8
- FC-S01 / FC-S02: intactos
- next_pending: null

