# migrate_to_clean_repo.ps1
# Script de migración limpia de GoalChain

$source = "c:\Users\NicoPez\goalchain"
$destination = "c:\Users\NicoPez\goalchain-clean"

if (!(Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination | Out-Null
    Write-Host "Creado directorio destino: $destination"
}

# Carpetas activas a migrar
$folders = @(
    "goalchain_webapp",
    "docs",
    "goalchain_program",
    "goalchain_oracle",
    "goalchain-sdk",
    "goalchain_api",
    "agentic-inbox",
    "hermes",
    "scripts",
    ".github",
    ".git"
)

# Archivos de configuración y documentación activos en la raíz
$rootFiles = @(
    ".gitignore",
    "README.md",
    "CLAUDE.md",
    "AGENT_GUIDE.md",
    "SETUP_WINDOWS.md",
    "WORKFLOW.md",
    "ZCODE_ONBOARDING.md",
    "gbrain.yml"
)

Write-Host "=== Iniciando purga y copia limpia ==="

foreach ($folder in $folders) {
    $srcFolder = Join-Path $source $folder
    $destFolder = Join-Path $destination $folder
    if (Test-Path $srcFolder) {
        Write-Host "Copiando carpeta activa: $folder..."
        # Robocopy excluyendo carpetas pesadas/generadas
        # exit code < 8 es éxito en robocopy
        robocopy $srcFolder $destFolder /E /XD node_modules dist target .wrangler build .turbo .next /R:0 /W:0 /NDL /NFL /NJH /NJS | Out-Null
    }
}

foreach ($file in $rootFiles) {
    $srcFile = Join-Path $source $file
    $destFile = Join-Path $destination $file
    if (Test-Path $srcFile) {
        Write-Host "Copiando archivo raíz: $file..."
        Copy-Item -Path $srcFile -Destination $destFile -Force
    }
}

Write-Host "=== Migración limpia completada con éxito ==="
