import { ethers } from "hardhat";

async function main() {
  const [owner, vendor1, vendor2] = await ethers.getSigners();
  
  console.log("Setting up vendors and products...");
  console.log("Owner:", owner.address);
  console.log("Vendor 1:", vendor1.address);
  console.log("Vendor 2:", vendor2.address);

  // Get the contract address from the deployment
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Connect to the deployed contract
  const SokoChainFactory = await ethers.getContractFactory("contracts/SokoChain.sol:SokoChain");
  const sokoChain = SokoChainFactory.attach(contractAddress);

  console.log("\n--- Registering Vendors ---");
  
  // Register Vendor 1: John Doe
  console.log("Registering John Doe as vendor...");
  const tx1 = await sokoChain.connect(vendor1).registerVendor("John Doe", "Premium clothing store specializing in casual wear and streetwear");
  await tx1.wait();
  console.log("✅ John Doe registered successfully");

  // Register Vendor 2: Jane Smith
  console.log("Registering Jane Smith as vendor...");
  const tx2 = await sokoChain.connect(vendor2).registerVendor("Jane Smith", "Elegant fashion boutique featuring formal and business attire");
  await tx2.wait();
  console.log("✅ Jane Smith registered successfully");

  console.log("\n--- Adding Products ---");

  // John Doe's Products
  console.log("Adding products for John Doe...");
    // Product 1: Casual T-Shirt
  const addProduct1 = await sokoChain.connect(vendor1).listProduct(
    "Premium Cotton T-Shirt",
    "Clothing",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    ethers.parseEther("0.05"), // 0.05 ETH
    5, // rating
    10 // stock
  );
  await addProduct1.wait();
  console.log("✅ Premium Cotton T-Shirt added");
  // Product 2: Denim Jacket
  const addProduct2 = await sokoChain.connect(vendor1).listProduct(
    "Vintage Denim Jacket",
    "Clothing",
    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
    ethers.parseEther("0.12"), // 0.12 ETH
    4, // rating
    5 // stock
  );
  await addProduct2.wait();
  console.log("✅ Vintage Denim Jacket added");

  // Jane Smith's Products
  console.log("Adding products for Jane Smith...");
    // Product 3: Business Dress
  const addProduct3 = await sokoChain.connect(vendor2).listProduct(
    "Professional Business Dress",
    "Clothing",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    ethers.parseEther("0.08"), // 0.08 ETH
    5, // rating
    8 // stock
  );
  await addProduct3.wait();
  console.log("✅ Professional Business Dress added");
  // Product 4: Formal Blazer
  const addProduct4 = await sokoChain.connect(vendor2).listProduct(
    "Tailored Formal Blazer",
    "Clothing",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    ethers.parseEther("0.15"), // 0.15 ETH
    5, // rating
    6 // stock
  );
  await addProduct4.wait();
  console.log("✅ Tailored Formal Blazer added");

  console.log("\n--- Setup Complete! ---");
  console.log("Vendors registered: 2");
  console.log("Products added: 4");
  
  // Display vendor and product information
  console.log("\n--- Vendor Details ---");
  const vendor1Info = await sokoChain.vendors(vendor1.address);
  console.log(`Vendor 1: ${vendor1Info.name} (${vendor1.address})`);
  console.log(`Description: ${vendor1Info.description}`);
  console.log(`Active: ${vendor1Info.isActive}\n`);
  
  const vendor2Info = await sokoChain.vendors(vendor2.address);
  console.log(`Vendor 2: ${vendor2Info.name} (${vendor2.address})`);
  console.log(`Description: ${vendor2Info.description}`);
  console.log(`Active: ${vendor2Info.isActive}\n`);

  console.log("--- Product Details ---");
  const totalProducts = await sokoChain.productCount();
  console.log(`Total products: ${totalProducts}\n`);

  for (let i = 1; i <= Number(totalProducts); i++) {
    const product = await sokoChain.products(i);
    const vendor = await sokoChain.vendors(product.vendor);
    console.log(`Product ${i}: ${product.name}`);
    console.log(`  Vendor: ${vendor.name}`);
    console.log(`  Price: ${ethers.formatEther(product.cost)} ETH`);
    console.log(`  Stock: ${product.stock}`);
    console.log(`  Active: ${product.isActive}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
