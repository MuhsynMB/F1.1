# Soko Chain Connection Diagnostic
Write-Host "🔍 Soko Chain Connection Diagnostic" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check Hardhat node
Write-Host "1️⃣ Checking Hardhat Node..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    $chainId = [convert]::ToInt32($result.result, 16)
    Write-Host "   ✅ Hardhat node is running" -ForegroundColor Green
    Write-Host "   📡 Chain ID: $chainId (should be 1337)" -ForegroundColor Cyan
    Write-Host "   🌐 RPC URL: http://127.0.0.1:8545" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Hardhat node is NOT running" -ForegroundColor Red
    Write-Host "   💡 Run: npx hardhat node" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check contract deployment
Write-Host "2️⃣ Checking Contract Deployment..." -ForegroundColor Yellow
$contractAddressFile = ".\frontend\src\contracts\contract-address.json"
if (Test-Path $contractAddressFile) {
    $contractData = Get-Content $contractAddressFile | ConvertFrom-Json
    $contractAddress = $contractData.SokoChain
    Write-Host "   ✅ Contract address file exists" -ForegroundColor Green
    Write-Host "   📍 Contract address: $contractAddress" -ForegroundColor Cyan
    
    # Test contract call
    try {
        $contractCall = @{
            jsonrpc = "2.0"
            method = "eth_call"
            params = @(
                @{
                    to = $contractAddress
                    data = "0x8da5cb5b"  # owner() function selector
                }
                "latest"
            )
            id = 1
        } | ConvertTo-Json -Depth 3
        
        $callResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body $contractCall -ContentType "application/json"
        Write-Host "   ✅ Contract is accessible" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Contract might not be deployed correctly" -ForegroundColor Yellow
        Write-Host "   💡 Try: npx hardhat run scripts/deploy.ts --network localhost" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Contract address file not found" -ForegroundColor Red
    Write-Host "   💡 Deploy contract: npx hardhat run scripts/deploy.ts --network localhost" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend
Write-Host "3️⃣ Checking Frontend..." -ForegroundColor Yellow
$frontendPort = 3000
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Frontend is running on port $frontendPort" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   💡 Start frontend: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# MetaMask configuration
Write-Host "4️⃣ MetaMask Configuration Checklist..." -ForegroundColor Yellow
Write-Host "   📋 Verify these settings in MetaMask:" -ForegroundColor Cyan
Write-Host "      • Network Name: Any name (e.g., 'Soko Chain Local')" -ForegroundColor White
Write-Host "      • RPC URL: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "      • Chain ID: 1337" -ForegroundColor White
Write-Host "      • Currency Symbol: ETH" -ForegroundColor White
Write-Host ""
Write-Host "   🔑 Import test account (Account #1 for vendor testing):" -ForegroundColor Cyan
Write-Host "      Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "   1. Configure MetaMask with the settings above" -ForegroundColor White
Write-Host "   2. Connect MetaMask to http://localhost:3000" -ForegroundColor White
Write-Host "   3. Try registering as a vendor" -ForegroundColor White
Write-Host ""
Write-Host "✨ If still having issues, check browser console (F12) for errors" -ForegroundColor Yellow
