$ErrorActionPreference = 'SilentlyContinue'

Write-Host "====================== [1] Windsurf 进程是否在运行 ======================"
Get-Process | Where-Object { $_.ProcessName -match 'windsurf|Code' } |
    Select-Object Id, ProcessName, Path | Format-Table -AutoSize | Out-String -Width 300

Write-Host "====================== [2] 待迁移目录大小 ======================"
$targets = @(
    "$env:APPDATA\Windsurf",
    "$env:USERPROFILE\.windsurf\extensions"
)
foreach ($t in $targets) {
    if (Test-Path $t) {
        $size = (Get-ChildItem $t -Recurse -Force | Measure-Object -Property Length -Sum).Sum
        $mb = [math]::Round($size/1MB,1)
        Write-Host ("{0}   ->  {1} MB" -f $t, $mb)
    } else {
        Write-Host ("{0}   ->  (不存在)" -f $t)
    }
}

Write-Host ""
Write-Host "====================== [3] F 盘可用空间 ======================"
Get-PSDrive F | Format-Table Name, @{n='Used(GB)';e={[math]::Round($_.Used/1GB,1)}}, @{n='Free(GB)';e={[math]::Round($_.Free/1GB,1)}} -AutoSize

Write-Host ""
Write-Host "====================== [4] 现有 Windsurf 快捷方式 ======================"
$lnkRoots = @(
    "$env:USERPROFILE\Desktop",
    "$env:PUBLIC\Desktop",
    "$env:APPDATA\Microsoft\Windows\Start Menu",
    "$env:ProgramData\Microsoft\Windows\Start Menu",
    "$env:APPDATA\Microsoft\Internet Explorer\Quick Launch"
)
$sh = New-Object -ComObject WScript.Shell
$lnkResults = foreach ($r in $lnkRoots) {
    if (Test-Path $r) {
        Get-ChildItem $r -Recurse -Filter *.lnk | ForEach-Object {
            $s = $sh.CreateShortcut($_.FullName)
            if ($s.TargetPath -match 'Windsurf') {
                [pscustomobject]@{
                    Lnk        = $_.FullName
                    Target     = $s.TargetPath
                    Args       = $s.Arguments
                    WorkingDir = $s.WorkingDirectory
                }
            }
        }
    }
}
$lnkResults | Format-List

Write-Host ""
Write-Host "====================== [5] F:\WindsurfData 目标占用情况 ======================"
$dest = 'F:\WindsurfData'
if (Test-Path $dest) {
    Write-Host ("已存在: {0}" -f $dest)
    Get-ChildItem $dest | Format-Table -AutoSize
} else {
    Write-Host ("尚未创建: {0}" -f $dest)
}
