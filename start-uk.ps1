# SprechMate UK 英國生活專版啟動器
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SprechMate UK 英國生活專版本地啟動器   " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$bindHost = "127.0.0.1"
$port = 8000
$url = "http://${bindHost}:$port"

function Wait-LocalServerAndOpen {
    param(
        [string]$TargetHost,
        [int]$TargetPort,
        [string]$TargetUrl,
        [int]$MaxWaitMs = 3000,
        [int]$IntervalMs = 100
    )
    $attempts = [Math]::Max(1, [int][Math]::Ceiling($MaxWaitMs / $IntervalMs))
    $isReady = $false
    for ($i = 0; $i -lt $attempts; $i++) {
        $tcp = New-Object System.Net.Sockets.TcpClient
        try {
            $async = $tcp.BeginConnect($TargetHost, $TargetPort, $null, $null)
            if ($async.AsyncWaitHandle.WaitOne($IntervalMs, $false) -and $tcp.Connected) {
                $tcp.EndConnect($async)
                $isReady = $true
                break
            }
        } catch {
        } finally {
            $tcp.Close()
        }
        Start-Sleep -Milliseconds $IntervalMs
    }
    if ($isReady) {
        Write-Host "[OK] 伺服器已就緒，正在開啟瀏覽器..." -ForegroundColor Green
    } else {
        Write-Host "[!] 伺服器啟動較慢，正在開啟瀏覽器 ($TargetUrl)..." -ForegroundColor Yellow
    }
    Start-Process $TargetUrl
}

$pyCmd = Get-Command python -ErrorAction SilentlyContinue
$npxCmd = Get-Command npx -ErrorAction SilentlyContinue

if ($pyCmd) {
    Write-Host "正在啟動 SprechMate UK 本地伺服器 (僅限本機 127.0.0.1): $url ..." -ForegroundColor Green
    $serverProc = Start-Process -FilePath $pyCmd.Source -ArgumentList @("-m", "http.server", "$port", "--bind", $bindHost) -NoNewWindow -PassThru
    try {
        Wait-LocalServerAndOpen -TargetHost $bindHost -TargetPort $port -TargetUrl $url
        $serverProc.WaitForExit()
    } finally {
        if ($serverProc -and -not $serverProc.HasExited) {
            Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
        }
    }
} elseif ($npxCmd) {
    Write-Host "[!] 未偵測到 Python，正在改用 npx serve 啟動 SprechMate UK 本地伺服器 (僅限本機 127.0.0.1): $url ..." -ForegroundColor Yellow
    $serverProc = Start-Process -FilePath $npxCmd.Source -ArgumentList @("serve", "-p", "$port", "-l", $bindHost, ".") -NoNewWindow -PassThru
    try {
        Wait-LocalServerAndOpen -TargetHost $bindHost -TargetPort $port -TargetUrl $url
        $serverProc.WaitForExit()
    } finally {
        if ($serverProc -and -not $serverProc.HasExited) {
            Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "[!] 未偵測到 Python，請先安裝 Python 3 或使用 npx serve。" -ForegroundColor Red
    Write-Host "    你亦可以直接將此目錄上載至 Cloudflare Pages 免費託管。" -ForegroundColor Yellow
    Pause
}
