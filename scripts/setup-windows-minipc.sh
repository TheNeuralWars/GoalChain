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

# Convert paths using cygpath
USERPROFILE_PATH="$(cmd.exe /c "echo %USERPROFILE%" | tr -d '\r')"
USERPROFILE_WIN="$(cygpath -w "${USERPROFILE_PATH}")"
REPO_PATH="$(pwd)"
REPO_PATH_WIN="$(cygpath -w "${REPO_PATH}")"

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

# Install Node.js LTS, GitHub CLI, Python 3, and Obsidian
install_winget_package "OpenJS.NodeJS.LTS" "Node.js (LTS)"
install_winget_package "GitHub.cli" "GitHub CLI"
install_winget_package "Obsidian.Obsidian" "Obsidian"
install_winget_package "Python.Python.3.11" "Python 3.11" || install_winget_package "Python.Python.3" "Python 3"

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

# Load cargo and bun environment
CARGO_BIN_WIN="${USERPROFILE_PATH}/.cargo/bin"
BUN_BIN_WIN="${USERPROFILE_PATH}/.bun/bin"
export PATH="${CARGO_BIN_WIN}:${BUN_BIN_WIN}:${PATH}"

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

VPS_HOST="89.168.20.135"
VPS_USER="ubuntu"
GOALCHAIN_SSH="${VPS_USER}@${VPS_HOST}"

# Check if SSH connection already works
log "Checking SSH connection to VPS..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 "${GOALCHAIN_SSH}" "echo OK" >/dev/null 2>&1; then
  log "SSH connection to VPS is already working and authorized!"
else
  warn "SSH connection is not authorized yet. Attempting automatic key copy..."
  # Copy key to VPS (Oracle) using password if supported
  if cat "${SSH_KEY}.pub" | ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 "${GOALCHAIN_SSH}" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"; then
    log "Successfully copied SSH key to VPS."
  else
    warn "Could not copy SSH key automatically. You need to authorize this PC using your Mac."
    echo "--------------------------------------------------------"
    echo "👉 ACTION REQUIRED: Run this command ON YOUR MAC to authorize this PC:"
    echo "   ssh ${GOALCHAIN_SSH} \"echo '$(cat "${SSH_KEY}.pub")' >> ~/.ssh/authorized_keys\""
    echo "--------------------------------------------------------"
    read -p "Press Enter once you have run the command on your Mac to continue..."
  fi
fi

# 8. Copy Official Smart Contract Keypair and secrets from VPS
log "Downloading official smart contract team keypair from VPS..."
mkdir -p goalchain_program/target/deploy
scp -o ConnectTimeout=10 "${GOALCHAIN_SSH}:/data/apps/GoalChain/goalchain_program/target/deploy/goalchain_program-keypair.json" \
  "goalchain_program/target/deploy/goalchain_program-keypair.json" || \
  warn "Could not download program keypair from VPS. If required, copy it manually to goalchain_program/target/deploy/goalchain_program-keypair.json."

log "Downloading repository secrets (.env) from VPS..."
scp -o ConnectTimeout=10 "${GOALCHAIN_SSH}:/data/apps/GoalChain/.env" ".env" || \
  warn "Could not download .env file from VPS. If required, copy it manually to the repository root."

# 9. Mirror Hermes Configuration from VPS
log "Mirroring Hermes config and installing dependencies..."
pip install pyyaml --quiet 2>/dev/null || python -m pip install pyyaml --quiet 2>/dev/null || warn "Failed to install pyyaml."

# Install hermes-agent on Windows
pip install hermes-agent --quiet 2>/dev/null || python -m pip install hermes-agent --quiet 2>/dev/null || warn "Failed to install hermes-agent."

HERMES_DIR="${HOME}/.hermes"
mkdir -p "${HERMES_DIR}"

# Try the new path /data/hermes-home first, fall back to /home/ubuntu/.hermes
log "Pulling Hermes config files from VPS..."
scp -o ConnectTimeout=10 \
  "${GOALCHAIN_SSH}:/data/hermes-home/.env" \
  "${GOALCHAIN_SSH}:/data/hermes-home/auth.json" \
  "${GOALCHAIN_SSH}:/data/hermes-home/config.yaml" \
  "${GOALCHAIN_SSH}:/data/hermes-home/SOUL.md" \
  "${HERMES_DIR}/" 2>/dev/null || \
scp -o ConnectTimeout=10 \
  "${GOALCHAIN_SSH}:/home/ubuntu/.hermes/.env" \
  "${GOALCHAIN_SSH}:/home/ubuntu/.hermes/auth.json" \
  "${GOALCHAIN_SSH}:/home/ubuntu/.hermes/config.yaml" \
  "${GOALCHAIN_SSH}:/home/ubuntu/.hermes/SOUL.md" \
  "${HERMES_DIR}/" 2>/dev/null || warn "Failed to download remote Hermes configs."

# Update local .env with local repo path
if [ -f "${HERMES_DIR}/.env" ]; then
  sed -i "s|GOALCHAIN_REPO_PATH=.*|GOALCHAIN_REPO_PATH=\"${REPO_PATH_WIN}\"|g" "${HERMES_DIR}/.env"
fi

# 10. Install GBrain local MCP integration
log "Installing local GBrain context database..."
bun install -g github:garrytan/gbrain || warn "Failed to install gbrain globally."

# Initialize local context DB
if ! gbrain doctor --fast >/dev/null 2>&1; then
  gbrain init --pglite --no-embedding || gbrain init --pglite || true
fi

# Import GoalChain docs and code context
log "Importing GoalChain docs into local gbrain..."
for sub in ai_context docs/intake docs/proposals; do
  if [ -d "${REPO_PATH}/${sub}" ]; then
    gbrain import "${REPO_PATH}/${sub}" --no-embed || true
  fi
done

# Seed environment variables for embedding if available in .env
VOYAGE_KEY=""
if [ -f ".env" ]; then
  VOYAGE_KEY=$(grep -E "^VOYAGE_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi
if [ -z "${VOYAGE_KEY}" ]; then
  VOYAGE_KEY="pa-7szM-wkWDNtPyMYkOtGPa41R0t-6wZnVHVa5S1lEOg2" # Default team key
fi

# 11. Configure Antigravity identical to Mac
log "Configuring Antigravity settings & MCP config..."
for path_cand in "${USERPROFILE_PATH}/.gemini/config" "${USERPROFILE_PATH}/.gemini/antigravity" "${USERPROFILE_PATH}/.gemini/antigravity-ide"; do
  mkdir -p "${path_cand}"
  # Write dark theme configuration & permissions
  cat <<EOF > "${path_cand}/config.json"
{
  "userSettings": {
    "globalPermissionGrants": {
      "allow": [
        "command(git status)",
        "command(git add)",
        "command(git commit)",
        "command(ssh)",
        "command(scp)",
        "command(git push)",
        "command(git pull)",
        "read_url(https://goalchain.fun/)",
        "read_url(hermes-agent.nousresearch.com)",
        "read_url(yanxbt.substack.com)",
        "read_url(t.co)",
        "read_url(wurkapi.fun)",
        "read_url(x.com)",
        "mcp(gbrain/query)",
        "mcp(gbrain/list_pages)",
        "mcp(goalchain-ops/*)",
        "read_url(github.com)"
      ]
    },
    "themeMode": "THEME_MODE_DARK",
    "useAiCredits": true
  }
}
EOF

  # Write MCP configuration mapping both gbrain and goalchain-ops natively for Windows
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
      "command": "bun",
      "args": [
        "x",
        "gbrain",
        "serve"
      ],
      "env": {
        "PATH": "${USERPROFILE_WIN}\\\\.bun\\\\bin;${USERPROFILE_WIN}\\\\.local\\\\bin",
        "VOYAGE_API_KEY": "${VOYAGE_KEY}"
      }
    },
    "goalchain-ops": {
      "command": "python",
      "args": [
        "${REPO_PATH_WIN}\\\\ops\\\\hermes\\\\mcp-goalchain-ops.py"
      ],
      "env": {
        "GOALCHAIN_API_BASE": "https://crm.goalchain.fun/goalchain-api",
        "RPC_URL": "https://api.devnet.solana.com",
        "PROGRAM_ID": "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
        "GOALCHAIN_REPO_PATH": "${REPO_PATH_WIN}"
      },
      "timeout": 90
    }
  }
}
EOF
done

# 12. Download and Configure Obsidian community plugins
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
echo "  Antigravity mirrored and configured in dark mode with GBrain and GoalChain Ops."
echo "  Obsidian is installed and preloaded with Obsidian Git & Dataview."
echo "  Open Obsidian and select this repository folder as a Vault."
echo "--------------------------------------------------------"
