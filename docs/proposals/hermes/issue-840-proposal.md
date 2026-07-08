# Proposal — Issue #840

## Title
[HERMES] [intake] Voice Task: integrate this new key on FCC ogw_live_07f829c98

## Objective
Integrate the new API key `ogw_live_07f829c9817a5e894f3cb4c1981ee77e` into the FCC (Free Claude Code) environment.

## Analysis
- The request asks to integrate a new key into "FCC".
- Based on `ops/goalchain-multiagent/goalchain_multiagent/fcc_env.py`, the FCC environment is loaded from `~/.fcc/.env`.
- The provided key is for an OpenAI-compatible gateway: `https://opengateway.gitlawb.com/v1`.
- The model to be used is `mimo-v2.5-pro`.

## Proposed Implementation

### 1. Update FCC Environment
I will create/update `~/.fcc/.env` to include the new API key and gateway configuration. 

Since the current `update_fcc_env.py` (found in `/home/ubuntu/`) is a helper script that overwrites the file with NVIDIA keys, I will instead create a specific script or use `terminal` to append/overwrite the configuration with the correct OpenGateway values.

**Target variables to set in `~/.fcc/.env`:**
- `OPENAI_API_KEY=ogw_live_07f829c9817a5e894f3cb4c1981ee77e`
- `OPENAI_API_BASE=https://opengateway.gitlawb.com/v1`
- `MODEL=mimo-v2.5-pro`

### 2. Verification
I will verify the integration by running a `curl` command from the terminal using the key to ensure the endpoint is reachable and the key is valid.

## File List
- `~/.fcc/.env` (Updated)

## Risks & Rollback
- **Risk:** Overwriting existing critical keys if other models were configured in `~/.fcc/.env`.
- **Rollback:** Restore `~/.fcc/.env` from a backup created before the change.

## Test Commands
```bash
curl https://opengateway.gitlawb.com/v1/chat/completions \
  -H "authorization: Bearer ogw_live_07f829c9817a5e894f3cb4c1981ee77e" \
  -H "content-type: application/json" \
  -d '{
    "model": "mimo-v2.5-pro",
    "messages": [{"role": "user", "content": "hello"}]
  }'
```

## Workflow
1. Backup `~/.fcc/.env`.
2. Write the new configuration to `~/.fcc/.env`.
3. Run the verification curl.
4. Close intake marker.
