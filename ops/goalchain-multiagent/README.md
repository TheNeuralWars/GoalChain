# goalchain-multiagent

Servicio **LangGraph** aislado para la “empresa de agentes” GoalChain. Hermes CEO llama por HTTP local; no modifica el runtime OpenClaw.

**Diseño:** [`docs/intake/2026-05-27-langgraph-agent-company.md`](../../docs/intake/2026-05-27-langgraph-agent-company.md)

## Desarrollo local

```bash
cd ops/goalchain-multiagent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GOALCHAIN_MULTIAGENT_ENABLED=1
export GOALCHAIN_MA_TOKEN=dev
export PYTHONPATH=.
pytest
uvicorn goalchain_multiagent.api:app --host 127.0.0.1 --port 8790
```

```bash
curl -s http://127.0.0.1:8790/health | python3 -m json.tool
curl -s -X POST http://127.0.0.1:8790/v1/run \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{"objective":"estado FCC y demo Mundial"}' | python3 -m json.tool
```

## VPS

```bash
./install-vps.sh
# Editar ~/.config/goalchain-multiagent.env
systemctl --user enable --now goalchain-multiagent.service
```

Puerto **8790** solo en loopback. Antigravity integra merge; Hermes añade hook `empresa:` cuando esté validado.

## Fase 1 — LLM real (CEO)

En `~/.config/goalchain-multiagent.env`:

```bash
GOALCHAIN_MA_MOCK_LLM=0
ANTHROPIC_API_KEY=sk-ant-...   # o OPENAI_API_KEY=sk-...
systemctl --user restart goalchain-multiagent.service
curl -s http://127.0.0.1:8790/health   # llm_ready: true
```

Si falla el LLM, el CEO vuelve a routing por reglas sin tumbar el servicio.
