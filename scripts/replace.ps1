$content = Get-Content -Raw -Path docs\app.html -Encoding UTF8
$replacement = Get-Content -Raw -Path scripts\ai_hub_new.html -Encoding UTF8
$pattern = '(?s)\s*<!-- SECTION: AI AGENT HUB -->.*?<!-- SECTION: MINIGAMES HUB \(NEW\) -->'
$newContent = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, "`n$replacement")
Set-Content -Path docs\app.html -Value $newContent -Encoding UTF8
