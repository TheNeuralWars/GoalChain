# install-gbrainsync-windows.ps1
#
# One-shot installer for Windows 10/11: registers a Scheduled Task
# (GoalChain\GBrainSync) that polls the VPS gbrain-sync server over Tailscale
# every 60 seconds and runs `gbrain import` on every diff.
#
# Usage (PowerShell — elevated is not required):
#   [Environment]::SetEnvironmentVariable('VPS_TS_IP','100.101.211.44','User')
#   powershell -ExecutionPolicy Bypass -File .\install-gbrainsync-windows.ps1
#
#   .\install-gbrainsync-windows.ps1 -Uninstall   # tear-down
#
# Idempotent. Re-running is safe. The Uninstall switch reverses everything.
#
# Pre-requisites (auto-detected; weak failures warn, hard failures exit):
#   - Windows 10+ (PS 5.1 minimum; tested on PS 7 if available).
#   - `tailscale.exe` on PATH (else print https://tailscale.com/download/win).
#   - `gbrain` on PATH (else print bun install link).
#   - The repo at $env:USERPROFILE\hermes\workspace\GoalChain unless
#     $env:GOALCHAIN_REPO_PATH overrides it.
#
# After install:
#   - Task Scheduler: \GoalChain\GBrainSync (runs every 60s)
#   - Logs: %LOCALAPPDATA%\GoalChain\sync\client.log
#   - First poll triggers ≤ 5s after registration.

[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

#--- config --------------------------------------------------------------
$VPS_TS_IP     = if ($env:VPS_TS_IP)     { $env:VPS_TS_IP }     else { '100.101.211.44' }
$VPS_SYNC_PORT = if ($env:VPS_SYNC_PORT) { $env:VPS_SYNC_PORT } else { 8648 }
$RepoPath      = if ($env:GOALCHAIN_REPO_PATH) { $env:GOALCHAIN_REPO_PATH }
                 else { Join-Path $env:USERPROFILE 'hermes\workspace\GoalChain' }
$LogDir        = Join-Path $env:LOCALAPPDATA 'GoalChain\sync'
$LogFile       = Join-Path $LogDir 'client.log'
$ClientScript  = Join-Path $LogDir 'gbrainsync-client.ps1'
$TaskName      = 'GoalChain\GBrainSync'
$TaskPath      = '\GoalChain\'
$SubDirs       = @('ai_context','docs/intake')

function Log($msg)   { Write-Host "[gbrainsync-install] $msg" -ForegroundColor Cyan }
function Warn($msg)  { Write-Warning "[gbrainsync-install] $msg" }
function Err($msg)   { Write-Error "[gbrainsync-install] $msg" }

#--- helpers -------------------------------------------------------------
function Ensure-Tailscale {
    if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
        Err "tailscale.exe not found on PATH. Install from https://tailscale.com/download/win then `tailscale up` and re-run."
        exit 2
    }
    try {
        $null = & tailscale status 2>&1
    } catch {
        Err "tailscale daemon not running. Run `tailscale up` first."
        exit 2
    }
}

function Ensure-GBrain {
    if (-not (Get-Command gbrain -ErrorAction SilentlyContinue)) {
        if ($IsWindows -or $env:OS -eq 'Windows_NT') {
            $candidate = Join-Path $env:USERPROFILE '.bun\bin\gbrain.cmd'
        }
        if (Test-Path $candidate) {
            $env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"
        } else {
            Err "gbrain CLI missing. Install bun + gbrain: https://bun.sh/install-windows"
            exit 2
        }
    }
}

function Ensure-RepoPath {
    # Try $env:GOALCHAIN_REPO_PATH first, then USERPROFILE\hermes\workspace\GoalChain,
    # then C:\GoalChain (rsync from her user-clone of the repo).
    if ($env:GOALCHAIN_REPO_PATH -and (Test-Path $env:GOALCHAIN_REPO_PATH)) {
        return $env:GOALCHAIN_REPO_PATH
    }
    foreach ($candidate in @(
        (Join-Path $env:USERPROFILE 'hermes\workspace\GoalChain'),
        (Join-Path $env:USERPROFILE 'workspace\GoalChain'),
        'C:\GoalChain',
        'D:\GoalChain'
    )) {
        if (Test-Path (Join-Path $candidate '.git')) {
            return $candidate
        }
    }
    return $null
}

function Pre-Flight {
    if ($env:OS -ne 'Windows_NT') {
        Err "this installer targets Windows only"
        exit 1
    }
    Ensure-Tailscale
    Ensure-GBrain

    $found = Ensure-RepoPath
    if ($found) {
        $script:RepoPath = $found
        Log "repo detected at $RepoPath"
    } else {
        # Repo is OPTIONAL: the polling client works without it (it'll try
        # `git pull` later if the repo shows up). We just log and move on.
        Log "WARN: no local GoalChain repo found."
        Log "WARN: polling will still work (git pull will be skipped)."
        Log "WARN: clone the repo later if you also want the brain to ingest edited docs:"
        Log "WARN:   cd ~\hermes\workspace && git clone https://github.com/TheNeuralWars/GoalChain.git"
        $script:RepoPath = $null
    }
}

function UnInstall {
    Log "removing scheduled task $TaskName"
    $task = Get-ScheduledTask -TaskPath $TaskPath -TaskName 'GBrainSync' -ErrorAction SilentlyContinue
    if ($task) {
        Unregister-ScheduledTask -InputObject $task -Confirm:$false
    }
    if (Test-Path $ClientScript) {
        Remove-Item $ClientScript -Force
    }
    Log "ok — task gone. Logs left in $LogDir. Wipe with:  Remove-Item -Recurse '$LogDir'"
    exit 0
}

#--- uninstall path ------------------------------------------------------
if ($Uninstall) { UnInstall }

Pre-Flight

#--- build the PowerShell client (the task body) -------------------------
if (-not (Test-Path $LogDir))  { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$BunPath = Join-Path $env:USERPROFILE '.bun\bin'
$ClientScriptContent = @"
# gbrainsync-client.ps1 — auto-generated by install-gbrainsync-windows.ps1.
# Polls VPS gbrain-sync server every 60s; runs gbrain import on every diff.
`$ErrorActionPreference = 'Continue'
`$env:PATH = '$(($BunPath -replace '\\','\\'))' + ';' + `$env:PATH
`$VPS_TS_IP     = '$VPS_TS_IP'
`$VPS_SYNC_PORT = '$VPS_SYNC_PORT'
`$RepoPath      = if (-not '$RepoPath') { '' } else { '$($RepoPath -replace '\\','\\')' }
`$HaveRepo      = `$RepoPath -and (Test-Path `$RepoPath)
`$LogFile       = '$($LogFile -replace '\\','\\')'
`$StateFile     = Join-Path (Split-Path `$LogFile) 'last-sync.ts'
`$SubDirs       = @('ai_context','docs/intake')
`$LAST   = if (Test-Path `$StateFile) { [int64](Get-Content `$StateFile -Raw).Trim() } else { 0 }
`$NOW    = [int64][math]::Floor((Get-Date -UFormat %s))
`$Health = 'http://' + `$VPS_TS_IP + ':' + `$VPS_SYNC_PORT + '/health'
`$Sync   = 'http://' + `$VPS_TS_IP + ':' + `$VPS_SYNC_PORT + '/sync/since/' + `$LAST

Add-Content -Path `$LogFile -Value ('--- tick @ ' + `$NOW + ' (since=' + `$LAST + ') ---')
try {
    `$null = Invoke-RestMethod -Uri `$Health -TimeoutSec 10 -Method Get -ErrorAction Stop
} catch {
    Add-Content -Path `$LogFile -Value ('HEALTH_FAIL: VPS ' + `$VPS_TS_IP + ' unreachable (tailscale/ACL?)')
    exit 0  # benign — keep the loop alive
}
try {
    `$resp = Invoke-RestMethod -Uri `$Sync -TimeoutSec 10 -Method Get -ErrorAction Stop
} catch {
    Add-Content -Path `$LogFile -Value ('SYNC_FAIL: ' + `$_.Exception.Message)
    exit 0
}
if (-not `$resp -or `$resp.Count -eq 0) {
    Add-Content -Path `$LogFile -Value 'no changes since last tick'
    Set-Content -Path `$StateFile -Value `$NOW -Encoding ASCII
    exit 0
}
Add-Content -Path `$LogFile -Value ('fetched ' + `$resp.Count + ' change-records — running gbrain import')
if (`$HaveRepo) {
    Set-Location `$RepoPath
    try {
        `$out = git pull --ff-only 2>&1
    } catch {
        Add-Content -Path `$LogFile -Value 'git pull skipped (offline/diverged)'
    }
} else {
    Add-Content -Path `$LogFile -Value 'no local repo; skipping git pull (run import on its own)'
}
try {
    if (`$HaveRepo) {
        gbrain import `$SubDirs 2>&1 | Out-Null
        Add-Content -Path `$LogFile -Value 'ok'
    } else {
        # Without repo, just record the sync timestamp — nothing to import.
        Add-Content -Path `$LogFile -Value 'ok (no repo)'
    }
} catch {
    Add-Content -Path `$LogFile -Value ('gbrain import failed (pglite lock?): ' + `$_.Exception.Message)
}
Set-Content -Path `$StateFile -Value `$NOW -Encoding ASCII
"@

Set-Content -Path $ClientScript -Value $ClientScriptContent -Encoding UTF8

#--- register the scheduled task ----------------------------------------
# Avoid duplicates by removing an existing one first
$existing = Get-ScheduledTask -TaskPath $TaskPath -TaskName 'GBrainSync' -ErrorAction SilentlyContinue
if ($existing) {
    Log "removing existing task before re-registering"
    Unregister-ScheduledTask -InputObject $existing -Confirm:$false
}

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$ClientScript`""

# Bootstrap from boot, then repeat every 60s using the repetition-duration trick.
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date).AddSeconds(5)).Repetition
$trigger.Repetition.Interval = 'PT1M'
$trigger.Repetition.Duration  = '' # forever

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 2)

try {
    Register-ScheduledTask `
        -TaskName $TaskName.Split('\')[1] `
        -TaskPath $TaskPath `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description "Polls VPS gbrain-sync server every 60s via Tailscale. Forward changes to local gbrain import." `
        -Force | Out-Null

    Log "✅ registered scheduled task $TaskName"
    Log "first sync starts ≤5s"
    Log "logs: Get-Content '$LogFile' -Wait"
    Log "uninstall: powershell -File .\install-gbrainsync-windows.ps1 -Uninstall"
}
catch {
    Err "Register-ScheduledTask failed: $($_.Exception.Message)"
    exit 3
}

#--- kick the task once so first import runs immediately -----------------
Start-ScheduledTask -TaskName 'GBrainSync' -TaskPath $TaskPath | Out-Null
Log "kick-off trigger fired — check $LogFile in 5s"

#--- first import (best effort) -----------------------------------------
if ($RepoPath) {
    try {
        & gbrain import "$RepoPath\ai_context","$RepoPath\docs\intake" 2>&1 | Out-Null
        Log "first import of $(hostname) into local gbrain ✓"
    } catch {
        Warn "first gbrain import skipped: $($_.Exception.Message)"
    }
} else {
    Log "skipping first import — no repo detected. task will run anyway."
}

exit 0
