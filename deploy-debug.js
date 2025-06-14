const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("🚀 Starting contract deployment...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Deployer account has no ETH");
    }
    
    // Get contract factory
    console.log("📝 Getting contract factory...");
    const SokoChain = await ethers.getContractFactory("SokoChain");
    
    // Deploy contract
    console.log("🏗️  Deploying contract...");
    const sokoChain = await SokoChain.deploy();
    
    console.log("⏳ Waiting for deployment to be mined...");
    await sokoChain.waitForDeployment();
    
    const contractAddress = await sokoChain.getAddress();
    console.log("✅ SokoChain deployed to:", contractAddress);
    
    // Test contract by calling a function
    console.log("🧪 Testing contract...");
    const owner = await sokoChain.platformOwner();
    console.log("👑 Platform owner:", owner);
    
    // Save contract address
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    const addressData = {
      SokoChain: contractAddress
    };
    
    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify(addressData, null, 2)
    );
    
    // Save ABI
    const artifact = await ethers.getContractFactory("SokoChain");
    fs.writeFileSync(
      path.join(contractsDir, "SokoChain.json"),
      JSON.stringify(artifact.interface.format('json'), null, 2)
    );
    
    console.log("💾 Contract files saved to frontend/src/contracts/");
    console.log("🎉 Deployment completed successfully!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main();
