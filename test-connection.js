const { ethers } = require("hardhat");

async function testConnection() {
  console.log("Testing blockchain connection...");
  
  try {
    // Test network connection
    const network = await ethers.provider.getNetwork();
    console.log("✅ Network connected:", network.name, "Chain ID:", network.chainId.toString());
    
    // Test contract deployment
    const contractAddress = require("./frontend/src/contracts/contract-address.json");
    const contractABI = require("./frontend/src/contracts/SokoChain.json");
    
    console.log("📄 Contract address:", contractAddress.SokoChain);
    console.log("📋 ABI functions count:", contractABI.length);
    
    // Test contract instance
    const contract = new ethers.Contract(
      contractAddress.SokoChain,
      contractABI,
      ethers.provider
    );
    
    // Test contract call
    const owner = await contract.platformOwner();
    console.log("✅ Contract responding! Platform owner:", owner);
    
    // Test other functions
    const productCount = await contract.productCount();
    const vendorCount = await contract.vendorCount();
    console.log("📊 Products:", productCount.toString(), "Vendors:", vendorCount.toString());
    
    console.log("🎉 All tests passed! Blockchain is ready.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Ensure Hardhat node is running: npx hardhat node");
    console.log("2. Deploy the contract: npx hardhat run scripts/deploy.ts --network localhost");
    console.log("3. Restart the frontend server");
  }
}

testConnection();
