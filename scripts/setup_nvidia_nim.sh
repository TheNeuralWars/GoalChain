#!/bin/bash
# Script to set NVIDIA NIM properly in goalchain-multiagent config

ENV_FILE="/home/ubuntu/.config/goalchain-multiagent.env"

# Load the working key (NVIDIA_API_KEY_1)
source /home/ubuntu/hermes/config.env

WORKING_KEY="${NVIDIA_API_KEY_1}"

if [ -z "$WORKING_KEY" ]; then
  echo "Error: NVIDIA_API_KEY_1 not found in /home/ubuntu/hermes/config.env"
  exit 1
fi

echo "Setting GOALCHAIN_MA_PROVIDER to nvidia..."
sed -i "s|^GOALCHAIN_MA_PROVIDER=.*|GOALCHAIN_MA_PROVIDER=nvidia|" "$ENV_FILE"

echo "Setting NVIDIA_NIM_API_KEY..."
if grep -q "^NVIDIA_NIM_API_KEY=" "$ENV_FILE"; then
  sed -i "s|^NVIDIA_NIM_API_KEY=.*|NVIDIA_NIM_API_KEY=${WORKING_KEY}|" "$ENV_FILE"
else
  echo "NVIDIA_NIM_API_KEY=${WORKING_KEY}" >> "$ENV_FILE"
fi

echo "Setting GOALCHAIN_MA_NVIDIA_MODEL to nvidia/nemotron-3-super-120b-a12b..."
if grep -q "^GOALCHAIN_MA_NVIDIA_MODEL=" "$ENV_FILE"; then
  sed -i "s|^GOALCHAIN_MA_NVIDIA_MODEL=.*|GOALCHAIN_MA_NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b|" "$ENV_FILE"
else
  echo "GOALCHAIN_MA_NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b" >> "$ENV_FILE"
fi

# Clean up any leftover OPENAI_API_KEY referencing nvapi just to be safe
sed -i "s|^OPENAI_API_KEY=nvapi.*|OPENAI_API_KEY=|" "$ENV_FILE"

echo "=== Config updated ==="
grep -E "PROVIDER|NVIDIA_NIM_API_KEY|GOALCHAIN_MA_NVIDIA_MODEL" "$ENV_FILE"

echo "=== Restarting goalchain-multiagent ==="
pkill -f "uvicorn goalchain_multiagent" || true
sleep 2

cd /home/ubuntu/goalchain-multiagent
nohup /home/ubuntu/goalchain-multiagent/.venv/bin/uvicorn goalchain_multiagent.api:app \
  --host 127.0.0.1 --port 8790 \
  >> /home/ubuntu/goalchain-multiagent.log 2>&1 &

echo "Restarted."
sleep 3
tail -n 20 /home/ubuntu/goalchain-multiagent.log
