# Ensure script runs with Administrator privileges
$myWindowsID = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$myWindowsPrincipal = New-Object System.Security.Principal.WindowsPrincipal($myWindowsID)
$adminRole = [System.Security.Principal.WindowsBuiltInRole]::Administrator

if (-not $myWindowsPrincipal.IsInRole($adminRole)) {
    Write-Host "No se está ejecutando como Administrador. Elevando privilegios..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    Exit
}

Write-Host "Ejecutando como Administrador. Forzando modo Wi-Fi estable (802.11n / 2.4GHz)..." -ForegroundColor Green

$wifiPath = "HKLM:\System\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}\0001"

# 1. Configurar WirelessMode en 4 (fuerza 802.11b/g/n, desactiva 802.11ac de 5Ghz)
# El chip Realtek 8821CE tiene fallos de firmware graves con la modulación AC en 5Ghz que tumban la tarjeta entera.
Write-Host "Configurando Wireless Mode a 802.11b/g/n (Desactivando AC/5Ghz)..."
Set-ItemProperty -Path $wifiPath -Name "WirelessMode" -Value "4"

# 2. Configurar PreferBand en 1 (Preferir banda de 2.4Ghz)
Write-Host "Configurando Preferencia de Banda a 2.4Ghz..."
Set-ItemProperty -Path $wifiPath -Name "PreferBand" -Value "1"

Write-Host "Cambios aplicados con éxito. Presiona cualquier tecla para salir..." -ForegroundColor Green
Read-Host
