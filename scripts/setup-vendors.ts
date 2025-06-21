import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
    console.log("🚀 Setting up vendors and products for Soko Chain...");

    // Get the deployed contract
    const contractAddress = JSON.parse(
        fs.readFileSync("frontend/src/contracts/contract-address.json", "utf8")
    );    const SokoChain = await ethers.getContractFactory("contracts/SokoChain.sol:SokoChain");
    const sokoChain = SokoChain.attach(contractAddress.SokoChain) as any;
    
    // Get signers (accounts)
    const [owner, vendor1, vendor2] = await ethers.getSigners();
    
    console.log("📋 Account addresses:");
    console.log("Owner:", owner.address);
    console.log("Vendor 1:", vendor1.address);
    console.log("Vendor 2:", vendor2.address);
    
    try {
        // Register Vendor 1 - John Doe
        console.log("\n👤 Registering Vendor 1: John Doe...");
        const tx1 = await sokoChain.connect(vendor1).registerVendor(
            "John Doe Fashion",
            "Premium streetwear and casual clothing. Specializing in trendy, high-quality apparel for the modern urban lifestyle."
        );
        await tx1.wait();
        console.log("✅ John Doe Fashion registered successfully!");
        
        // Register Vendor 2 - Sarah Smith
        console.log("\n👤 Registering Vendor 2: Sarah Smith...");
        const tx2 = await sokoChain.connect(vendor2).registerVendor(
            "Sarah's Boutique",
            "Elegant formal wear and sophisticated fashion pieces. Curating timeless styles with contemporary flair."
        );
        await tx2.wait();
        console.log("✅ Sarah's Boutique registered successfully!");
        
        // Add products for John Doe Fashion
        console.log("\n👕 Adding products for John Doe Fashion...");
        
        // Product 1: Urban Hoodie
        const product1Tx = await sokoChain.connect(vendor1).listProduct(
            "Urban Street Hoodie",
            "Hoodies & Sweatshirts",
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop&crop=center",
            ethers.parseEther("0.15"), // 0.15 ETH
            5, // 5-star rating
            25 // 25 in stock
        );
        await product1Tx.wait();
        console.log("✅ Urban Street Hoodie listed!");
        
        // Product 2: Denim Jacket
        const product2Tx = await sokoChain.connect(vendor1).listProduct(
            "Classic Denim Jacket",
            "Jackets & Outerwear",
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=500&h=500&fit=crop&crop=center",
            ethers.parseEther("0.25"), // 0.25 ETH
            4, // 4-star rating
            15 // 15 in stock
        );
        await product2Tx.wait();
        console.log("✅ Classic Denim Jacket listed!");
        
        // Add products for Sarah's Boutique
        console.log("\n👗 Adding products for Sarah's Boutique...");
        
        // Product 3: Elegant Dress
        const product3Tx = await sokoChain.connect(vendor2).listProduct(
            "Elegant Evening Dress",
            "Dresses & Formal Wear",
            "https://images.unsplash.com/photo-1566479179817-c08cbf4d4e67?w=500&h=500&fit=crop&crop=center",
            ethers.parseEther("0.35"), // 0.35 ETH
            5, // 5-star rating
            8 // 8 in stock
        );
        await product3Tx.wait();
        console.log("✅ Elegant Evening Dress listed!");
        
        // Product 4: Business Blazer
        const product4Tx = await sokoChain.connect(vendor2).listProduct(
            "Professional Blazer",
            "Business & Formal",
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop&crop=center",
            ethers.parseEther("0.28"), // 0.28 ETH
            4, // 4-star rating
            12 // 12 in stock
        );
        await product4Tx.wait();
        console.log("✅ Professional Blazer listed!");
        
        // Verify setup
        console.log("\n📊 Verifying setup...");
        
        const vendorCount = await sokoChain.vendorCount();
        const productCount = await sokoChain.productCount();
        
        console.log(`Total vendors registered: ${vendorCount}`);
        console.log(`Total products listed: ${productCount}`);
        
        // Get vendor details
        console.log("\n📋 Vendor Details:");
        const vendor1Details = await sokoChain.vendors(1);
        const vendor2Details = await sokoChain.vendors(2);
        
        console.log(`Vendor 1: ${vendor1Details.name} - ${vendor1Details.productCount} products`);
        console.log(`Vendor 2: ${vendor2Details.name} - ${vendor2Details.productCount} products`);
        
        // Get product details
        console.log("\n🛍️ Product Details:");
        for (let i = 1; i <= Number(productCount); i++) {
            const product = await sokoChain.products(i);
            const priceInEth = ethers.formatEther(product.cost);
            console.log(`Product ${i}: ${product.name} - ${priceInEth} ETH - Stock: ${product.stock}`);
        }
        
        console.log("\n🎉 Setup completed successfully!");
        console.log("✅ All vendors and products are ready for purchase!");
        
    } catch (error) {
        console.error("❌ Error during setup:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
