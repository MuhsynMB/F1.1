#!/usr/bin/env powershell

Write-Host "🚀 Starting Soko Chain Marketplace..." -ForegroundColor Green

# Kill existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start Hardhat node
Write-Host "Starting Hardhat blockchain node..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npx hardhat node" -WindowStyle Normal

# Wait for node to start
Write-Host "Waiting for blockchain to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Compile and deploy contracts
Write-Host "Compiling contracts..." -ForegroundColor Cyan
npx hardhat compile

Write-Host "Deploying smart contract..." -ForegroundColor Cyan
npx hardhat run scripts/deploy.ts --network localhost

# Test connection
Write-Host "Testing blockchain connection..." -ForegroundColor Cyan
node test-connection.js

# Start frontend
Write-Host "Starting frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

# Wait and open browser
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "✅ Soko Chain Marketplace is ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Blockchain: http://localhost:8545" -ForegroundColor White
