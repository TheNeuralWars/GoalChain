#!/usr/bin/env bash
# GoalChain ops healthcheck — single source of truth for cron/timer/API health.
# Issue #815. Pure bash; no secrets; safe under set -euo pipefail.
#
# Usage:
#   healthcheck.sh             # human PASS/WARN/FAIL table
#   healthcheck.sh --json      # one-line JSON envelope (used by MCP resource)
#   healthcheck.sh --audit     # refresh cron-audit-YYYY-MM-DD.log first
#   healthcheck.sh --help
#
# Exit codes (when not --json): 0=PASS, 1=WARN, 2=FAIL.
set -euo pipefail

JSON_MODE=0
RUN_AUDIT=0
for arg in "$@"; do
  case "$arg" in
    --json)    JSON_MODE=1 ;;
    --audit)   RUN_AUDIT=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "WARN: unknown arg '$arg'" >&2 ;;
  esac
done
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HERMES_LOG_DIR="${HERMES_LOG_DIR:-$HOME/hermes/logs}"
mkdir -p "$HERMES_LOG_DIR"
HC_LOG="$HERMES_LOG_DIR/healthcheck.log"
API_BASE="${GOALCHAIN_API_BASE:-https://crm.goalchain.fun/goalchain-api}"
TODAY="$(date -u +%F)"
AUDIT_LOG="$HERMES_LOG_DIR/cron-audit-$TODAY.log"

# Sample size: errors in last N lines of each log we scan
LOG_SCAN_LINES="${LOG_SCAN_LINES:-200}"
ERROR_THRESHOLD="${ERROR_THRESHOLD:-50}"

# ---------- helpers ----------
log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*" >>"$HC_LOG"; }
_level() { case "$1" in PASS) printf '✅';; WARN) printf '⚠️ ';; FAIL) printf '❌';; *) printf '?';; esac; }

# ---------- 1. cron-audit inventory refresh ----------
# Mirrors the loop in issue #815 §1 — scans both system-level and user-level
# service files, then writes per-unit status (head -5) + matching timer.
audit_inventory() {
  : >"$AUDIT_LOG"
  local units=""
  local sys_units
  sys_units="$(systemctl list-unit-files --type=service --no-legend 2>/dev/null \
    | awk '{print $1}' | grep -E 'goalchain|hermes' || true)"
  local user_units
  user_units="$(systemctl --user list-unit-files --type=service --no-legend 2>/dev/null \
    | awk '{print $1}' | grep -E 'goalchain|hermes' || true)"
  units="$(printf '%s\n%s\n' "$sys_units" "$user_units" | grep -v '^$' | sort -u || true)"
  if [[ -z "$units" ]]; then
    echo "(no goalchain/hermes service units found)" >"$AUDIT_LOG"
    return 0
  fi
  while IFS= read -r u; do
    [[ -z "$u" ]] && continue
    local timer="${u%.service}.timer"
    # Pick the right systemctl scope for the unit
    local scope="system"
    systemctl --user cat "$u" >/dev/null 2>&1 && scope="user"
    {
      echo "=== [$scope] $u ==="
      if [[ "$scope" == "user" ]]; then
        systemctl --user status "$u" --no-pager 2>&1 | head -5
        systemctl --user status "$timer" --no-pager 2>&1 | head -5
      else
        systemctl status "$u" --no-pager 2>&1 | head -5
        systemctl status "$timer" --no-pager 2>&1 | head -5
      fi
    } >>"$AUDIT_LOG" 2>&1 || true
  done <<<"$units"
  log "audit_inventory refreshed → $AUDIT_LOG"
}

# ---------- 2. ops-status / vault_crank probe ----------
# Calls the live ops API. Falls back to WARN if unreachable; failure is
# never silent — a missing vault_crank.stale=false is logged.
check_ops_api() {
  local payload status vault_stale
  payload="$(curl -sS --max-time 20 "$API_BASE/api/ops/status" 2>/dev/null || echo "")"
  if [[ -z "$payload" ]]; then
    printf 'WARN|ops_api unreachable (%s)\n' "$API_BASE"
    return 1
  fi
  status="$(printf '%s' "$payload" | grep -oE '"status"[[:space:]]*:[[:space:]]*"[a-z]+"' | head -1 || echo "")"
  vault_stale="$(printf '%s' "$payload" | grep -oE '"stale"[[:space:]]*:[[:space:]]*(true|false)' | head -1 | grep -oE '(true|false)' || echo "unknown")"
  local rc=0
  local msg="api ok"
  case "$vault_stale" in
    false) msg="vault_crank.stale=false"; rc=0 ;;
    true)  msg="vault_crank.stale=TRUE (issue #811 root pattern)"; rc=2 ;;
    *)     msg="vault_crank field missing or unknown"; rc=1 ;;
  esac
  printf '%s|%s\n' "$([[ $rc -eq 0 ]] && echo PASS || ([[ $rc -eq 1 ]] && echo WARN || echo FAIL))" "$msg"
  return $rc
}

# ---------- 3. log-spam detector (last 5 logs in HERMES_LOG_DIR) ----------
# Counts ERROR / Traceback / Exception in last $LOG_SCAN_LINES lines of each.
check_log_spam() {
  local files bad_msg
  files="$(ls -1t "$HERMES_LOG_DIR"/*.log 2>/dev/null | head -5 || true)"
  if [[ -z "$files" ]]; then
    printf 'WARN|no logs found in %s\n' "$HERMES_LOG_DIR"
    return 1
  fi
  local worst=0 worst_file="" totals=0
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    [[ "$f" == "$HC_LOG" ]] && continue  # don't self-count
    local n
    n="$(tail -n "$LOG_SCAN_LINES" "$f" 2>/dev/null \
      | grep -ciE 'error|traceback|exception' || true)"
    totals=$((totals+n))
    if [[ "$n" -gt "$worst" ]]; then worst="$n"; worst_file="$f"; fi
  done <<<"$files"
  local rc=0 msg
  if [[ "$totals" -ge "$ERROR_THRESHOLD" ]]; then
    msg="ERROR spam: $totals hits across last 5 logs (worst: $worst in $(basename "$worst_file"))"
    rc=2
  elif [[ "$totals" -ge 5 ]]; then
    msg="$totals ERROR hits across last 5 logs (worst: $worst in $(basename "$worst_file"))"
    rc=1
  else
    msg="$totals ERROR hits across last 5 logs"
  fi
  printf '%s|%s\n' "$([[ $rc -eq 0 ]] && echo PASS || ([[ $rc -eq 1 ]] && echo WARN || echo FAIL))" "$msg"
  return $rc
}

# ---------- 4. timer health ----------
# Counts inactive/failed user timers under "goalchain|hermes" prefix.
check_timers() {
  local total=0 active=0 inactive=0 failed=0
  while IFS= read -r unit; do
    [[ -n "$unit" ]] || continue
    total=$((total+1))
    # Probe the .timer unit itself — its ActiveState tells us whether
    # it'll fire next scheduled tick.
    if systemctl --user is-active "$unit" >/dev/null 2>&1; then
      active=$((active+1))
    else
      inactive=$((inactive+1))
    fi
  done < <(systemctl --user list-timers --all --no-legend 2>/dev/null \
            | grep -oE '(goalchain|hermes)[^ ]+\.timer' \
            | sort -u \
            || true)
  # Treat any "failed" markers we can pull out of `systemctl --user` summary
  local failed_summary
  failed_summary="$(systemctl --user --failed --no-legend 2>/dev/null \
                    | grep -cE '(goalchain|hermes)' || true)"
  failed="$failed_summary"
  local rc=0 msg
  if [[ "$failed" -gt 0 ]]; then rc=2
    msg="$failed failed / $inactive inactive / $active active (of $total)"
  elif [[ "$inactive" -ge 5 ]]; then rc=1
    msg="$inactive inactive / $failed failed / $active active (of $total) — verify on reboot"
  else
    msg="$active active / $inactive inactive / $failed failed (of $total)"
  fi
  printf '%s|%s\n' "$([[ $rc -eq 0 ]] && echo PASS || ([[ $rc -eq 1 ]] && echo WARN || echo FAIL))" "$msg"
  return $rc
}

# ---------- run + report ----------
results=()
record() { results+=("$1|$2"); }

if [[ "$RUN_AUDIT" -eq 1 ]]; then audit_inventory; fi

# Each check returns its own rc; pair with `|| true` so set -e doesn't kill us.
set +e
out="$(check_ops_api)";     record "$(printf '%s' "$out" | cut -d'|' -f1)" "ops_api|$(printf '%s' "$out" | cut -d'|' -f2-)"
out="$(check_log_spam)";    record "$(printf '%s' "$out" | cut -d'|' -f1)" "logs|$(printf '%s' "$out" | cut -d'|' -f2-)"
out="$(check_timers)";      record "$(printf '%s' "$out" | cut -d'|' -f1)" "timers|$(printf '%s' "$out" | cut -d'|' -f2-)"
set -e
if [[ ! -s "$AUDIT_LOG" ]] || ! grep -q "=== " "$AUDIT_LOG" 2>/dev/null; then
  record "WARN" "cron_audit|$AUDIT_LOG missing or empty"
else
  record "PASS" "cron_audit|$AUDIT_LOG refreshed today"
fi

overall=PASS
for r in "${results[@]}"; do
  case "$r" in
    FAIL*) overall=FAIL ;;
    WARN*) [[ "$overall" != FAIL ]] && overall=WARN ;;
  esac
done

case "$overall" in
  PASS) rc=0 ;;
  WARN) rc=1 ;;
  FAIL) rc=2 ;;
esac

if [[ "$JSON_MODE" -eq 1 ]]; then
  printf '{\n'
  printf '  "status": "%s",\n' "$overall"
  printf '  "checks": [\n'
  first=1
  for r in "${results[@]}"; do
    lvl="${r%%|*}"; rest="${r#*|}"
    name="${rest%%|*}"; msg="${rest#*|}"
    if [[ "$first" -eq 1 ]]; then first=0; else printf ',\n'; fi
    msg_json="${msg//\\/\\\\}"; msg_json="${msg_json//\"/\\\"}"
    printf '    {"name":"%s","status":"%s","detail":"%s"}' "$name" "$lvl" "$msg_json"
  done
  printf '\n  ],\n'
  printf '  "audit_log": "%s",\n' "$AUDIT_LOG"
  printf '  "timestamp": "%s"\n' "$(date -u +%FT%TZ)"
  printf '}\n'
else
  printf '%s\n' "GoalChain healthcheck — $(date -u '+%F %T UTC')"
  printf '%s\n' "---------------------------------------------"
  for r in "${results[@]}"; do
    lvl="${r%%|*}"; rest="${r#*|}"
    name="${rest%%|*}"; msg="${rest#*|}"
    printf '  %s %-12s %s\n' "$(_level "$lvl")" "$name" "$msg"
  done
  printf '%s\n' "---------------------------------------------"
  printf '  %s overall = %s (rc=%d)\n' "$(_level "$overall")" "$overall" "$rc"
fi
log "exit=$rc overall=$overall"
exit $rc
