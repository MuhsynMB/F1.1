@echo off
echo Starting Soko Chain Marketplace...

echo Stopping existing processes...
taskkill /f /im node.exe 2>nul

echo Starting Hardhat blockchain node...
start "Hardhat Node" powershell -NoExit -Command "cd '%~dp0'; npx hardhat node"

echo Waiting for blockchain to start...
timeout /t 5 >nul

echo Compiling and deploying contracts...
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost

echo Starting frontend on port 3000...
start "Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"

echo Done! Opening browser...
timeout /t 3 >nul
start http://localhost:3000

pause
