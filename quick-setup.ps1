#!/usr/bin/env powershell
# Quick Development Setup Script for Soko Chain

Write-Host "🛍️ Soko Chain - Quick Development Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
    npm install
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🚀 Available Commands:" -ForegroundColor Cyan
Write-Host "npm run dev      - Start full development environment" -ForegroundColor White
Write-Host "npm run node     - Start Hardhat blockchain node only" -ForegroundColor White
Write-Host "npm run deploy   - Deploy smart contracts" -ForegroundColor White
Write-Host "npm run frontend - Start frontend development server only" -ForegroundColor White
Write-Host "npm test         - Run smart contract tests" -ForegroundColor White
Write-Host ""

Write-Host "🦊 MetaMask Setup:" -ForegroundColor Cyan
Write-Host ".\setup-metamask.ps1 - Display MetaMask configuration" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "README.md           - Project overview and setup" -ForegroundColor White
Write-Host "METAMASK_SETUP.md   - Detailed MetaMask configuration" -ForegroundColor White
Write-Host "GITHUB_SETUP.md     - GitHub repository setup guide" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Start development environment now? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting Soko Chain development environment..." -ForegroundColor Green
    Write-Host "This will start both the Hardhat node and frontend server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "✅ Setup complete! Run 'npm run dev' when ready to start developing." -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Quick Links:" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "Blockchain: http://localhost:8545" -ForegroundColor White
    Write-Host "GitHub: https://github.com/MuhsynMB/soko-chain" -ForegroundColor White
}
