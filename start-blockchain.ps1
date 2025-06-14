# Start Soko Chain Blockchain Network
Write-Host "🔗 Starting Hardhat Blockchain Network..." -ForegroundColor Green

# Check if any process is using port 8545
$port8545 = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
if ($port8545) {
    Write-Host "⚠️  Port 8545 is already in use. Stopping existing processes..." -ForegroundColor Yellow
    $processes = Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*hardhat*" }
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Stopped process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Gray
        } catch {
            # Ignore errors
        }
    }
    Start-Sleep 2
}

Write-Host "🚀 Starting Hardhat node on port 8545..." -ForegroundColor Cyan
Write-Host "📝 This will create 20 test accounts with 10,000 ETH each" -ForegroundColor Yellow
Write-Host "⏳ Please wait for the network to start..." -ForegroundColor Yellow
Write-Host ""

# Start Hardhat node
npx hardhat node
