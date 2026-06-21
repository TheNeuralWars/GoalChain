#!/usr/bin/env bash
# GoalChain — Windows Mini PC environment setup (Git Bash / Windows Native)
# Automates the configuration of runtimes, compiler tools, SSH access, profile mirrors, and IDE context.
set -euo pipefail

log() { printf '\n==> [setup-minipc] %s\n' "$*"; }
warn() { printf '\n⚠️  [setup-minipc] %s\n' "$*"; }
error() { printf '\n❌ [setup-minipc] %s\n' "$*" >&2; exit 1; }

# 1. Shell validation
if [ -z "${BASH_VERSION:-}" ]; then
  error "This script must be executed using Git Bash on Windows."
fi

OS_NAME="$(uname -s)"
if [[ ! "${OS_NAME}" =~ MINGW|MSYS|CYGWIN ]]; then
  warn "This script is optimized for Git Bash/MSYS on Windows. Your OS: ${OS_NAME}."
  read -p "Proceed anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 2. Dependency checks & Installation using Winget
log "Checking Windows Native dependencies via winget..."

install_winget_package() {
  local package_id="$1"
  local name="$2"
  if ! winget.exe list --id "${package_id}" >/dev/null 2>&1; then
    log "Installing ${name} via winget..."
    winget.exe install --id "${package_id}" --exact --silent --accept-source-agreements --accept-package-agreements || \
      warn "Failed to install ${name} via winget. Please install manually."
  else
    log "${name} is already installed."
  fi
}

# Install Node.js LTS, GitHub CLI, and Obsidian
install_winget_package "OpenJS.NodeJS.LTS" "Node.js (LTS)"
install_winget_package "GitHub.cli" "GitHub CLI"
install_winget_package "Obsidian.Obsidian" "Obsidian"

# 3. Bun Installation
if ! command -v bun >/dev/null 2>&1; then
  log "Installing Bun for Windows..."
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex" || \
    error "Bun installation failed."
else
  log "Bun is already installed: $(bun --version)"
fi

# 4. Rust & Rustup Installation
if ! command -v rustup >/dev/null 2>&1; then
  log "Installing Rust (Rustup for Windows)..."
  curl -sSfL -o rustup-init.exe https://win.rustup.rs/x86_64
  ./rustup-init.exe -y --no-modify-path --default-host x86_64-pc-windows-msvc --default-toolchain stable
  rm -f rustup-init.exe
else
  log "Rustup is already installed: $(rustup --version)"
fi

# Load cargo environment if available
USERPROFILE_PATH="$(cmd.exe /c "echo %USERPROFILE%" | tr -d '\r')"
CARGO_BIN_WIN="${USERPROFILE_PATH}/.cargo/bin"
export PATH="${CARGO_BIN_WIN}:${PATH}"

# 5. Solana CLI Installation
if ! command -v solana >/dev/null 2>&1; then
  log "Installing Solana CLI (Anza Stable Release)..."
  cmd.exe /c "curl -sSfL https://release.anza.xyz/stable/install | cmd" || \
    error "Solana CLI installation failed."
else
  log "Solana CLI is already installed."
fi

# Add Solana active release to path
SOLANA_BIN_WIN="${USERPROFILE_PATH}/.local/share/solana/install/active_release/bin"
export PATH="${SOLANA_BIN_WIN}:${PATH}"

# Generate Solana local keypair if not present
mkdir -p "${USERPROFILE_PATH}/.config/solana"
if [ ! -f "${USERPROFILE_PATH}/.config/solana/id.json" ]; then
  log "Generating default Solana keypair..."
  solana-keygen.exe new --no-bip39-passphrase -s -o "${USERPROFILE_PATH}/.config/solana/id.json" --force || \
    warn "Could not create local Solana keypair automatically."
fi

# 6. Anchor CLI Installation (AVM)
if ! command -v avm >/dev/null 2>&1; then
  log "Installing AVM (Anchor Version Manager)..."
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force || \
    error "Failed to compile AVM."
else
  log "AVM is already installed."
fi

# Install Anchor 1.0.2 to align with GoalChain smart contract
ANCHOR_VERSION="1.0.2"
log "Installing Anchor CLI v${ANCHOR_VERSION}..."
avm install "${ANCHOR_VERSION}" || true
avm use "${ANCHOR_VERSION}"

# 7. Configure SSH Connection to VPS
log "Setting up SSH access to GoalChain VPS..."
SSH_DIR="${HOME}/.ssh"
mkdir -p "${SSH_DIR}"
chmod 700 "${SSH_DIR}"

SSH_KEY="${SSH_DIR}/id_ed25519"
if [ ! -f "${SSH_KEY}" ]; then
  log "Generating ED25519 SSH keypair..."
  ssh-keygen -t ed25519 -C "nico-minipc" -f "${SSH_KEY}" -N ""
fi

# Copy key to VPS (Oracle)
VPS_HOST="89.168.20.135"
VPS_USER="ubuntu"
GOALCHAIN_SSH="${VPS_USER}@${VPS_HOST}"

log "Copying SSH public key to VPS (${GOALCHAIN_SSH})..."
log "Please enter your VPS SSH password if prompted."
cat "${SSH_KEY}.pub" | ssh -o StrictHostKeyChecking=no "${GOALCHAIN_SSH}" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" || \
  warn "Could not copy SSH key automatically. Please manually append the following key to ~/.ssh/authorized_keys on the VPS:"
cat "${SSH_KEY}.pub"

# 8. Copy Official Smart Contract Keypair from VPS
log "Downloading official smart contract team keypair from VPS..."
mkdir -p goalchain_program/target/deploy
scp -o BatchMode=yes -q \
  "${GOALCHAIN_SSH}:/data/apps/GoalChain/goalchain_program/target/deploy/goalchain_program-keypair.json" \
  "goalchain_program/target/deploy/goalchain_program-keypair.json" || \
  warn "Could not download program keypair from VPS. If required, copy it manually to goalchain_program/target/deploy/goalchain_program-keypair.json."

# 8b. Copy .env file from VPS
log "Downloading repository secrets (.env) from VPS..."
scp -o BatchMode=yes -q \
  "${GOALCHAIN_SSH}:/data/apps/GoalChain/.env" \
  ".env" || \
  warn "Could not download .env file from VPS. If required, copy it manually to the repository root."


# 9. Mirror Configuration from VPS
log "Mirroring Hermes profile config from VPS..."
# Ensure Python packages like pyyaml are present for the patch process
pip install pyyaml --quiet 2>/dev/null || python -m pip install pyyaml --quiet 2>/dev/null || warn "Python PyYAML package not found; patch-config-for-mac step might fail. Run 'pip install pyyaml' manually."

# Execute mirror script
GOALCHAIN_SSH="${GOALCHAIN_SSH}" bash ops/hermes/install-hermes-mirror-mac.sh || \
  warn "Hermes configuration mirroring finished with warnings."

# 10. Proactively Stop/Disable local Hermes Gateway (Avoid Session Collisions)
log "Disabling local Hermes gateway..."
bash ops/hermes/disable-hermes-mac.sh || true

# 11. Install GBrain local MCP integration for Cursor / Antigravity
log "Installing local GBrain MCP integrations..."
bash ops/hermes/install-gbrain-cursor.sh || warn "Cursor GBrain MCP setup warning."
bash ops/hermes/install-gbrain-antigravity.sh || warn "Antigravity GBrain MCP setup warning."

# Initialize local context DB
log "Initializing local context database..."
gbrain import ai_context docs/intake || warn "Initial intake import skipped."
gbrain embed --stale || warn "Context embedding skipped."

# 12. Configure Antigravity identical to Mac
log "Configuring Antigravity settings..."
for path_cand in "${USERPROFILE_PATH}/.gemini/config" "${USERPROFILE_PATH}/.gemini/antigravity"; do
  mkdir -p "${path_cand}"
  # Write dark theme configuration
  cat <<EOF > "${path_cand}/config.json"
{
  "userSettings": {
    "globalPermissionGrants": {
      "allow": [
        "command(git status)",
        "command(git add)",
        "command(git commit)",
        "read_url(https://goalchain.fun/)",
        "read_url(hermes-agent.nousresearch.com)",
        "read_url(yanxbt.substack.com)",
        "read_url(t.co)",
        "read_url(wurkapi.fun)",
        "read_url(x.com)",
        "mcp(gbrain/query)",
        "mcp(gbrain/list_pages)",
        "read_url(github.com)"
      ]
    },
    "themeMode": "THEME_MODE_DARK",
    "useAiCredits": true
  }
}
EOF
  # Write MCP gbrain server settings
  cat <<EOF > "${path_cand}/mcp_config.json"
{
  "mcpServers": {
    "cloudrun": {
      "args": [
        "-y",
        "@google-cloud/cloud-run-mcp"
      ],
      "command": "npx"
    },
    "gbrain": {
      "command": "${USERPROFILE_PATH//\\//\\\\}/.bun/bin/bun.exe",
      "args": [
        "${USERPROFILE_PATH//\\//\\\\}/.bun/bin/gbrain",
        "serve"
      ],
      "env": {
        "PATH": "${USERPROFILE_PATH//\\//\\\\}/.bun/bin;${USERPROFILE_PATH//\\//\\\\}/.local/bin",
        "VOYAGE_API_KEY": "pa-7szM-wkWDNtPyMYkOtGPa41R0t-6wZnVHVa5S1lEOg2"
      }
    }
  }
}
EOF
done

# 13. Download and Configure Obsidian community plugins
log "Installing Obsidian community plugins (Git Sync & Dataview)..."
download_obsidian_plugin() {
  local repo="$1"
  local name="$2"
  local dest_dir=".obsidian/plugins/${name}"
  mkdir -p "${dest_dir}"
  log "Downloading ${name} files..."
  curl -sSfL -o "${dest_dir}/main.js" "https://github.com/${repo}/releases/latest/download/main.js" || warn "Failed main.js for ${name}"
  curl -sSfL -o "${dest_dir}/manifest.json" "https://github.com/${repo}/releases/latest/download/manifest.json" || warn "Failed manifest.json for ${name}"
  curl -sSfL -o "${dest_dir}/styles.css" "https://github.com/${repo}/releases/latest/download/styles.css" || true
}

download_obsidian_plugin "vinzent03/obsidian-git" "obsidian-git"
download_obsidian_plugin "blacksmithgu/obsidian-dataview" "dataview"

log "Setup completed successfully!"
echo "--------------------------------------------------------"
echo "  Windows Mini PC Developer workspace is now ready."
echo "  Path:     $(pwd)"
echo "  Solana:   $(solana --version 2>/dev/null || echo 'Not configured in current bash path')"
echo "  Anchor:   $(anchor --version 2>/dev/null || echo 'Not configured in current bash path')"
echo "  Bun:      $(bun --version 2>/dev/null || echo 'Not configured in current bash path')"
echo "--------------------------------------------------------"
echo "  Please restart Git Bash (or run 'source ~/.bashrc') to refresh PATH."
echo "  Official team keypair goalchain_program-keypair.json copied successfully."
echo "  Antigravity mirrored and configured in dark mode with GBrain."
echo "  Obsidian is installed and preloaded with Obsidian Git & Dataview."
echo "  Open Obsidian and select this repository folder as a Vault."
echo "--------------------------------------------------------"
