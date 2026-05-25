# Free Claude Code (FCC) — Proveedores en Hermes

Repo upstream: [Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code)

FCC corre en el VPS como **`fcc-server`** (proxy Anthropic-compatible). El code agent (`oa-worker` → `fcc-claude`) y el Admin UI leen **`~/.fcc/.env`**.

## Regla de oro: prefijo + slug

Cada request usa un slug con **prefijo de proveedor**:

```text
<proveedor>/<modelo-en-ese-proveedor>
```

Ejemplos:

| Proveedor FCC | Variable de API / URL | Ejemplo de `MODEL` |
|---------------|------------------------|---------------------|
| 1 NVIDIA NIM | `NVIDIA_NIM_API_KEY` | `nvidia_nim/nvidia/nemotron-3-super-120b-a12b` |
| 2 OpenRouter | `OPENROUTER_API_KEY` | `open_router/qwen/qwen3-coder-next` |
| 3 Gemini | `GEMINI_API_KEY` | `gemini/gemini-2.5-flash` |
| 4 DeepSeek | `DEEPSEEK_API_KEY` | `deepseek/deepseek-chat` |
| 5 Mistral | `MISTRAL_API_KEY` | `mistral/devstral-small-latest` |
| 6 Codestral | `CODESTRAL_API_KEY` | `mistral_codestral/codestral-latest` |
| 7 OpenCode Zen | `OPENCODE_API_KEY` | `opencode/gpt-5.3-codex` |
| 8 OpenCode Go | `OPENCODE_API_KEY` | `opencode_go/minimax-m2.7` |
| 9 Wafer | `WAFER_API_KEY` | `wafer/DeepSeek-V4-Pro` |
| 10 Kimi | `KIMI_API_KEY` | `kimi/kimi-k2.5` |
| 11 Cerebras | `CEREBRAS_API_KEY` | `cerebras/gpt-oss-120b` |
| 12 Groq | `GROQ_API_KEY` | `groq/llama-3.3-70b-versatile` |
| 13 Fireworks | `FIREWORKS_API_KEY` | `fireworks/accounts/fireworks/models/...` |
| 14 Z.ai | `ZAI_API_KEY` | `zai/glm-5.1` |
| **15 LM Studio** | **`LM_STUDIO_BASE_URL`** (sin API key en FCC) | `lmstudio/qwen/qwen3-coder-next` |
| **16 llama.cpp** | **`LLAMACPP_BASE_URL`** | `llamacpp/mi-modelo-local` |
| **17 Ollama** | **`OLLAMA_BASE_URL`** | `ollama/llama3.1` |

Proveedores **1–14**: pegás la API key en el Admin UI (o `fcc.secrets.env`) y elegís el slug en [la lista de modelos del proveedor](https://openrouter.ai/models), NIM, etc.

Proveedores **15–17**: **no llevan API key en FCC**. Solo URL local donde ya corre el servidor de inferencia.

## ¿Por qué los enlaces de LM Studio no son API keys?

URLs como `https://lmstudio.ai/lmstudio/qwen/qwen3-coder-next` son la **ficha del modelo**. El identificador es la parte final:

- Catálogo LM Studio: `qwen/qwen3-coder-next`
- En FCC (si tuvieras LM Studio local): `lmstudio/qwen/qwen3-coder-next`

La key `sk-...` suele ser **OpenRouter**, **LM Studio auth** (si activás tokens en el server local), u otro proveedor cloud — no la URL de la página del modelo.

## Hermes VPS: ¿instalar LM Studio con modelos de 50GB?

**No recomendado** en `178.105.148.109` salvo que tengas cientos de GB libres en disco y GPU/RAM para inferencia.

| Opción | Disco | Cuándo usarla |
|--------|-------|----------------|
| **Cloud (recomendado)** | ~0 en VPS | OpenRouter + NVIDIA NIM + Groq + keys que ya tenés |
| LM Studio en el VPS | 50GB+ por modelo | Solo con GPU grande y disco dedicado |
| LM Studio en tu Mac + túnel | Modelos en tu PC | Avanzado; el VPS apunta `LM_STUDIO_BASE_URL` a un túnel SSH |
| Ollama modelos pequeños | 4–8GB | Alternativa local ligera (`ollama pull` modelos 7B–14B) |

## Equivalentes cloud de los modelos que querés (catálogo LM Studio)

Sin instalar esos GGUF en el servidor, podés acercarte así en FCC:

| Modelo (catálogo LM Studio) | Ruta FCC sugerida (cloud) |
|-----------------------------|---------------------------|
| `qwen/qwen3-coder-next` | `open_router/qwen/qwen3-coder-next` (código) |
| `qwen/qwen3.6-35b-a3b` | `open_router/qwen/qwen3.6-35b-a3b` o NIM si aparece en [build.nvidia.com](https://build.nvidia.com) |
| `nvidia/nemotron-3-super` | `nvidia_nim/nvidia/nemotron-3-super-120b-a12b` |
| `nvidia/nemotron-3-nano-omni` | Buscar slug en NIM / OpenRouter |
| `google/gemma-4-31b` | `gemini/gemini-2.5-flash` o slug OpenRouter equivalente |
| `ibm/granite-4.1-30b` | OpenRouter / NIM (nombre puede variar) |
| `zai-org/glm-4.7-flash` | `open_router/z-ai/glm-4.7-flash` o `zai/glm-5.1` |

Los nombres exactos en OpenRouter a veces difieren (`:free`, sufijos, etc.). Si un slug falla en smoke, abrí [openrouter.ai/models](https://openrouter.ai/models) y copiá el id tal cual.

## Hermes / Discord — routing automático (sin memorizar modelos)

GoalChain no pide slugs en chat. Flujo:

1. **Hermes** crea issue con `create-task.sh opencode P0|P1|P2 ...`
2. **`oa-worker`** → `fcc-resolve-tier.sh` → `opus` | `sonnet` | `haiku`
3. **`oa-run-code.sh`** → `fcc-claude --model <tier>` → FCC proxy usa `MODEL_OPUS` / `MODEL_SONNET` / `MODEL_HAIKU` en `~/.fcc/.env`

Configurás los proveedores **una vez** en `fcc.secrets.env` (sección 18 de [free-claude-code](https://github.com/Alishahryar1/free-claude-code)).

## Mezclar proveedores por tier (sección 18 del README)

FCC permite que Opus / Sonnet / Haiku usen proveedores distintos:

```bash
MODEL=open_router/qwen/qwen3-coder-next      # fallback
MODEL_OPUS=nvidia_nim/nvidia/nemotron-3-super-120b-a12b
MODEL_SONNET=open_router/qwen/qwen3-coder-next
MODEL_HAIKU=groq/llama-3.3-70b-versatile
```

Vacío = hereda `MODEL`.

## Configuración en el servidor

```bash
# 1) Editar secretos (nunca en git)
nano ~/hermes/fcc.secrets.env    # plantilla: ops/hermes/fcc.secrets.env.example

# 2) Aplicar a ~/.fcc/.env y reiniciar fcc-server
bash ~/hermes/scripts/configure-fcc-env.sh

# 3) Admin UI (desde tu Mac)
ssh -L 8082:127.0.0.1:8082 goalchain@178.105.148.109
# → http://127.0.0.1:8082/admin  (pegar keys, probar smoke)
```

Preset solo nube (sin LM Studio local):

```bash
cp ops/hermes/fcc.secrets.env.example ~/hermes/fcc.secrets.env
# Descomentar bloque FCC_CLOUD_PRESET=1 en el example y rellenar keys
bash ~/hermes/scripts/configure-fcc-env.sh
```

## Estado actual en Hermes (inspeccionado)

Keys con valor en `~/.fcc/.env`: `OPENROUTER`, `NVIDIA_NIM`, `CODESTRAL`, `DEEPSEEK`, `KIMI`, `WAFER`, `FIREWORKS`, `GROQ`.

Routing de código vía OpenRouter (`MODEL*` → `open_router/...`). **No hace falta LM Studio en el VPS** para seguir usando esos modelos por API.

## Referencias

- [FCC README — Choose A Provider](https://github.com/Alishahryar1/free-claude-code#choose-a-provider)
- [LM Studio + Claude Code](https://lmstudio.ai/docs/integrations/claude-code) (solo local)
- GoalChain: `ops/hermes/configure-fcc-env.sh`, `ai_context/HERMES_SETUP.md`
