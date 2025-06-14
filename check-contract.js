const { ethers } = require("hardhat");

async function main() {
  try {
    // Try to connect to localhost network
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Check if network is accessible
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.chainId);
    
    // Check contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const code = await provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ No contract found at address:", contractAddress);
      console.log("🔄 Need to deploy contract");
      return false;
    } else {
      console.log("✅ Contract found at address:", contractAddress);
      console.log("📊 Contract bytecode length:", code.length);
      return true;
    }
    
  } catch (error) {
    console.log("❌ Error checking contract:", error.message);
    return false;
  }
}

main()
  .then((success) => {
    if (!success) {
      console.log("\n🚀 Run: npx hardhat run scripts/deploy.ts --network localhost");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
