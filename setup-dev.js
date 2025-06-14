#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Soko Chain Development Environment\n');

// Function to run command and return promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`▶️  Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, output, errorOutput });
      } else {
        reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to wait for a condition
function waitFor(conditionFn, timeout = 30000, interval = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      try {
        if (conditionFn()) {
          resolve(true);
          return;
        }
      } catch (error) {
        // Continue checking
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
        return;
      }
      
      setTimeout(check, interval);
    }
    
    check();
  });
}

async function main() {
  try {
    // Step 1: Check if Hardhat node is running
    console.log('🔍 Checking if Hardhat node is running...');
    
    try {
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('netstat -an | findstr "8545"', (error, stdout) => {
          if (stdout.includes('8545')) {
            console.log('✅ Hardhat node is already running');
            resolve(true);
          } else {
            console.log('❌ Hardhat node not running');
            reject(new Error('Not running'));
          }
        });
      });
    } catch (error) {
      // Start Hardhat node
      console.log('🔄 Starting Hardhat node...');
      const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
        stdio: 'pipe',
        shell: true,
        detached: true
      });

      hardhatProcess.stdout.on('data', (data) => {
        const text = data.toString();
        if (text.includes('Started HTTP and WebSocket JSON-RPC server')) {
          console.log('✅ Hardhat node started successfully');
        }
      });

      hardhatProcess.stderr.on('data', (data) => {
        console.error('Hardhat error:', data.toString());
      });

      // Wait for node to start
      console.log('⏳ Waiting for Hardhat node to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 2: Deploy contract
    console.log('📝 Deploying smart contract...');
    try {
      await runCommand('npx', ['hardhat', 'run', 'scripts/deploy.ts', '--network', 'localhost']);
      console.log('✅ Contract deployed successfully');
    } catch (error) {
      console.error('❌ Contract deployment failed:', error.message);
      throw error;
    }

    // Step 3: Verify contract files exist
    console.log('🔍 Verifying contract files...');
    const contractAddressPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'contract-address.json');
    const contractABIPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'SokoChain.json');

    if (!fs.existsSync(contractAddressPath)) {
      throw new Error('Contract address file not found');
    }

    if (!fs.existsSync(contractABIPath)) {
      throw new Error('Contract ABI file not found');
    }

    const contractAddress = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
    console.log('✅ Contract deployed at:', contractAddress.SokoChain);

    // Step 4: Start frontend
    console.log('🎨 Starting frontend development server...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: true
    });

    console.log('\n🎉 Soko Chain development environment is ready!');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('⛓️  Blockchain: http://localhost:8545');
    console.log('📝 Contract: ' + contractAddress.SokoChain);
    console.log('\n🛑 Press Ctrl+C to stop all services');

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down services...');
      frontendProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
