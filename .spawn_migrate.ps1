$cmd = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "F:\AIsaibotumu\Test-1\.migrate_windsurf.ps1"'
$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd }
Write-Host ("Spawned PID = {0}    ReturnValue = {1}  (0=成功)" -f $r.ProcessId, $r.ReturnValue)
