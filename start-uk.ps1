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
        [int]$MaxWaitMs = 15000,
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
if ($pyCmd) {
    # 排除 Windows 10/11 未安裝 Python 時之 Microsoft Store 偽捷徑 (WindowsApps\python.exe 退出碼 9009)
    try {
        if (($pyCmd.Source -like "*\WindowsApps\python*.exe") -and ((Get-Item $pyCmd.Source -ErrorAction SilentlyContinue).Length -eq 0)) {
            $pyVer = & $pyCmd.Source --version 2>&1
            if ($LASTEXITCODE -ne 0 -or ("$pyVer" -notmatch '^Python 3\.')) {
                $pyCmd = $null
            }
        } else {
            $pyVer = & $pyCmd.Source --version 2>&1
            if ($LASTEXITCODE -ne 0 -or ("$pyVer" -notmatch '^Python 3\.')) {
                $pyCmd = $null
            }
        }
    } catch {
        $pyCmd = $null
    }
}

# Windows 下優先解析 npx.cmd (Application)，避免 Start-Process -NoNewWindow 直接執行 npx.ps1 拋出 Win32Exception
$npxCmd = $null
if ($env:OS -eq "Windows_NT") {
    $npxCmd = Get-Command npx.cmd -ErrorAction SilentlyContinue
}
if (-not $npxCmd) {
    $npxCmd = Get-Command npx -ErrorAction SilentlyContinue
    if ($npxCmd -and $npxCmd.CommandType -eq "ExternalScript" -and $npxCmd.Source -like "*.ps1") {
        $cmdCandidate = [System.IO.Path]::ChangeExtension($npxCmd.Source, ".cmd")
        if (Test-Path -LiteralPath $cmdCandidate) {
            $npxCmd = Get-Command $cmdCandidate -ErrorAction SilentlyContinue
        } else {
            $npxCmd = $null
        }
    }
}

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
    $serverProc = Start-Process -FilePath $npxCmd.Source -ArgumentList @("--yes", "serve", "-l", "tcp://${bindHost}:$port", ".") -NoNewWindow -PassThru
    try {
        Wait-LocalServerAndOpen -TargetHost $bindHost -TargetPort $port -TargetUrl $url
        $serverProc.WaitForExit()
    } finally {
        if ($serverProc -and -not $serverProc.HasExited) {
            if ($env:OS -eq "Windows_NT") {
                & taskkill.exe /PID $serverProc.Id /T /F 2>$null | Out-Null
            }
            Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "[!] 未偵測到 Python，請先安裝 Python 3 或使用 npx serve。" -ForegroundColor Red
    Write-Host "    你亦可以直接將此目錄上載至 Cloudflare Pages 免費託管。" -ForegroundColor Yellow
    Pause
}
