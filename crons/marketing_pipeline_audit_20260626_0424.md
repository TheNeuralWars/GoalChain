# Marketing Pipeline Asset Uniqueness & Distribution Efficiency Audit - Fri Jun 26 04:24:51 UTC 2026

## 1. Asset Uniqueness Check

Checking for .grok/sessions paths in scripts...
No .groc/sessions paths found (checking for .grok/sessions)
./MARKETING_CHANGELOG.md:  - Per-invocation lock en `/home/ubuntu/.grok/sessions/.hermes_locks/` para
./MARKETING_CHANGELOG.md:  `~/.grok/sessions/` (fix repeated image bug)
./MARKETING_README.md:4. Each run locks `~/.grok/sessions/` for itself, generates fresh image +
./grok_super_pipeline.py:# ~/.grok/sessions/ before each generation, which could clobber an
./grok_super_pipeline.py:SESSION_LOCK_DIR = Path("/home/ubuntu/.grok/sessions") / ".hermes_locks"
./grok_super_pipeline.py:        f"find /home/ubuntu/.grok/sessions/ -maxdepth 8 \\( -name '*.jpg' -o -name '*.png' \\) "
./grok_super_pipeline.py:        "img_path=$(find /home/ubuntu/.grok/sessions/ -maxdepth 8 \\( -name '*.jpg' -o -name '*.png' \\) "
./grok_super_pipeline.py:        "vid_path=$(find /home/ubuntu/.grok/sessions/ -maxdepth 8 -name '*.mp4' -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "

Checking runs.json for duplicate captions and image URLs in last 48 runs...
Last 48 runs:
    "post_text": "\ud83d\udcd0 Fuera de juego. Por 2 cent\u00edmetros. Gol anulado.\n\nMillones de d\u00f3lares en apuestas destruidos en 30 segundos por una l\u00ednea del VAR en el Mundial 2026.\n\nFan\u00e1ticos prometieron: \"Si meten ese gol, dono $500 a caridad.\" El VAR dijo no. La promesa qued\u00f3 en el limbo. Ni gol, ni apuesta, ni caridad.\n\nEn GoalChain las reglas son TU contrato en Solana. T\u00fa defines las condiciones. Verificables on-chain. Sin \u00e1rbitros emocionales. Sin l\u00edneas milim\u00e9tricas que te roben el sue\u00f1o.\n\nEl VAR no perdona. Tu contrato inteligente, s\u00ed te da control. \u26a1\n\n\ud83d\udd17 goalchain.fun\n\n#GoalChain #VAR #Mundial2026 #Solana #SmartContracts",
    "image_prompt": "Abstract digital courtroom scene, giant holographic offside line slicing through a frozen football mid-air, shattered betting chips and crypto coins scattering below like glass fragments, dark purple and neon green cyberpunk aesthetic, premium 3D cinematic render, dramatic top-down angle, no human faces, no text",
    "video_prompt": "Holographic offside line pulses red then fractures, frozen football slowly rotates, betting chips shatter and fall in slow motion, camera orbits around the scene, neon particles explode outward, dramatic bass-drop visual shake at fracture moment",
    "comments": []
  },
  {
    "id": "run_1782223691_goalchainsol_planned",
    "timestamp": "2026-06-23T14:08:11.809237Z",
    "account_name": "GoalChainSol",
    "topic": "Juli\u00e1n \u00c1lvarez: El H\u00e9roe Que Nadie Apost\u00f3",

Checking for duplicate captions:
Note: Detailed duplicate check requires parsing JSON. Placeholder.

## 2. Frequency and Spam Check

Checking schedule_optimizer.py for minimum 3-hour gap enforcement...
No explicit 3-hour gap found

Checking for retry logic in pipeline_daemon.py...
36:    except Exception as e:
54:    except Exception as e:
122:    except Exception as e:
185:    except Exception as e:
223:    except Exception as e:
247:    except Exception as e:
259:    except Exception as e:
273:    except Exception as e:
287:            except Exception:
295:        except Exception as e:

## 3. Output Summary

Asset uniqueness score: [To be computed from runs.json]
Compliance analysis: [To be computed from schedule_optimizer.py and pipeline_daemon.py]
Mitigation guide: [To be based on platform policies]
