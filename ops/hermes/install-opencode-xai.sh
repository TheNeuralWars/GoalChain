#!/usr/bin/env bash
# Ensure OpenCode xAI plugin is installed (required before providers login).
set -euo pipefail

mkdir -p "${HOME}/.opencode"
CONFIG="${HOME}/.opencode/opencode.json"

if [[ ! -f "${CONFIG}" ]]; then
  cat > "${CONFIG}" <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["xai"]
}
EOF
else
  if ! grep -q '"xai"' "${CONFIG}" 2>/dev/null; then
    python3 - <<'PY'
import json, os
path = os.path.expanduser("~/.opencode/opencode.json")
with open(path) as f:
    cfg = json.load(f)
plugins = cfg.get("plugin") or []
if "xai" not in plugins:
    plugins.append("xai")
    cfg["plugin"] = plugins
    with open(path, "w") as f:
        json.dump(cfg, f, indent=2)
        f.write("\n")
PY
  fi
fi

opencode plugin xai >/dev/null 2>&1 || opencode plugin xai
echo "xai plugin: installed"
echo "config: ${CONFIG}"
