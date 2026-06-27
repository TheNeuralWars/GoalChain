#!/usr/bin/env bash
#===============================================================================
# Rename GoalChain project to GoalWorld
#
# Usage:
#   ./rename_to_goalworld.sh [--dry-run] [--help]
#
#   --dry-run   Show what would be changed without making changes.
#   --help      Show this help message.
#
# This script recursively renames files, directories, and file contents
# from "goalchain", "GoalChain", "GOALCHAIN" to "goalworld", "GoalWorld", "GOALWORLD"
# respectively, excluding certain directories (.git, node_modules, __pycache__, .hermes, etc.).
# It also updates configuration files, service unit files, Dockerfiles, docker-compose.yml,
# and any references in ~/.hermes/ or /home/ubuntu/.hermes/ that reference the project.
# It updates the Git remote URL if the repository is hosted on GitHub (changing GoalChain to GoalWorld).
# The script is idempotent and includes a verification step to report any remaining occurrences.
#
# WARNING: Review the changes before committing. It is recommended to commit or stash
#          your changes before running this script.
#===============================================================================

set -euo pipefail

# Configuration
DRY_RUN=false
LOG_FILE="rename_to_goalworld_$(date +%Y%m%d_%H%M%S).log"
EXCLUDE_DIRS=(.git node_modules __pycache__ .hermes .github)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HERMES_DIRS=("$HOME/.hermes" "/home/ubuntu/.hermes")
OLD_LOWER="goalchain"
OLD_TITLE="GoalChain"
OLD_UPPER="GOALCHAIN"
NEW_LOWER="goalworld"
NEW_TITLE="GoalWorld"
NEW_UPPER="GOALWORLD"

# Logging function
log() {
    local level="$1"
    shift
    local msg="$*"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $msg" | tee -a "$LOG_FILE"
}

# Dry-run execution helper
dry_run() {
    if $DRY_RUN; then
        log DRY-RUN "$*"
    else
        log INFO "$*"
        "$@"
    fi
}

# Print usage
usage() {
    grep '^#' "$0" | cut -c4-
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Initialize log
: > "$LOG_FILE"
log INFO "Starting GoalChain to GoalWorld rename script"
log INFO "Repository root: $REPO_ROOT"
log INFO "Dry run: $DRY_RUN"

# Function to check if a path is excluded (based on directory components)
is_excluded() {
    local path="$1"
    local rel_path
    rel_path="${path#$REPO_ROOT/}"
    for dir in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$rel_path" == "$dir"* || "$rel_path" == */"$dir"/* || "$rel_path" == */"$dir" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to replace strings in a file (text files only)
replace_in_file() {
    local file="$1"
    if [[ -f "$file" && -r "$file" && -w "$file" ]]; then
        # Skip binary files
        if ! grep -Iq . "$file" 2>/dev/null; then
            log DEBUG "Skipping binary file: $file"
            return
        fi
        local changed=false
        # Replace lowercase
        if grep -q "$OLD_LOWER" "$file"; then
            if $DRY_RUN; then
                log DRY-RUN "Would replace '$OLD_LOWER' -> '$NEW_LOWER' in $file"
            else
                if sed -i "s/$OLD_LOWER/$NEW_LOWER/g" "$file"; then
                    log INFO "Replaced '$OLD_LOWER' -> '$NEW_LOWER' in $file"
                    changed=true
                else
                    log WARN "Failed to replace '$OLD_LOWER' in $file"
                fi
            fi
        fi
        # Replace TitleCase
        if grep -q "$OLD_TITLE" "$file"; then
            if $DRY_RUN; then
                log DRY-RUN "Would replace '$OLD_TITLE' -> '$NEW_TITLE' in $file"
            else
                if sed -i "s/$OLD_TITLE/$NEW_TITLE/g" "$file"; then
                    log INFO "Replaced '$OLD_TITLE' -> '$NEW_TITLE' in $file"
                    changed=true
                else
                    log WARN "Failed to replace '$OLD_TITLE' in $file"
                fi
            fi
        fi
        # Replace UPPERCASE
        if grep -q "$OLD_UPPER" "$file"; then
            if $DRY_RUN; then
                log DRY-RUN "Would replace '$OLD_UPPER' -> '$NEW_UPPER' in $file"
            else
                if sed -i "s/$OLD_UPPER/$NEW_UPPER/g" "$file"; then
                    log INFO "Replaced '$OLD_UPPER' -> '$NEW_UPPER' in $file"
                    changed=true
                else
                    log WARN "Failed to replace '$OLD_UPPER' in $file"
                fi
            fi
        fi
        if $changed && ! $DRY_RUN; then
            log INFO "File updated: $file"
        fi
    fi
}

# Process file contents
process_files() {
    log INFO "Processing file contents..."
    find "$REPO_ROOT" -type f -print0 | while IFS= read -r -d '' file; do
        if is_excluded "$file"; then
            continue
        fi
        replace_in_file "$file"
    done
}

# Rename files and directories (depth-first)
rename_paths() {
    log INFO "Renaming files and directories..."
    # We'll process files first, then directories in reverse depth order
    local tmpfile
    tmpfile=$(mktemp)
    # Find files
    find "$REPO_ROOT" -type f -print0 | while IFS= read -r -d '' file; do
        if is_excluded "$file"; then
            continue
        fi
        echo "$file" >> "$tmpfile"
    done
    # Process files
    while IFS= read -r file; do
        new_file="$file"
        new_file="${new_file//$OLD_LOWER/$NEW_LOWER}"
        new_file="${new_file//$OLD_TITLE/$NEW_TITLE}"
        new_file="${new_file//$OLD_UPPER/$NEW_UPPER}"
        if [[ "$new_file" != "$file" ]]; then
            dry_run mv "$file" "$new_file"
        fi
    done < "$tmpfile"
    # Clear temp file
    > "$tmpfile"
    # Find directories
    find "$REPO_ROOT" -type d -print0 | while IFS= read -r -d '' dir; do
        if is_excluded "$dir"; then
            continue
        fi
        echo "$dir" >> "$tmpfile"
    done
    # Sort directories by depth (number of slashes) descending
    awk -F/ '{ print length($0) " " $0 }' "$tmpfile" | sort -rn | cut -d' ' -f2- > "${tmpfile}_sorted"
    mv "${tmpfile}_sorted" "$tmpfile"
    # Process directories
    while IFS= read -r dir; do
        new_dir="$dir"
        new_dir="${new_dir//$OLD_LOWER/$NEW_LOWER}"
        new_dir="${new_dir//$OLD_TITLE/$NEW_TITLE}"
        new_dir="${new_dir//$OLD_UPPER/$NEW_UPPER}"
        if [[ "$new_dir" != "$dir" ]]; then
            dry_run mv "$dir" "$new_dir"
        fi
    done < "$tmpfile"
    # Cleanup
    rm -f "$tmpfile"
}

# Update configuration files (specific ones)
update_config_files() {
    log INFO "Updating specific configuration files..."
    local config_files=(
        "$REPO_ROOT/.env"
        "$REPO_ROOT/.env.shared"
        "$REPO_ROOT/.env.jitosol.example"
        "$REPO_ROOT/ops/goalchain-multiagent/.env.example"
        "$REPO_ROOT/ops/goalchain-multiagent/install-vps.sh"
        "$REPO_ROOT/ops/openclaw/install-cron.sh"
        "$REPO_ROOT/ops/openclaw/install-economy-crank-cron.sh"
        "$REPO_ROOT/docs/EXECUTION_BACKLOG_90D.md"
        "$REPO_ROOT/docs/FRONTEND_ROUTING.md"
        "$REPO_ROOT/AGENT_GUIDE.md"
        "$REPO_ROOT/WORKFLOW.md"
        "$REPO_ROOT/README.md"
        "$REPO_ROOT/SETUP_WINDOWS.md"
        "$REPO_ROOT/docs/TOKENOMICS_EQUILIBRIUM.md"
        "$REPO_ROOT/docs/METADATA_SPEC.md"
    )
    # Add any docker-compose.yml or Dockerfile found
    while IFS= read -r -d '' file; do
        if [[ "$file" == *docker-compose.yml* || "$file" == *Dockerfile* ]]; then
            config_files+=("$file")
        fi
    done < <(find "$REPO_ROOT" -type f \( -name "docker-compose.yml" -o -name "Dockerfile" \) -print0 2>/dev/null)
    # Process each file
    for file in "${config_files[@]}"; do
        if [[ -f "$file" ]] && ! is_excluded "$file"; then
            replace_in_file "$file"
        fi
    done
    # Update Hermes config files if they contain project references
    for hermes_dir in "${HERMES_DIRS[@]}"; do
        if [[ -d "$hermes_dir" ]]; then
            log INFO "Checking Hermes directory: $hermes_dir"
            while IFS= read -r -d '' file; do
                if [[ -f "$file" && -r "$file" && -w "$file" ]]; then
                    # Only process if it contains the old strings
                    if grep -q "$OLD_LOWER\|$OLD_TITLE\|$OLD_UPPER" "$file"; then
                        replace_in_file "$file"
                    fi
                fi
            done < <(find "$hermes_dir" -type f -print0 2>/dev/null)
        fi
    done
}

# Update Git remote URL
update_git_remote() {
    if [[ -d "$REPO_ROOT/.git" ]]; then
        log INFO "Checking Git remote..."
        local remote_url
        remote_url=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)
        if [[ -n "$remote_url" && "$remote_url" == *GoalChain* ]]; then
            local new_url
            new_url="${remote_url/GoalChain/GoalWorld}"
            if $DRY_RUN; then
                log DRY-RUN "Would change Git remote from '$remote_url' to '$new_url'"
            else
                if git -C "$REPO_ROOT" remote set-url origin "$new_url"; then
                    log INFO "Changed Git remote from '$remote_url' to '$new_url'"
                else
                    log WARN "Failed to change Git remote"
                fi
            fi
        else
            log INFO "Git remote does not contain 'GoalChain' or not set; skipping remote update."
        fi
    else
        log WARN "Git repository not found at $REPO_ROOT/.git"
    fi
}

# Verification step: search for remaining occurrences
verify_changes() {
    log INFO "Verifying remaining occurrences of old strings..."
    local remaining=false
    # Search in repository root, excluding excluded directories
    while IFS= read -r -d '' file; do
        if is_excluded "$file"; then
            continue
        fi
        # Skip binary files
        if ! grep -Iq . "$file" 2>/dev/null; then
            continue
        fi
        if grep -q "$OLD_LOWER\|$OLD_TITLE\|$OLD_UPPER" "$file"; then
            log WARN "Remaining occurrence found in: $file"
            grep -n "$OLD_LOWER\|$OLD_TITLE\|$OLD_UPPER" "$file" | head -5 | while read -r line; do
                log WARN "  $line"
            done
            remaining=true
        fi
    done < <(find "$REPO_ROOT" -type f -print0)
    # Also check Hermes directories for remaining occurrences (only if they contain project refs)
    for hermes_dir in "${HERMES_DIRS[@]}"; do
        if [[ -d "$hermes_dir" ]]; then
            while IFS= read -r -d '' file; do
                if [[ -f "$file" && -r "$file" ]]; then
                    if grep -q "$OLD_LOWER\|$OLD_TITLE\|$OLD_UPPER" "$file"; then
                        log WARN "Remaining occurrence found in Hermes dir: $file"
                        grep -n "$OLD_LOWER\|$OLD_TITLE\|$OLD_UPPER" "$file" | head -5 | while read -r line; do
                            log WARN "  $line"
                        done
                        remaining=true
                    fi
                fi
            done < <(find "$hermes_dir" -type f -print0 2>/dev/null)
        fi
    done
    if ! $remaining; then
        log INFO "No remaining occurrences of old strings found."
    else
        log WARN "Some occurrences remain; consider running the script again or reviewing manually."
    fi
}

# Main execution
main() {
    log INFO "=== Starting rename process ==="
    process_files
    rename_paths
    update_config_files
    update_git_remote
    verify_changes
    log INFO "=== Rename process complete ==="
    log INFO "Log file: $LOG_FILE"
}

# Run main
main "$@"