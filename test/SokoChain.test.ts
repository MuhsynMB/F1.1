import { expect } from "chai";
import { ethers } from "hardhat";
import { SokoChain } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SokoChain Multi-Vendor Marketplace", function () {
  let sokoChain: SokoChain;
  let platformOwner: SignerWithAddress;
  let vendor1: SignerWithAddress;
  let vendor2: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;

  beforeEach(async function () {
    [platformOwner, vendor1, vendor2, buyer1, buyer2] = await ethers.getSigners();
    
    const SokoChainFactory = await ethers.getContractFactory("SokoChain");
    sokoChain = await SokoChainFactory.deploy();
    await sokoChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right platform owner", async function () {
      expect(await sokoChain.platformOwner()).to.equal(platformOwner.address);
    });

    it("Should initialize counts to 0", async function () {
      expect(await sokoChain.productCount()).to.equal(0);
      expect(await sokoChain.vendorCount()).to.equal(0);
    });

    it("Should set initial platform fee to 5%", async function () {
      expect(await sokoChain.platformFeePercentage()).to.equal(5);
    });
  });

  describe("Vendor Registration", function () {
    it("Should allow user to register as vendor", async function () {
      const tx = await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );

      await expect(tx)
        .to.emit(sokoChain, "VendorRegistered")
        .withArgs(1, vendor1.address, "Fashion Central");

      expect(await sokoChain.vendorCount()).to.equal(1);
      expect(await sokoChain.isRegisteredVendor(vendor1.address)).to.be.true;
    });

    it("Should prevent double registration", async function () {
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );

      await expect(
        sokoChain.connect(vendor1).registerVendor(
          "Another Store",
          "Different description"
        )
      ).to.be.revertedWith("Address already registered as vendor");
    });

    it("Should require non-empty vendor name", async function () {
      await expect(
        sokoChain.connect(vendor1).registerVendor("", "Description")
      ).to.be.revertedWith("Vendor name cannot be empty");
    });
  });

  describe("Product Listing", function () {
    beforeEach(async function () {
      // Register vendor1 before each test
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );
    });

    it("Should allow registered vendor to list a product", async function () {
      const tx = await sokoChain.connect(vendor1).listProduct(
        "Premium T-Shirt",
        "T-Shirts",
        "ipfs://QmTest123",
        ethers.parseEther("0.1"),
        5,
        10
      );

      await expect(tx)
        .to.emit(sokoChain, "ProductListed")
        .withArgs(
          1,
          "Premium T-Shirt",
          "T-Shirts",
          "ipfs://QmTest123",
          ethers.parseEther("0.1"),
          5,
          10,
          vendor1.address,
          1
        );

      expect(await sokoChain.productCount()).to.equal(1);
    });

    it("Should prevent non-vendors from listing products", async function () {
      await expect(
        sokoChain.connect(buyer1).listProduct(
          "Premium T-Shirt",
          "T-Shirts",
          "ipfs://QmTest123",
          ethers.parseEther("0.1"),
          5,
          10
        )
      ).to.be.revertedWith("Only registered vendors can perform this action");
    });

    it("Should require valid product parameters", async function () {
      await expect(
        sokoChain.connect(vendor1).listProduct(
          "",
          "T-Shirts",
          "ipfs://QmTest123",
          ethers.parseEther("0.1"),
          5,
          10
        )
      ).to.be.revertedWith("Product name cannot be empty");

      await expect(
        sokoChain.connect(vendor1).listProduct(
          "Premium T-Shirt",
          "T-Shirts",
          "ipfs://QmTest123",
          0,
          5,
          10
        )
      ).to.be.revertedWith("Cost must be greater than 0");
    });
  });

  describe("Product Purchasing", function () {
    beforeEach(async function () {
      // Register vendor and list a product
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );
      
      await sokoChain.connect(vendor1).listProduct(
        "Premium T-Shirt",
        "T-Shirts",
        "ipfs://QmTest123",
        ethers.parseEther("0.1"),
        5,
        10
      );
    });

    it("Should allow users to buy products", async function () {
      const productCost = ethers.parseEther("0.1");
      const platformFee = productCost * BigInt(5) / BigInt(100); // 5% platform fee
      const vendorPayment = productCost - platformFee;

      const tx = await sokoChain.connect(buyer1).buyProduct(1, {
        value: productCost
      });

      await expect(tx)
        .to.emit(sokoChain, "ProductPurchased")
        .withArgs(
          buyer1.address,
          0, // order index
          1, // product id
          vendor1.address,
          platformFee,
          vendorPayment
        );

      // Check stock reduction
      const product = await sokoChain.getProduct(1);
      expect(product.stock).to.equal(9);

      // Check vendor balance
      expect(await sokoChain.getVendorBalance(vendor1.address)).to.equal(vendorPayment);
    });

    it("Should prevent buying out of stock products", async function () {
      // Set stock to 0 by buying all items
      for (let i = 0; i < 10; i++) {
        await sokoChain.connect(buyer1).buyProduct(1, {
          value: ethers.parseEther("0.1")
        });
      }

      await expect(
        sokoChain.connect(buyer2).buyProduct(1, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Product is out of stock");
    });

    it("Should require sufficient payment", async function () {
      await expect(
        sokoChain.connect(buyer1).buyProduct(1, {
          value: ethers.parseEther("0.05") // Less than required
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Vendor Management", function () {
    beforeEach(async function () {
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );
    });

    it("Should allow vendors to withdraw earnings", async function () {
      // List and sell a product
      await sokoChain.connect(vendor1).listProduct(
        "Premium T-Shirt",
        "T-Shirts",
        "ipfs://QmTest123",
        ethers.parseEther("0.1"),
        5,
        10
      );

      await sokoChain.connect(buyer1).buyProduct(1, {
        value: ethers.parseEther("0.1")
      });

      const expectedEarnings = ethers.parseEther("0.1") * BigInt(95) / BigInt(100); // 95% after platform fee
      expect(await sokoChain.getVendorBalance(vendor1.address)).to.equal(expectedEarnings);

      const vendorBalanceBefore = await ethers.provider.getBalance(vendor1.address);
        const tx = await sokoChain.connect(vendor1).withdrawVendorEarnings();
      const receipt = await tx.wait();
      const gasUsed = BigInt(receipt!.gasUsed) * BigInt(receipt!.gasPrice);

      const vendorBalanceAfter = await ethers.provider.getBalance(vendor1.address);
      
      expect(vendorBalanceAfter).to.equal(
        vendorBalanceBefore + expectedEarnings - gasUsed
      );
      
      expect(await sokoChain.getVendorBalance(vendor1.address)).to.equal(0);
    });

    it("Should allow platform owner to deactivate vendors", async function () {
      await sokoChain.connect(platformOwner).deactivateVendor(1);
      
      const vendor = await sokoChain.getVendor(1);
      expect(vendor.isActive).to.be.false;
    });
  });

  describe("Platform Management", function () {
    it("Should allow platform owner to update platform fee", async function () {
      const tx = await sokoChain.connect(platformOwner).updatePlatformFee(10);
      
      await expect(tx)
        .to.emit(sokoChain, "PlatformFeeUpdated")
        .withArgs(5, 10);
        
      expect(await sokoChain.platformFeePercentage()).to.equal(10);
    });

    it("Should prevent setting platform fee above 20%", async function () {
      await expect(
        sokoChain.connect(platformOwner).updatePlatformFee(25)
      ).to.be.revertedWith("Platform fee cannot exceed 20%");
    });

    it("Should allow platform owner to withdraw platform fees", async function () {
      // Setup: Register vendor, list product, make purchase
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );
      
      await sokoChain.connect(vendor1).listProduct(
        "Premium T-Shirt",
        "T-Shirts",
        "ipfs://QmTest123",
        ethers.parseEther("0.1"),
        5,
        10
      );

      await sokoChain.connect(buyer1).buyProduct(1, {
        value: ethers.parseEther("0.1")
      });

      const platformBalanceBefore = await ethers.provider.getBalance(platformOwner.address);
      const contractBalance = await sokoChain.getPlatformBalance();
        const tx = await sokoChain.connect(platformOwner).withdrawPlatformFees();
      const receipt = await tx.wait();
      const gasUsed = BigInt(receipt!.gasUsed) * BigInt(receipt!.gasPrice);

      const platformBalanceAfter = await ethers.provider.getBalance(platformOwner.address);
      
      expect(platformBalanceAfter).to.equal(
        platformBalanceBefore + contractBalance - gasUsed
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Register two vendors
      await sokoChain.connect(vendor1).registerVendor(
        "Fashion Central",
        "Premium clothing store"
      );
      
      await sokoChain.connect(vendor2).registerVendor(
        "Style Hub",
        "Trendy fashion items"
      );

      // List products from each vendor
      await sokoChain.connect(vendor1).listProduct(
        "Premium T-Shirt",
        "T-Shirts",
        "ipfs://QmTest123",
        ethers.parseEther("0.1"),
        5,
        10
      );

      await sokoChain.connect(vendor2).listProduct(
        "Designer Jeans",
        "Jeans",
        "ipfs://QmTest456",
        ethers.parseEther("0.2"),
        4,
        5
      );
    });

    it("Should return all active vendors", async function () {
      const vendors = await sokoChain.getAllVendors();
      expect(vendors.length).to.equal(2);
      expect(vendors[0].name).to.equal("Fashion Central");
      expect(vendors[1].name).to.equal("Style Hub");
    });

    it("Should return all active products", async function () {
      const products = await sokoChain.getAllProducts();
      expect(products.length).to.equal(2);
      expect(products[0].name).to.equal("Premium T-Shirt");
      expect(products[1].name).to.equal("Designer Jeans");
    });

    it("Should return products by vendor", async function () {
      const vendor1Products = await sokoChain.getProductsByVendor(vendor1.address);
      expect(vendor1Products.length).to.equal(1);
      expect(vendor1Products[0].name).to.equal("Premium T-Shirt");

      const vendor2Products = await sokoChain.getProductsByVendor(vendor2.address);
      expect(vendor2Products.length).to.equal(1);
      expect(vendor2Products[0].name).to.equal("Designer Jeans");
    });
  });
});
