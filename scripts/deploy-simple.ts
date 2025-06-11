import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SokoChain contract...");
  
  // Get the ContractFactory
  const SokoChain = await ethers.getContractFactory("SokoChain");
  
  console.log("Deploying with optimized settings...");
  
  // Deploy the contract
  const sokoChain = await SokoChain.deploy();
  
  await sokoChain.waitForDeployment();
  
  const contractAddress = await sokoChain.getAddress();
  console.log("SokoChain deployed to:", contractAddress);
  
  // Save contract address and ABI
  const fs = require("fs");
  const contractAddresses = {
    SokoChain: contractAddress
  };
  
  // Save address
  fs.writeFileSync(
    "./frontend/src/contracts/contract-address.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  
  // Save ABI
  const contractArtifact = await artifacts.readArtifact("SokoChain");
  fs.writeFileSync(
    "./frontend/src/contracts/SokoChain.json",
    JSON.stringify(contractArtifact.abi, null, 2)
  );
  
  console.log("Contract address and ABI saved to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
