Write-Host "🚀 Starting Soko Chain Development Environment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Function to check if a port is listening
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Step 1: Check if Hardhat node is running
Write-Host "🔍 Checking if Hardhat node is running on port 8545..." -ForegroundColor Cyan
if (Test-Port -Port 8545) {
    Write-Host "✅ Hardhat node is already running" -ForegroundColor Green
} else {
    Write-Host "❌ Hardhat node not running. Starting it now..." -ForegroundColor Red
    Write-Host "📝 Note: This will start a new terminal window for Hardhat node" -ForegroundColor Yellow
    
    # Start Hardhat node in a new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Hardhat Node...' -ForegroundColor Green; npx hardhat node"
    
    # Wait for the node to start
    Write-Host "⏳ Waiting for Hardhat node to start..." -ForegroundColor Yellow
    $attempts = 0
    do {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "." -NoNewline
    } while (-not (Test-Port -Port 8545) -and $attempts -lt 15)
    
    Write-Host ""
    
    if (Test-Port -Port 8545) {
        Write-Host "✅ Hardhat node started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Hardhat node. Please check for errors." -ForegroundColor Red
        exit 1
    }
}

# Step 2: Deploy the contract
Write-Host "📝 Deploying smart contract..." -ForegroundColor Cyan
try {
    $deployOutput = npx hardhat run scripts/deploy.ts --network localhost 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host $deployOutput
    } else {
        Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
        Write-Host $deployOutput
        exit 1
    }
} catch {
    Write-Host "❌ Error during contract deployment: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Check contract deployment
Write-Host "🔍 Verifying contract deployment..." -ForegroundColor Cyan
if (Test-Path "frontend/src/contracts/contract-address.json") {
    $contractAddress = Get-Content "frontend/src/contracts/contract-address.json" | ConvertFrom-Json
    Write-Host "✅ Contract address file found: $($contractAddress.SokoChain)" -ForegroundColor Green
} else {
    Write-Host "❌ Contract address file not found!" -ForegroundColor Red
    exit 1
}

# Step 4: Start frontend (if not already running)
Write-Host "🎨 Checking frontend development server..." -ForegroundColor Cyan
if (Test-Port -Port 3000) {
    Write-Host "✅ Frontend is already running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting frontend development server..." -ForegroundColor Yellow
    cd frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Frontend...' -ForegroundColor Green; npm run dev"
    cd ..
    
    # Wait for frontend to start
    Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
    $attempts = 0
    do {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "." -NoNewline
    } while (-not (Test-Port -Port 3000) -and $attempts -lt 15)
    
    Write-Host ""
    
    if (Test-Port -Port 3000) {
        Write-Host "✅ Frontend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend may still be starting. Check http://localhost:3000 in a few moments." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Soko Chain Development Environment is Ready!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "📱 Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⛓️  Blockchain RPC: http://localhost:8545" -ForegroundColor Cyan
Write-Host "🆔 Chain ID: 1337" -ForegroundColor Cyan
Write-Host "📝 Contract Address: $($contractAddress.SokoChain)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 MetaMask Setup:" -ForegroundColor Yellow
Write-Host "   - Network Name: Hardhat Local" -ForegroundColor White
Write-Host "   - RPC URL: http://localhost:8545" -ForegroundColor White
Write-Host "   - Chain ID: 1337" -ForegroundColor White
Write-Host "   - Currency Symbol: ETH" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (services will continue running)" -ForegroundColor Gray

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "Script stopped." -ForegroundColor Yellow
}
