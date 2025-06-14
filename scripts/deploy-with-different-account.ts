import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.getSigners();
  
  // Change this index to use different deployer account
  // 0 = first account, 1 = second account, etc.
  const deployerIndex = 1; // Change this number for different address
  const deployer = accounts[deployerIndex];

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const SokoChain = await ethers.getContractFactory("SokoChain", deployer);
  const sokoChain = await SokoChain.deploy();

  await sokoChain.waitForDeployment();

  const contractAddress = await sokoChain.getAddress();
  console.log("SokoChain deployed to:", contractAddress);

  // Save the contract address and ABI for the frontend
  const fs = require("fs");
  const contractsDir = "frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ SokoChain: contractAddress }, undefined, 2)
  );

  const SokoChainArtifact = await ethers.getContractFactory("SokoChain");
  fs.writeFileSync(
    contractsDir + "/SokoChain.json",
    JSON.stringify(SokoChainArtifact.interface.format("json"), null, 2)
  );

  console.log("Contract address and ABI saved to frontend/src/contracts/");
  console.log("New contract address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
