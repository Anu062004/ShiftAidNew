# PowerShell script to kill process on port 3001
# Usage: .\KILL_PORT.ps1

$port = 3001
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processes) {
    foreach ($proc in $processes) {
        $pid = $proc.OwningProcess
        $processName = (Get-Process -Id $pid).ProcessName
        Write-Host "Killing process: $processName (PID: $pid)"
        Stop-Process -Id $pid -Force
    }
    Write-Host "✅ Port $port is now free"
} else {
    Write-Host "✅ Port $port is already free"
}


