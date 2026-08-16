# PowerShell script to verify and setup MCP bridge on Windows Antigravity

$ErrorActionPreference = "Stop"

Write-Host "=== MCP Windows Antigravity Diagnostics & Setup ===" -ForegroundColor Cyan

# 1. Test Node.js availability
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH."
}

$nodeVersion = node -v
Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green

# 2. Check mcp_sse_bridge.js path
$bridgePath = Join-Path $PSScriptRoot "mcp_sse_bridge.js"
if (-not (Test-Path $bridgePath)) {
    Write-Error "Bridge script not found at $bridgePath"
}
Write-Host "[OK] MCP Bridge script located at: $bridgePath" -ForegroundColor Green

# 3. Test HTTP connectivity to OmniRoute MCP Stream endpoint
$omniMcpUrl = "http://100.101.211.44:20128/api/mcp/stream"
try {
    $resp = Invoke-WebRequest -Uri $omniMcpUrl -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "[OK] OmniRoute MCP Stream Endpoint reachable (HTTP $($resp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] OmniRoute MCP Stream Endpoint check ($omniMcpUrl): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "=== Setup completed successfully ===" -ForegroundColor Cyan
