@echo off
echo Starting Soko Chain Development Environment...
echo.

echo [1/3] Starting Hardhat Node...
start "Hardhat Node" cmd /k "cd /d %~dp0 && npx hardhat node"

echo [2/3] Waiting for Hardhat node to start...
timeout /t 5 /nobreak > nul

echo [3/3] Deploying Smart Contract...
npx hardhat run scripts/deploy.js --network localhost

echo.
echo ================================
echo Development environment ready!
echo ================================
echo Hardhat Node: http://localhost:8545
echo Frontend: http://localhost:3000
echo.
echo To start the frontend, run: npm run dev
echo.
pause
