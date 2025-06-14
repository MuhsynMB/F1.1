const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying SokoChain contract...");

  // Get the ContractFactory
  const SokoChain = await ethers.getContractFactory("SokoChain");
  
  // Deploy the contract
  console.log("📝 Deploying contract...");
  const sokoChain = await SokoChain.deploy();
  await sokoChain.waitForDeployment();

  const contractAddress = await sokoChain.getAddress();
  console.log("✅ SokoChain deployed to:", contractAddress);

  // Save the contract address
  const addressData = {
    SokoChain: contractAddress
  };

  const contractsDir = path.join(__dirname, "../frontend/src/contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(addressData, null, 2)
  );

  // Save the ABI
  const artifact = await ethers.getContractFactory("SokoChain");
  fs.writeFileSync(
    path.join(contractsDir, "SokoChain.json"),
    JSON.stringify(artifact.interface.format('json'), null, 2)
  );

  console.log("💾 Contract address and ABI saved to frontend/src/contracts/");
  
  // Test the contract
  console.log("🔍 Testing contract...");
  try {
    const owner = await sokoChain.platformOwner();
    console.log("✅ Contract is working! Platform owner:", owner);
    
    // Test vendor registration
    const [deployer, vendor1] = await ethers.getSigners();
    console.log("👤 Testing vendor registration with address:", vendor1.address);
    
    await sokoChain.connect(vendor1).registerVendor("Test Vendor", "A test vendor for development");
    console.log("✅ Vendor registration test successful!");
    
  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("🔗 You can now interact with the contract in your frontend");
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
