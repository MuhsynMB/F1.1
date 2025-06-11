// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SokoChain
 * @dev Decentralized multi-vendor e-commerce platform for clothing
 */
contract SokoChain {
    address public platformOwner;
    uint256 public productCount = 0;
    uint256 public vendorCount = 0;
    uint256 public platformFeePercentage = 5; // 5% platform fee
    
    struct Vendor {
        uint256 id;
        address vendorAddress;
        string name;
        string description;
        bool isActive;
        uint256 totalSales;
        uint256 productCount;
        uint256 registrationDate;
    }
    
    struct Product {
        uint256 id;
        string name;
        string category;
        string imageUrl; // IPFS URL
        uint256 cost; // in Wei
        uint256 rating;
        uint256 stock;
        address vendor;
        uint256 vendorId;
        bool exists;
        bool isActive;
    }
    
    struct Order {
        uint256 timestamp;
        Product product;
        address vendor;
        uint256 platformFee;
        uint256 vendorPayment;
    }
    
    // Vendor storage
    mapping(uint256 => Vendor) public vendors;
    mapping(address => uint256) public addressToVendorId;
    mapping(address => bool) public isRegisteredVendor;
    
    // Product storage
    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public vendorProducts; // vendor address => product IDs
    
    // User purchase history
    mapping(address => Order[]) public orders;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    
    // Vendor balances (earnings from sales)
    mapping(address => uint256) public vendorBalances;
    
    // Events
    event VendorRegistered(uint256 vendorId, address vendorAddress, string name);
    event ProductListed(uint256 id, string name, string category, string imageUrl, uint256 cost, uint256 rating, uint256 stock, address vendor, uint256 vendorId);
    event ProductPurchased(address buyer, uint256 orderId, uint256 productId, address vendor, uint256 platformFee, uint256 vendorPayment);
    event VendorWithdrawal(address vendor, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
      
    // Modifiers
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can perform this action");
        _;
    }
    
    modifier onlyVendor() {
        require(isRegisteredVendor[msg.sender], "Only registered vendors can perform this action");
        _;
    }
    
    modifier onlyActiveVendor() {
        require(isRegisteredVendor[msg.sender], "Vendor not registered");
        uint256 vendorId = addressToVendorId[msg.sender];
        require(vendors[vendorId].isActive, "Vendor account is deactivated");
        _;
    }
    
    modifier validProduct(uint256 _id) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        require(products[_id].exists, "Product not available");
        require(products[_id].isActive, "Product is deactivated");
        _;
    }
    
    modifier validVendor(uint256 _vendorId) {
        require(_vendorId > 0 && _vendorId <= vendorCount, "Vendor does not exist");
        require(vendors[_vendorId].isActive, "Vendor is not active");
        _;
    }
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    /**
     * @dev Register a new vendor
     */
    function registerVendor(string memory _name, string memory _description) public {
        require(!isRegisteredVendor[msg.sender], "Address already registered as vendor");
        require(bytes(_name).length > 0, "Vendor name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        vendorCount++;
        
        vendors[vendorCount] = Vendor({
            id: vendorCount,
            vendorAddress: msg.sender,
            name: _name,
            description: _description,
            isActive: true,
            totalSales: 0,
            productCount: 0,
            registrationDate: block.timestamp
        });
        
        addressToVendorId[msg.sender] = vendorCount;
        isRegisteredVendor[msg.sender] = true;
        
        emit VendorRegistered(vendorCount, msg.sender, _name);
    }
    
    /**
     * @dev List a new product
     */
    function listProduct(
        string memory _name,
        string memory _category,
        string memory _imageUrl,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyActiveVendor {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_cost > 0, "Cost must be greater than 0");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(_stock > 0, "Stock must be greater than 0");
        
        productCount++;
        uint256 vendorId = addressToVendorId[msg.sender];
        
        products[productCount] = Product({
            id: productCount,
            name: _name,
            category: _category,
            imageUrl: _imageUrl,
            cost: _cost,
            rating: _rating,
            stock: _stock,
            vendor: msg.sender,
            vendorId: vendorId,
            exists: true,
            isActive: true
        });
        
        vendorProducts[msg.sender].push(productCount);
        vendors[vendorId].productCount++;
        
        emit ProductListed(productCount, _name, _category, _imageUrl, _cost, _rating, _stock, msg.sender, vendorId);
    }
      
    /**
     * @dev Buy a product
     */
    function buyProduct(uint256 _id) public payable validProduct(_id) {
        Product storage product = products[_id];
        require(product.stock > 0, "Product is out of stock");
        require(msg.value >= product.cost, "Insufficient payment");
        
        uint256 platformFee = (product.cost * platformFeePercentage) / 100;
        uint256 vendorPayment = product.cost - platformFee;
        
        product.stock--;
        uint256 vendorId = product.vendorId;
        vendors[vendorId].totalSales++;
        vendorBalances[product.vendor] += vendorPayment;
        
        Order memory newOrder = Order({
            timestamp: block.timestamp,
            product: product,
            vendor: product.vendor,
            platformFee: platformFee,
            vendorPayment: vendorPayment
        });
        
        orders[msg.sender].push(newOrder);
        hasPurchased[msg.sender][_id] = true;
        
        if (msg.value > product.cost) {
            payable(msg.sender).transfer(msg.value - product.cost);
        }
        
        emit ProductPurchased(msg.sender, orders[msg.sender].length - 1, _id, product.vendor, platformFee, vendorPayment);
    }
    
    /**
     * @dev Vendor withdraws earnings
     */
    function withdrawVendorEarnings() public onlyVendor {
        uint256 balance = vendorBalances[msg.sender];
        require(balance > 0, "No earnings to withdraw");
        
        vendorBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit VendorWithdrawal(msg.sender, balance);
    }
    
    /**
     * @dev Platform owner withdraws fees
     */
    function withdrawPlatformFees() public onlyPlatformOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No platform fees to withdraw");
        payable(platformOwner).transfer(balance);
    }
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _newFeePercentage) public onlyPlatformOwner {
        require(_newFeePercentage <= 20, "Platform fee cannot exceed 20%");
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeeUpdated(oldFee, _newFeePercentage);
    }
    
    /**
     * @dev Deactivate vendor
     */
    function deactivateVendor(uint256 _vendorId) public onlyPlatformOwner validVendor(_vendorId) {
        vendors[_vendorId].isActive = false;
        address vendorAddress = vendors[_vendorId].vendorAddress;
        uint256[] memory vendorProductIds = vendorProducts[vendorAddress];
        
        for (uint256 i = 0; i < vendorProductIds.length; i++) {
            products[vendorProductIds[i]].isActive = false;
        }
    }
    
    /**
     * @dev Update product
     */
    function updateProduct(uint256 _id, uint256 _stock, uint256 _cost, bool _isActive) public validProduct(_id) {
        require(products[_id].vendor == msg.sender, "Only product owner can update");
        require(_cost > 0, "Cost must be greater than 0");
        
        products[_id].stock = _stock;
        products[_id].cost = _cost;
        products[_id].isActive = _isActive;
    }
      
    // View functions
    function getProduct(uint256 _id) public view validProduct(_id) returns (Product memory) {
        return products[_id];
    }
    
    function getVendor(uint256 _vendorId) public view validVendor(_vendorId) returns (Vendor memory) {
        return vendors[_vendorId];
    }
    
    function getVendorByAddress(address _vendorAddress) public view returns (Vendor memory) {
        require(isRegisteredVendor[_vendorAddress], "Address is not a registered vendor");
        uint256 vendorId = addressToVendorId[_vendorAddress];
        return vendors[vendorId];
    }
    
    function getOrderHistory(address _user) public view returns (Order[] memory) {
        return orders[_user];
    }
    
    function hasUserPurchased(address _user, uint256 _productId) public view returns (bool) {
        return hasPurchased[_user][_productId];
    }
    
    function getVendorBalance(address _vendor) public view returns (uint256) {
        return vendorBalances[_vendor];
    }
    
    function getPlatformBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Simplified view functions that don't create large arrays
    function getAllProducts() public view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].exists && products[i].isActive) {
                activeCount++;
            }
        }
        
        Product[] memory allProducts = new Product[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].exists && products[i].isActive) {
                allProducts[currentIndex] = products[i];
                currentIndex++;
            }
        }
        
        return allProducts;
    }
    
    function getAllVendors() public view returns (Vendor[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= vendorCount; i++) {
            if (vendors[i].isActive) {
                activeCount++;
            }
        }
        
        Vendor[] memory allVendors = new Vendor[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= vendorCount; i++) {
            if (vendors[i].isActive) {
                allVendors[currentIndex] = vendors[i];
                currentIndex++;
            }
        }
        
        return allVendors;
    }
    
    function getProductsByVendor(address _vendorAddress) public view returns (Product[] memory) {
        require(isRegisteredVendor[_vendorAddress], "Address is not a registered vendor");
        
        uint256[] memory vendorProductIds = vendorProducts[_vendorAddress];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < vendorProductIds.length; i++) {
            if (products[vendorProductIds[i]].isActive) {
                activeCount++;
            }
        }
        
        Product[] memory vendorActiveProducts = new Product[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < vendorProductIds.length; i++) {
            uint256 productId = vendorProductIds[i];
            if (products[productId].isActive) {
                vendorActiveProducts[currentIndex] = products[productId];
                currentIndex++;
            }
        }
        
        return vendorActiveProducts;
    }
}
