$ErrorActionPreference = 'SilentlyContinue'
$cut = (Get-Date).AddDays(-30)

Write-Host "====================== [1] where.exe 可执行定位 ======================"
foreach ($e in 'windsurf','codex','codex.cmd','hermes','hermes-agent','ollama','claude','node','npm','python','pip','uv','pipx') {
    Write-Host ("-- {0} --" -f $e)
    cmd /c "where $e" 2>$null
}

Write-Host ""
Write-Host "====================== [2] 注册表 Uninstall 中的 AI 相关条目 ======================"
$paths = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
         'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
         'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
Get-ItemProperty $paths |
    Where-Object { $_.DisplayName -match 'windsurf|codex|hermes|claude|cursor|ollama|copilot|openai|chatgpt|codeium|lm.?studio|anthropic|gemini|perplexity|huggingface|continue|cline|roo|aider' } |
    Select-Object DisplayName, DisplayVersion, Publisher, InstallLocation, InstallDate |
    Format-Table -AutoSize | Out-String -Width 400

Write-Host ""
Write-Host "====================== [3] 用户主目录下 AI 相关 dot 目录 ======================"
$names = '.codeium','.windsurf','.codex','.ollama','.continue','.cursor','.claude','.anthropic','.openai','.hermes','.lmstudio','.aider','.gemini','.cache\huggingface'
foreach ($n in $names) {
    $p = Join-Path $env:USERPROFILE $n
    if (Test-Path $p) {
        $lw = (Get-Item $p).LastWriteTime
        Write-Host ("FOUND  {0}    LastWrite={1}" -f $p, $lw)
    }
}

Write-Host ""
Write-Host "====================== [4] AppData\Roaming 下 AI 相关目录 ======================"
Get-ChildItem $env:APPDATA -Directory |
    Where-Object { $_.Name -match 'windsurf|codeium|codex|claude|cursor|ollama|chatgpt|openai|anthropic|hermes|lm.?studio|continue|aider|gemini|copilot' } |
    Select-Object FullName, LastWriteTime | Format-Table -AutoSize | Out-String -Width 400

Write-Host "====================== [5] AppData\Local 下 AI 相关目录 ======================"
Get-ChildItem $env:LOCALAPPDATA -Directory |
    Where-Object { $_.Name -match 'windsurf|codeium|codex|claude|cursor|ollama|chatgpt|openai|anthropic|hermes|lm.?studio|continue|aider|gemini|copilot' } |
    Select-Object FullName, LastWriteTime | Format-Table -AutoSize | Out-String -Width 400

Write-Host "====================== [6] LocalAppData\Programs 下 AI 相关目录 ======================"
$prog = Join-Path $env:LOCALAPPDATA 'Programs'
if (Test-Path $prog) {
    Get-ChildItem $prog -Directory |
        Where-Object { $_.Name -match 'windsurf|codeium|codex|claude|cursor|ollama|chatgpt|openai|anthropic|hermes|lm.?studio|continue|aider|gemini|copilot' } |
        Select-Object FullName, LastWriteTime | Format-Table -AutoSize | Out-String -Width 400
}

Write-Host ""
Write-Host "====================== [7] 最近 30 天新增/改动的程序目录 ======================"
$roots = @((Join-Path $env:LOCALAPPDATA 'Programs'), $env:APPDATA, 'C:\Program Files', 'C:\Program Files (x86)')
foreach ($r in $roots) {
    if (Test-Path $r) {
        Write-Host ("---- {0} ----" -f $r)
        Get-ChildItem $r -Directory |
            Where-Object { $_.LastWriteTime -gt $cut } |
            Sort-Object LastWriteTime -Descending |
            Select-Object Name, LastWriteTime | Format-Table -AutoSize | Out-String -Width 400
    }
}

Write-Host ""
Write-Host "====================== [8] npm 全局包（可能含 codex / aider 等 CLI） ======================"
$npmRoot = (cmd /c "npm root -g" 2>$null)
Write-Host ("npm global root: {0}" -f $npmRoot)
cmd /c "npm ls -g --depth=0" 2>$null

Write-Host ""
Write-Host "====================== [9] Python 用户级包路径 ======================"
cmd /c "python -m site" 2>$null

Write-Host ""
Write-Host "====================== [10] PATH 中与 AI 相关的目录 ======================"
($env:Path -split ';') | Where-Object { $_ -match 'windsurf|codeium|codex|claude|cursor|ollama|chatgpt|openai|anthropic|hermes|lm.?studio|continue|aider|gemini|copilot|node|python' }
