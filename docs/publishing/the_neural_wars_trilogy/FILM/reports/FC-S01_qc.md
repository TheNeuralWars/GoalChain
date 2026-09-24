# FC-S01 QC — 2026-09-10 23:25:29Z

## Resumen
- attempted: **8** / ok: **8** / fail: **0**
- backend: **xAI API directa** (preferida via auth.json); CLI solo fallback en video FC-S01-08
- token: present (len 838) — secretos no impresos
- smoke FC-S01-01: OK -> full gen lanzada
- cut: si (FC-S01_cut_v1.mp4)
- publish: no / manuscript: no tocado

## Auth
- /home/ubuntu/.grok/auth.json legible; token_present True len 838

## Logs
- smoke: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S01_smoke_api_20260910_230438.log
- gen: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S01_gen_api_20260910_230530.log
- run sidecar: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S01_run_20260910T232255Z.json
- status: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/FC-S01_status.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S01-01 | xAI API | xAI API (smoke) |
| FC-S01-02 | xAI API | xAI API |
| FC-S01-03 | xAI API | xAI API |
| FC-S01-04 | xAI API | xAI API (polling warnings: timeout + DNS -3, recovered) |
| FC-S01-05 | xAI API | xAI API |
| FC-S01-06 | xAI API | xAI API |
| FC-S01-07 | xAI API | xAI API |
| FC-S01-08 | xAI API | **CLI fallback** (API download SSL handshake timeout tras status=done) |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S01-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-01.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -34.6 / -19.3 |
| FC-S01-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-02.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -27.0 / -8.1 |
| FC-S01-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-03.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -20.6 / -2.6 |
| FC-S01-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-04.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -24.4 / -11.4 |
| FC-S01-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-05.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -16.1 / -1.0 |
| FC-S01-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-06.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -30.3 / -8.7 |
| FC-S01-07 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-07.mp4 | 8.042s | 848x480 | AAC 44.1kHz stereo (NO mute) | -17.5 / -1.8 |
| FC-S01-08 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-08.mp4 | 6.042s | 736x400 | AAC 48kHz stereo (NO mute) | -22.3 / -6.1 |

PNG: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01-01.png ... FC-S01-08.png (todos existen).

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S01/FC-S01_cut_v1.mp4
- method: ffmpeg concat demuxer; FC-S01-08 pre-normalizado -> FC-S01-08_norm.mp4 (848x480 / 44100) por mismatch de res/sample_rate
- duration: **62.356s** (~1:02)
- video: h264 848x480
- audio: AAC 44.1kHz stereo — mean **-21.0 dB** / max **-1.0 dB** (NO mute)
- size: 20789431 bytes
- nota: avisos non-monotonic DTS en audio al unir con -c copy; cut reproducible

## Failures
- ninguna shot fallida (ok=8 fail=0)
- no se aplico stop-after-3
- aviso no bloqueante: FC-S01-04 polling timeouts/DNS; recupero via API
- aviso no bloqueante: FC-S01-08 video API SSL timeout -> CLI OK

## next_pending
null — FC-S01 completo (8/8). No hay FC-S02+ en ledger.

## blockers
1. Preparar siguiente storyboard (FC-S02+) antes de continuar generacion.
2. Homogeneizar resolucion FC-S01-08 nativo (736x400 CLI) si se regenera; cut ya usa version normalizada.
3. No publish / no manuscript edits (cumplido).
