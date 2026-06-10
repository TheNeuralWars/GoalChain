#!/usr/bin/env bash
# IDL Sync Script for GoalChain
# Builds Anchor program and syncs IDL to all consumers (SDK, API, Oracle)
# Usage: ./sync-idl.sh [--check] [--no-build]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRAM_DIR="${REPO_ROOT}/goalchain_program"
SDK_DIR="${REPO_ROOT}/goalchain-sdk"
API_DIR="${REPO_ROOT}/goalchain_api"
ORACLE_DIR="${REPO_ROOT}/goalchain_oracle"

IDL_SOURCE="${PROGRAM_DIR}/target/idl/goalchain_program.json"

# Target paths
SDK_IDL_JSON="${SDK_DIR}/src/goalchain_program.json"
SDK_IDL_DIR_JSON="${SDK_DIR}/src/idl/goalchain_program.json"
API_IDL_DIR="${API_DIR}/src/idl"
API_IDL_JSON="${API_IDL_DIR}/goalchain_program.json"
ORACLE_IDL_DIR="${ORACLE_DIR}/src/idl"
ORACLE_IDL_JSON="${ORACLE_IDL_DIR}/goalchain_program.json"

CHECK_ONLY=false
NO_BUILD=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --check)
            CHECK_ONLY=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown argument: $arg${NC}"
            echo "Usage: $0 [--check] [--no-build]"
            exit 1
            ;;
    esac
done

log_info() {
    echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

check_idl_exists() {
    local path="$1"
    local name="$2"
    if [[ -f "$path" ]]; then
        log_info "$name: OK ($path)"
        return 0
    else
        log_error "$name: MISSING ($path)"
        return 1
    fi
}

verify_all_targets() {
    local failed=0
    log_info "Verifying IDL sync targets..."

    check_idl_exists "$SDK_IDL_JSON" "SDK (src/)" || failed=1
    check_idl_exists "$SDK_IDL_DIR_JSON" "SDK (src/idl/)" || failed=1
    check_idl_exists "$API_IDL_JSON" "API (src/idl/)" || failed=1

    # Oracle is optional - only check if directory exists
    if [[ -d "$ORACLE_DIR" ]]; then
        check_idl_exists "$ORACLE_IDL_JSON" "Oracle (src/idl/)" || failed=1
    else
        log_warn "Oracle: SKIPPED (directory $ORACLE_DIR does not exist)"
    fi

    if [[ $failed -eq 0 ]]; then
        log_info "All IDL sync targets verified successfully"
        return 0
    else
        log_error "Some IDL sync targets are missing"
        return 1
    fi
}

build_program() {
    if [[ "$NO_BUILD" == true ]]; then
        log_info "Skipping Anchor build (--no-build flag)"
        if [[ ! -f "$IDL_SOURCE" ]]; then
            log_error "IDL not found at $IDL_SOURCE and --no-build specified"
            exit 1
        fi
        log_info "Using existing IDL at $IDL_SOURCE"
        return 0
    fi

    # Auto-skip build if IDL already exists and is newer than Cargo.toml
    if [[ -f "$IDL_SOURCE" && "$IDL_SOURCE" -nt "$PROGRAM_DIR/Cargo.toml" ]]; then
        log_info "IDL is up to date, skipping build (use --no-build to force skip)"
        return 0
    fi

    log_info "Building Anchor program..."
    cd "$PROGRAM_DIR"

    # Ensure PATH includes solana, anchor, cargo
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"

    # Verify anchor version
    anchor --version

    # Build with --ignore-keys (keypair not required for IDL generation)
    anchor build --ignore-keys

    # Verify IDL was generated
    if [[ ! -f "$IDL_SOURCE" ]]; then
        log_error "IDL not found at $IDL_SOURCE after build"
        exit 1
    fi

    log_info "IDL generated at $IDL_SOURCE"
}

sync_idl() {
    log_info "Syncing IDL to consumers..."

    # Ensure source IDL exists
    if [[ ! -f "$IDL_SOURCE" ]]; then
        log_error "IDL source not found at $IDL_SOURCE. Run build first."
        exit 1
    fi

    # --- SDK (src/) - backwards compatibility ---
    log_info "Copying to SDK (src/)..."
    cp "$IDL_SOURCE" "$SDK_IDL_JSON"

    # --- SDK (src/idl/) - new structure ---
    log_info "Copying to SDK (src/idl/)..."
    mkdir -p "$(dirname "$SDK_IDL_DIR_JSON")"
    cp "$IDL_SOURCE" "$SDK_IDL_DIR_JSON"

    # --- API (src/idl/) ---
    log_info "Copying to API (src/idl/)..."
    mkdir -p "$API_IDL_DIR"
    cp "$IDL_SOURCE" "$API_IDL_JSON"

    # --- Oracle (src/idl/) - optional ---
    if [[ -d "$ORACLE_DIR" ]]; then
        log_info "Copying to Oracle (src/idl/)..."
        mkdir -p "$ORACLE_IDL_DIR"
        cp "$IDL_SOURCE" "$ORACLE_IDL_JSON"
    else
        log_warn "Oracle directory not found at $ORACLE_DIR, skipping..."
    fi

    log_info "IDL copied to all targets"
}

build_sdk() {
    log_info "Building SDK to generate TypeScript types..."
    cd "$SDK_DIR"
    npm run build
    log_info "SDK build complete"
}

main() {
    cd "$REPO_ROOT"

    if [[ "$CHECK_ONLY" == true ]]; then
        verify_all_targets
        exit $?
    fi

    log_info "Starting IDL generation and sync..."
    build_program
    sync_idl
    build_sdk
    verify_all_targets

    log_info "IDL generation and sync completed successfully"
}

main "$@"