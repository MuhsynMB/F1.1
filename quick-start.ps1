Write-Host "🚀 Starting Soko Chain Development Environment" -ForegroundColor Green
Write-Host ""

# Kill any existing processes on our ports
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8545, 3000 -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        $pid = (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Id
        if ($pid) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process on port $($_.LocalPort)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
}

# Start Hardhat node in background
Write-Host "⛓️  Starting Hardhat blockchain node..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx hardhat node" -WindowStyle Minimized

# Wait for Hardhat to start
Write-Host "⏳ Waiting for blockchain to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if Hardhat is running
$hardhatRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $hardhatRunning = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $hardhatRunning) {
    Write-Host "❌ Failed to start Hardhat node!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Hardhat node is running on localhost:8545" -ForegroundColor Green

# Deploy contract
Write-Host "📝 Deploying smart contract..." -ForegroundColor Cyan
try {
    $deployOutput = npx hardhat run scripts/deploy.ts --network localhost 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host $deployOutput -ForegroundColor Gray
    } else {
        Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
        Write-Host $deployOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during deployment: $_" -ForegroundColor Red
    exit 1
}

# Start frontend
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Cyan
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 Soko Chain development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📱 Vendor Page: http://localhost:3000/RegVen" -ForegroundColor Cyan
Write-Host "⛓️  Blockchain: http://localhost:8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To add Hardhat network to MetaMask:" -ForegroundColor Yellow
Write-Host "   Network Name: Hardhat Local" -ForegroundColor Gray
Write-Host "   RPC URL: http://localhost:8545" -ForegroundColor Gray
Write-Host "   Chain ID: 31337" -ForegroundColor Gray
Write-Host "   Currency: ETH" -ForegroundColor Gray
Write-Host ""
Write-Host "🔑 Test accounts are in: hardhat-accounts.txt" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
