const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("🔍 Verifying contract deployment...");
    
    // Connect to localhost network
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Check network
    const network = await provider.getNetwork();
    console.log("✅ Connected to network with Chain ID:", network.chainId.toString());
    
    // Check contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    console.log("📍 Checking contract at address:", contractAddress);
    
    const code = await provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ No contract found at address");
      return false;
    } else {
      console.log("✅ Contract found! Bytecode length:", code.length);
      
      // Try to call a contract function
      const contractABI = require("./frontend/src/contracts/SokoChain.json");
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      const owner = await contract.platformOwner();
      console.log("✅ Contract is working! Platform owner:", owner);
      
      return true;
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

main()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Contract deployment verified successfully!");
      console.log("🔗 Your frontend should now connect properly");
    } else {
      console.log("\n💥 Contract verification failed");
    }
  })
  .catch((error) => {
    console.error(error);
  });
