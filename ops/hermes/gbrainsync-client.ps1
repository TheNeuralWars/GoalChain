# gbrainsync-client.ps1 — Windows polling client for gbrain-sync-server.
# Issue #827. Polls VPS via Tailscale IP. Idempotent per run.
# Usage: powershell -ExecutionPolicy Bypass -File gbrainsync-client.ps1
# Env:   VPS_TS_IP (default 100.101.211.44)

$ErrorActionPreference = 'SilentlyContinue'

$VPS_TS_IP = if ($env:VPS_TS_IP) { $env:VPS_TS_IP } else { '100.101.211.44' }
$UrlBase = if ($env:GBRAIN_SYNC_URL) { $env:GBRAIN_SYNC_URL } else { "http://${VPS_TS_IP}:8648" }
$SyncDir = "$env:USERPROFILE\.gbrain\sync"
$StateFile = "$SyncDir\last-seen.ts"
$LogFile = "$SyncDir\client.log"

if (-not (Test-Path $SyncDir)) { New-Item -ItemType Directory -Path $SyncDir -Force | Out-Null }

function Write-Log($msg) {
    $ts = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    Add-Content -Path $LogFile -Value "[$ts] [gbrainsync-client] $msg"
}

$last = 0
if (Test-Path $StateFile) {
    $raw = (Get-Content $StateFile -Raw).Trim()
    if ($raw -match '^\d+$') { $last = [int64]$raw }
}

$url = "$UrlBase/sync/since/$last"
Write-Log "tick (since=$last) GET $url"

try {
    $resp = Invoke-RestMethod -Uri $url -TimeoutSec 8 -ErrorAction Stop
    if ($resp -and $resp.Count -gt 0) {
        $maxTs = ($resp | ForEach-Object { $_.ts } | Measure-Object -Maximum).Maximum
        if ($maxTs -gt $last) {
            Write-Log "applied $maxTs (advanced $($maxTs - $last)s)"
            $last = $maxTs
        } else {
            Write-Log "no-advance (server_max=$maxTs)"
        }
    } else {
        Write-Log "no changes since $last"
    }
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
}

Set-Content -Path $StateFile -Value $last
