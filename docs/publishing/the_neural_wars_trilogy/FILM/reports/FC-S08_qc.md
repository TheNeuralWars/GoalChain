# FC-S08 QC — 2026-09-11T07:29:08Z

## Resumen
- attempted: **8** / ok: **6** / fail: **2**
- backend: **xAI API directa** (auth.json) para 01–06; CLI fallback intentado en 07–08 (**402 Grok Build usage balance exhausted**)
- token: present (auth.x.ai key dict) — secretos no impresos
- cut: si (FC-S08_cut_v1.mp4) con 6 shots
- publish: no / manuscript: no tocado
- next_pending: **null** (FC-S09 storyboard ausente)
- stop rule: 3 fallos idénticos API 403 + CLI 402 en 07/08 → stop

## Auth
- /home/ubuntu/.grok/auth.json legible; token via auth.x.ai entry

## Logs
- gen: reports/FC-S08_gen_20260911_071851.log
- retries: reports/FC-S08_gen_retry1_*.log, reports/FC-S08_gen_retry2_*.log
- run sidecar: reports/FC-S08_run_*.json
- status: reports/FC-S08_status.json
- ffprobe: reports/FC-S08_ffprobe.json

## API vs CLI
| Shot | Image | Video |
|------|-------|-------|
| FC-S08-01 | xAI API | xAI API |
| FC-S08-02 | xAI API | xAI API |
| FC-S08-03 | xAI API | xAI API |
| FC-S08-04 | xAI API | xAI API |
| FC-S08-05 | xAI API | xAI API |
| FC-S08-06 | xAI API | xAI API |
| FC-S08-07 | xAI API (PNG OK) | FAIL API 403 → CLI 402 |
| FC-S08-08 | FAIL API 403 → CLI 402 | n/a |

## Renders (ffprobe + volumedetect)
| Shot | abs path | dur | res | audio | mean/max dB |
|------|----------|-----|-----|-------|-------------|
| FC-S08-01 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-01.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -25.1 / -12.1 |
| FC-S08-02 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-02.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -26.0 / -8.7 |
| FC-S08-03 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-03.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -32.0 / -17.8 |
| FC-S08-04 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-04.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -29.9 / -11.5 |
| FC-S08-05 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-05.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -15.1 / -2.7 |
| FC-S08-06 | /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08-06.mp4 | 8.042s | 848x480 | aac 44100Hz stereo (NO mute) | -17.5 / -5.3 |

## Cut
- path: /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-S08/FC-S08_cut_v1.mp4
- method: ffmpeg concat demuxer -c copy (solo shots OK 01–06; sin normalize)
- shots_included: FC-S08-01, FC-S08-02, FC-S08-03, FC-S08-04, FC-S08-05, FC-S08-06
- duration: **48.273s**
- video: h264 848x480
- audio: aac 44100Hz stereo (NO mute); mean **-20.3 dB** / max **-2.7 dB**
- size: 12482924 bytes
- nota: Non-monotonic DTS warnings posibles en concat (mismo patrón S01–S07); duración OK

## Failures
- **FC-S08-07**: API video 403 Forbidden then CLI fallback 402 Grok Build usage balance exhausted; PNG kept; 3 identical retries stopped
- **FC-S08-08**: API image 403 Forbidden then CLI fallback 402 Grok Build usage balance exhausted; no PNG/MP4; 3 identical retries stopped

## Blockers
- **xAI API 403 Forbidden** en video submit/poll a partir de FC-S08-07 (y image en 08)
- **Grok CLI 402** Grok Build usage balance exhausted (fallback inutilizable)
- approved: ninguno (shots_approved=[])
- no publish
- FC-S09 storyboard ausente -> next_pending null

## Ledger
- FC-S08 status: rendered_6_8
- FC-S01 / FC-S02 / FC-S03 / FC-S04 / FC-S05 / FC-S06 / FC-S07: intactos
- next_pending: null
