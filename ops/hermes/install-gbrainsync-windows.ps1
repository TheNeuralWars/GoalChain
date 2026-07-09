# Install GBrain sync for Windows

# Create the GBrain directory if it doesn't exist
if (!(Test-Path "$env:USERPROFILE\.gbrainsync")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.gbrainsync" -Force
}

# Download the GBrain binary
Invoke-WebRequest -Uri "https://example.com/gbrain-windows.exe" -OutFile "$env:USERPROFILE\.gbrainsync\gbrain.exe"

# Add GBrain to the PATH
if (!(Get-Command "gbrain.exe" -ErrorAction SilentlyContinue)) {
    $path = "$env:USERPROFILE\.gbrainsync"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$path*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$path", "User")
    }
}

# Verify installation
if (Get-Command "gbrain.exe" -ErrorAction SilentlyContinue) {
    Write-Host "GBrain sync installed successfully"
} else {
    Write-Host "GBrain sync installation failed"
    exit 1
}
