#!/usr/bin/env powershell

Write-Host "🦊 MetaMask Configuration Helper for Soko Chain" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Network Configuration:" -ForegroundColor Cyan
Write-Host "Network Name: Soko Chain Local" -ForegroundColor White
Write-Host "RPC URL: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "Chain ID: 1337" -ForegroundColor White
Write-Host "Currency Symbol: ETH" -ForegroundColor White
Write-Host ""

Write-Host "🔑 Test Accounts (Private Keys):" -ForegroundColor Cyan
Write-Host "Platform Owner (Account #0):" -ForegroundColor Yellow
Write-Host "Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host ""

Write-Host "Vendor 1 (Account #1):" -ForegroundColor Yellow
Write-Host "Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor White
Write-Host "Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" -ForegroundColor Gray
Write-Host ""

Write-Host "Vendor 2 (Account #2):" -ForegroundColor Yellow
Write-Host "Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor White
Write-Host "Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" -ForegroundColor Gray
Write-Host ""

Write-Host "Buyer 1 (Account #3):" -ForegroundColor Yellow
Write-Host "Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906" -ForegroundColor White
Write-Host "Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Quick Setup Steps:" -ForegroundColor Cyan
Write-Host "1. Install MetaMask browser extension" -ForegroundColor White
Write-Host "2. Add custom network with the configuration above" -ForegroundColor White
Write-Host "3. Import one or more test accounts using the private keys" -ForegroundColor White
Write-Host "4. Switch to 'Soko Chain Local' network" -ForegroundColor White
Write-Host "5. Navigate to http://localhost:3000 and connect wallet" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  WARNING: These are test keys only! Never use on mainnet!" -ForegroundColor Red
Write-Host ""

# Option to copy configuration to clipboard
$choice = Read-Host "Copy network configuration to clipboard? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    $networkConfig = @"
Network Name: Soko Chain Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
"@
    $networkConfig | Set-Clipboard
    Write-Host "✅ Network configuration copied to clipboard!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📖 For detailed instructions, see METAMASK_SETUP.md" -ForegroundColor Cyan
