# Windsurf 配置/扩展 迁移到 F 盘 —— 方案 A（--user-data-dir / --extensions-dir）
# 自动结束 Windsurf 进程后执行迁移；以分离进程方式启动，可独立于父进程运行。
$ErrorActionPreference = 'Stop'

$srcUserData   = "$env:APPDATA\Windsurf"
$srcExtensions = "$env:USERPROFILE\.windsurf\extensions"
$dstRoot       = 'F:\WindsurfData'
$dstUserData   = Join-Path $dstRoot 'user-data'
$dstExtensions = Join-Path $dstRoot 'extensions'
$exe           = 'D:\Software\Windsurf\Windsurf.exe'
$lnk           = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Windsurf\Windsurf.lnk"
$backupDir     = Join-Path $dstRoot '_backup'

New-Item -ItemType Directory -Force -Path $dstRoot, $backupDir | Out-Null
$logFile = Join-Path $backupDir ('migrate_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.log')
Start-Transcript -Path $logFile -Force | Out-Null
Write-Host "==> 日志: $logFile"

# 1) 等待 + 强制结束 Windsurf
Write-Host "==> 5 秒后结束 Windsurf 进程..."
Start-Sleep -Seconds 5
$tries = 0
while ($tries -lt 6) {
    $procs = Get-Process Windsurf -ErrorAction SilentlyContinue
    if (-not $procs) { break }
    Write-Host ("    第 {0} 次: 结束 {1} 个 Windsurf 进程" -f ($tries+1), $procs.Count)
    $procs | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    $tries++
}
if (Get-Process Windsurf -ErrorAction SilentlyContinue) {
    Write-Host "[!] 仍有 Windsurf 进程残留，终止迁移以保证数据一致。" -ForegroundColor Red
    Stop-Transcript | Out-Null
    exit 1
}
Write-Host "==> Windsurf 已全部退出"

# 2) 创建目标目录
New-Item -ItemType Directory -Force -Path $dstUserData, $dstExtensions, $backupDir | Out-Null

# 3) robocopy 复制（保留 ACL/时间戳；/MIR 不用，避免误删）
Write-Host "==> 复制 user-data ..." -ForegroundColor Cyan
robocopy $srcUserData   $dstUserData   /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Null
Write-Host "==> 复制 extensions ..." -ForegroundColor Cyan
robocopy $srcExtensions $dstExtensions /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Null

# 4) 比对大小，确认复制成功
function Get-DirSize($p) {
    if (Test-Path $p) { (Get-ChildItem $p -Recurse -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum } else { 0 }
}
$pairs = @(
    @{Name='user-data';   Src=$srcUserData;   Dst=$dstUserData},
    @{Name='extensions';  Src=$srcExtensions; Dst=$dstExtensions}
)
foreach ($p in $pairs) {
    $s = Get-DirSize $p.Src
    $d = Get-DirSize $p.Dst
    Write-Host ("    {0,-10} src={1:N1} MB  dst={2:N1} MB" -f $p.Name, ($s/1MB), ($d/1MB))
    if ($d -lt $s * 0.95) { throw "[$($p.Name)] 复制后体积异常（< 源 95%），请检查。" }
}

# 5) 备份并修改快捷方式
if (Test-Path $lnk) {
    Copy-Item $lnk (Join-Path $backupDir ('Windsurf.lnk.bak_' + (Get-Date -Format 'yyyyMMddHHmmss'))) -Force
    $sh = New-Object -ComObject WScript.Shell
    $s  = $sh.CreateShortcut($lnk)
    $s.TargetPath       = $exe
    $s.Arguments        = '--user-data-dir "{0}" --extensions-dir "{1}"' -f $dstUserData, $dstExtensions
    $s.WorkingDirectory = Split-Path $exe
    $s.Save()
    Write-Host "==> 已更新开始菜单快捷方式: $lnk" -ForegroundColor Green
    Write-Host ("    Args = " + $s.Arguments)
} else {
    Write-Host "[!] 未找到开始菜单快捷方式，跳过" -ForegroundColor Yellow
}

# 6) 同步包装 windsurf.cmd，让命令行 / 任务栏 / 第三方调用都走新路径
$binCmd = 'D:\Software\Windsurf\bin\windsurf.cmd'
if (Test-Path $binCmd) {
    Copy-Item $binCmd (Join-Path $backupDir ('windsurf.cmd.bak_' + (Get-Date -Format 'yyyyMMddHHmmss'))) -Force
    Write-Host "==> windsurf.cmd 已备份到 $backupDir（如需让 CLI 也走新路径，告诉我，我再单独处理，避免改写厂商脚本）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "完成。请用开始菜单的 Windsurf 启动，确认：" -ForegroundColor Green
Write-Host "  1) 设置/主题/键位 仍在"
Write-Host "  2) 扩展列表完整"
Write-Host "  3) Cascade 历史/记忆 仍在（这部分在 .codeium，方案 A 不动它）"
Write-Host ""
Write-Host "确认无误后，可手动删除以下旧目录释放空间："
Write-Host "  $srcUserData"
Write-Host "  $srcExtensions"

Stop-Transcript | Out-Null
