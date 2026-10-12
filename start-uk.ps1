# SprechMate UK English Edition Launcher
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SprechMate (芯语伴) 英国生活专版启动器   " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$port = 8000
$url = "http://localhost:$port"

# Check if Python is available
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[OK] 正在启动本地隔离服务器 (仅限本机 127.0.0.1): $url ..." -ForegroundColor Green
    Start-Process $url
    python -m http.server $port --bind 127.0.0.1
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Python 未找到，正在使用 npx serve (仅限本机 127.0.0.1): $url ..." -ForegroundColor Green
    Start-Process $url
    npx serve -p $port -l 127.0.0.1 .
} else {
    Write-Host "[!] 请安装 Python 或 Node.js 以便启动本地安全上下文服务器 (localhost)。" -ForegroundColor Red
    Write-Host "    或者直接将此目录上传至 Cloudflare Pages 免费托管。" -ForegroundColor Yellow
    Pause
}
