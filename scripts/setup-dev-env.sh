#!/usr/bin/env bash
# GoalChain — instala Rust, Solana CLI, Anchor (AVM) y deps npm para build/test.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRAM_DIR="${ROOT}/goalchain_program"
CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}"
RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}"

export CARGO_HOME RUSTUP_HOME
export PATH="${CARGO_HOME}/bin:${HOME}/.local/bin:${HOME}/.local/share/solana/install/active_release/bin:${PATH}"

echo "==> GoalChain dev environment setup"
echo "    ROOT: ${ROOT}"

# --- Rust (pinned via goalchain_program/rust-toolchain.toml) ---
if ! command -v rustup >/dev/null 2>&1; then
  echo "==> Installing rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
fi
# shellcheck source=/dev/null
[[ -f "${CARGO_HOME}/env" ]] && source "${CARGO_HOME}/env"

cd "${PROGRAM_DIR}"
rustup show active-toolchain >/dev/null 2>&1 || rustup toolchain install
rustup component add rustfmt clippy 2>/dev/null || true
echo "    Rust: $(rustc --version)"

# --- Solana CLI (build-sbf + test-validator) ---
if ! command -v solana >/dev/null 2>&1; then
  echo "==> Installing Solana CLI (Anza release)..."
  sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
fi
export PATH="${HOME}/.local/share/solana/install/active_release/bin:${PATH}"
mkdir -p "${HOME}/.config/solana"
if [[ ! -f "${HOME}/.config/solana/id.json" ]]; then
  echo "==> Creating default Solana keypair (~/.config/solana/id.json)..."
  solana-keygen new --no-bip39-passphrase -s -o "${HOME}/.config/solana/id.json" --force
fi
solana config set --url localhost 2>/dev/null || true
echo "    Solana: $(solana --version)"

# --- Anchor Version Manager ---
if ! command -v avm >/dev/null 2>&1; then
  echo "==> Installing AVM (Anchor Version Manager)..."
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
fi

# Anchor 0.31+ aligns with anchor-lang 1.x in this repo
ANCHOR_VERSION="${ANCHOR_VERSION:-0.31.1}"
echo "==> Installing Anchor CLI ${ANCHOR_VERSION}..."
avm install "${ANCHOR_VERSION}" 2>/dev/null || avm install "${ANCHOR_VERSION}"
avm use "${ANCHOR_VERSION}"
echo "    Anchor: $(anchor --version)"

# --- Surfpool (Anchor 1.x local validator for `anchor test`) ---
if ! command -v surfpool >/dev/null 2>&1; then
  echo "==> Installing Surfpool (local validator for Anchor 1.x)..."
  curl -sL https://run.surfpool.run/ | bash
fi
echo "    Surfpool: $(surfpool --version 2>/dev/null || echo 'missing')"

# --- Node.js + npm (tests use ts-mocha) ---
if ! command -v npm >/dev/null 2>&1; then
  echo "==> Installing Node.js via nvm..."
  export NVM_DIR="${HOME}/.nvm"
  if [[ ! -s "${NVM_DIR}/nvm.sh" ]]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
  # shellcheck source=/dev/null
  source "${NVM_DIR}/nvm.sh"
  nvm install --lts
  nvm use --lts
fi
if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  source "${NVM_DIR}/nvm.sh"
fi
echo "    Node: $(node --version 2>/dev/null || echo 'missing')"
echo "    npm:  $(npm --version 2>/dev/null || echo 'missing')"

# --- Node deps for integration tests ---
echo "==> npm install (goalchain_program)..."
cd "${PROGRAM_DIR}"
npm ci 2>/dev/null || npm install

echo ""
export CARGO_TARGET_DIR="${PROGRAM_DIR}/target"

echo ""
echo "==> Verificando anchor build..."
cd "${PROGRAM_DIR}"
if anchor build 2>&1 | tee /tmp/goalchain-anchor-build.log | grep -q "Program ID mismatch"; then
  echo ""
  echo "⚠️  Falta keypair del programa oficial (FbDhM4it...)."
  echo "    Copia goalchain_program-keypair.json a:"
  echo "    ${PROGRAM_DIR}/target/deploy/"
  echo "    Ver: ${PROGRAM_DIR}/.keys/README.md"
  echo "    O en una rama local: anchor keys sync && anchor build"
else
  echo "✅ anchor build OK"
fi

echo ""
echo "==> Setup complete. Comandos habituales:"
echo "    cd ${PROGRAM_DIR}"
echo "    export CARGO_TARGET_DIR=\$(pwd)/target"
echo "    anchor build"
echo "    anchor test --validator legacy   # validador clásico en :8899"
echo ""
echo "Nota: Anchor 1.x usa Surfpool por defecto; para estos tests usa --validator legacy."
echo ""
echo "Add to ~/.bashrc (optional):"
echo '  export PATH="$HOME/.cargo/bin:$HOME/.local/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"'
echo '  export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'
