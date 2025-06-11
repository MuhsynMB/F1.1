# Test Soko Chain Marketplace
# Complete testing workflow after GitHub push

Write-Host "🧪 Testing Soko Chain Marketplace..." -ForegroundColor Green

# Start Hardhat local network
Write-Host "1️⃣ Starting Hardhat network..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx hardhat node" -WindowStyle Minimized

Start-Sleep 3

# Deploy contracts
Write-Host "2️⃣ Deploying contracts..." -ForegroundColor Yellow
npx hardhat run scripts/deploy.ts --network localhost

# Start frontend
Write-Host "3️⃣ Starting frontend on port 3000..." -ForegroundColor Yellow
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Write-Host "✅ Testing setup complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⛓️  Network: Hardhat Local (Chain ID: 31337)" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🔧 Test Checklist:" -ForegroundColor Yellow
Write-Host "   ✓ Connect MetaMask wallet" -ForegroundColor White
Write-Host "   ✓ Register as vendor" -ForegroundColor White
Write-Host "   ✓ Add products" -ForegroundColor White
Write-Host "   ✓ Browse and purchase" -ForegroundColor White
