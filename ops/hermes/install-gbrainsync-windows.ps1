# install-gbrainsync-windows.ps1 — Scheduled Task for gbrainsync-client.ps1.
# Usage: powershell -ExecutionPolicy Bypass -File install-gbrainsync-windows.ps1 [-Uninstall]
# Creates a task that runs gbrainsync-client.ps1 every 60 seconds.

param([switch]$Uninstall)

$TaskName = 'GBrainSync'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClientScript = Join-Path $ScriptDir 'gbrainsync-client.ps1'
$SyncDir = "$env:USERPROFILE\.gbrain\sync"

if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -EA SilentlyContinue
    Write-Host "[gbrainsync-windows] unregistered task '$TaskName'"
    exit 0
}

if (-not (Test-Path $SyncDir)) {
    New-Item -ItemType Directory -Path $SyncDir -Force | Out-Null
}

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ClientScript`""

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Seconds 60) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -EA SilentlyContinue
Register-ScheduledTask -TaskName $TaskName `
    -Action $action -Trigger $trigger -Settings $settings `
    -Description 'GBrain sync polling client (every 60s via Tailscale)'

Write-Host "[gbrainsync-windows] registered task '$TaskName' — runs every 60s"
Write-Host "[gbrainsync-windows] logs at $SyncDir\client.log"
