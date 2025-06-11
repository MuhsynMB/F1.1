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
    event VendorRegistered(
        uint256 vendorId,
        address vendorAddress,
        string name
    );
    
    event ProductListed(
        uint256 id,
        string name,
        string category,
        string imageUrl,
        uint256 cost,
        uint256 rating,
        uint256 stock,
        address vendor,
        uint256 vendorId
    );
    
    event ProductPurchased(
        address buyer,
        uint256 orderId,
        uint256 productId,
        address vendor,
        uint256 platformFee,
        uint256 vendorPayment
    );
    
    event VendorWithdrawal(
        address vendor,
        uint256 amount
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
      
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
     * @param _name Vendor/store name
     * @param _description Vendor description
     */
    function registerVendor(
        string memory _name,
        string memory _description
    ) public {
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
     * @dev List a new product (only registered vendors can call)
     * @param _name Product name
     * @param _category Product category
     * @param _imageUrl IPFS URL for product image
     * @param _cost Product cost in Wei
     * @param _rating Product rating (1-5)
     * @param _stock Initial stock quantity
     */
    function listProduct(
        string memory _name,
        string memory _category,
        string memory _imageUrl,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyActiveVendor {
        // Input validation
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
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
        
        emit ProductListed(
            productCount,
            _name,
            _category,
            _imageUrl,
            _cost,
            _rating,
            _stock,
            msg.sender,
            vendorId
        );
    }
      
    /**
     * @dev Buy a product
     * @param _id Product ID to purchase
     */
    function buyProduct(uint256 _id) public payable validProduct(_id) {
        Product storage product = products[_id];
        
        // Check if item is in stock
        require(product.stock > 0, "Product is out of stock");
        
        // Check if sent ETH is sufficient
        require(msg.value >= product.cost, "Insufficient payment");
        
        // Calculate platform fee and vendor payment
        uint256 platformFee = (product.cost * platformFeePercentage) / 100;
        uint256 vendorPayment = product.cost - platformFee;
        
        // Reduce stock
        product.stock--;
        
        // Update vendor stats
        uint256 vendorId = product.vendorId;
        vendors[vendorId].totalSales++;
        
        // Add to vendor balance
        vendorBalances[product.vendor] += vendorPayment;
        
        // Create order with product snapshot
        Order memory newOrder = Order({
            timestamp: block.timestamp,
            product: product,
            vendor: product.vendor,
            platformFee: platformFee,
            vendorPayment: vendorPayment
        });
        
        // Add to user's order history
        orders[msg.sender].push(newOrder);
        hasPurchased[msg.sender][_id] = true;
        
        // Return excess payment if any
        if (msg.value > product.cost) {
            payable(msg.sender).transfer(msg.value - product.cost);
        }
        
        emit ProductPurchased(
            msg.sender,
            orders[msg.sender].length - 1,
            _id,
            product.vendor,
            platformFee,
            vendorPayment
        );
    }
    
    /**
     * @dev Vendor withdraws their earnings
     */
    function withdrawVendorEarnings() public onlyVendor {
        uint256 balance = vendorBalances[msg.sender];
        require(balance > 0, "No earnings to withdraw");
        
        vendorBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit VendorWithdrawal(msg.sender, balance);
    }
    
    /**
     * @dev Platform owner withdraws platform fees
     */
    function withdrawPlatformFees() public onlyPlatformOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No platform fees to withdraw");
        
        payable(platformOwner).transfer(balance);
    }
    
    /**
     * @dev Update platform fee percentage (only platform owner)
     * @param _newFeePercentage New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 _newFeePercentage) public onlyPlatformOwner {
        require(_newFeePercentage <= 20, "Platform fee cannot exceed 20%");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, _newFeePercentage);
    }
    
    /**
     * @dev Deactivate a vendor (only platform owner)
     * @param _vendorId Vendor ID to deactivate
     */
    function deactivateVendor(uint256 _vendorId) public onlyPlatformOwner validVendor(_vendorId) {
        vendors[_vendorId].isActive = false;
        
        // Deactivate all vendor's products
        address vendorAddress = vendors[_vendorId].vendorAddress;
        uint256[] memory vendorProductIds = vendorProducts[vendorAddress];
        
        for (uint256 i = 0; i < vendorProductIds.length; i++) {
            products[vendorProductIds[i]].isActive = false;
        }
    }
    
    /**
     * @dev Update product details (only product owner)
     * @param _id Product ID
     * @param _stock New stock quantity
     * @param _cost New cost
     * @param _isActive Product active status
     */
    function updateProduct(
        uint256 _id,
        uint256 _stock,
        uint256 _cost,
        bool _isActive
    ) public validProduct(_id) {
        require(products[_id].vendor == msg.sender, "Only product owner can update");
        require(_cost > 0, "Cost must be greater than 0");
        
        products[_id].stock = _stock;
        products[_id].cost = _cost;
        products[_id].isActive = _isActive;
    }
      
    // View functions
    
    /**
     * @dev Get product details
     * @param _id Product ID
     * @return Product details
     */
    function getProduct(uint256 _id) public view validProduct(_id) returns (Product memory) {
        return products[_id];
    }
    
    /**
     * @dev Get vendor details
     * @param _vendorId Vendor ID
     * @return Vendor details
     */
    function getVendor(uint256 _vendorId) public view validVendor(_vendorId) returns (Vendor memory) {
        return vendors[_vendorId];
    }
    
    /**
     * @dev Get vendor by address
     * @param _vendorAddress Vendor address
     * @return Vendor details
     */
    function getVendorByAddress(address _vendorAddress) public view returns (Vendor memory) {
        require(isRegisteredVendor[_vendorAddress], "Address is not a registered vendor");
        uint256 vendorId = addressToVendorId[_vendorAddress];
        return vendors[vendorId];
    }
    
    /**
     * @dev Get user's order history
     * @param _user User address
     * @return Array of user's orders
     */
    function getOrderHistory(address _user) public view returns (Order[] memory) {
        return orders[_user];
    }
    
    /**
     * @dev Check if user has purchased a specific product
     * @param _user User address
     * @param _productId Product ID
     * @return Boolean indicating purchase status
     */
    function hasUserPurchased(address _user, uint256 _productId) public view returns (bool) {
        return hasPurchased[_user][_productId];
    }
    
    /**
     * @dev Get vendor's earnings balance
     * @param _vendor Vendor address
     * @return Vendor balance in Wei
     */
    function getVendorBalance(address _vendor) public view returns (uint256) {
        return vendorBalances[_vendor];
    }
    
    /**
     * @dev Get contract balance (platform fees)
     * @return Contract balance in Wei
     */
    function getPlatformBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get all products
     * @return Array of all active products
     */
    function getAllProducts() public view returns (Product[] memory) {
        // Count active products first
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].exists && products[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active products
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
    
    /**
     * @dev Get all vendors
     * @return Array of all active vendors
     */
    function getAllVendors() public view returns (Vendor[] memory) {
        // Count active vendors first
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= vendorCount; i++) {
            if (vendors[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active vendors
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
    
    /**
     * @dev Get products by vendor
     * @param _vendorAddress Vendor address
     * @return Array of vendor's active products
     */
    function getProductsByVendor(address _vendorAddress) public view returns (Product[] memory) {
        require(isRegisteredVendor[_vendorAddress], "Address is not a registered vendor");
        
        uint256[] memory vendorProductIds = vendorProducts[_vendorAddress];
        
        // Count active products
        uint256 activeCount = 0;
        for (uint256 i = 0; i < vendorProductIds.length; i++) {
            if (products[vendorProductIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active products
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
