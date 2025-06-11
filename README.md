# Soko Chain - Decentralized Multi-Vendor Clothing Marketplace

A full-stack decentralized e-commerce platform built on Ethereum, focused exclusively on clothing sales. This multi-vendor marketplace allows anyone to register as a vendor, list products, and earn from sales, while customers can purchase from multiple vendors using cryptocurrency (Ether).

## 🌟 Features

### Blockchain & Smart Contract
- **Ethereum Smart Contracts** developed with Solidity
- **Local Development** using Hardhat blockchain
- **Multi-Vendor Architecture** - anyone can register as a vendor and list products
- **Platform Fee System** - configurable percentage fee (default 5%)
- **Vendor Earnings Management** - vendors can withdraw their earnings
- **On-chain Product Storage** with IPFS image integration
- **Secure Transactions** with built-in validation and error handling
- **Purchase History Tracking** stored on blockchain

### Frontend
- **React.js** with TypeScript for type safety
- **Ethers.js** integration for blockchain interaction
- **MetaMask Wallet** connection and management
- **Responsive Design** optimized for clothing presentation
- **Real-time Product Filtering** by category, vendor, and price
- **Toast Notifications** for transaction feedback
- **Vendor Registration Interface** for new vendors
- **Vendor Dashboard** with stats and product management

### Key Functionality
- 🏪 **Vendor Registration**: Anyone can register as a vendor with store name and description
- 🛍️ **Product Management**: Vendors can list products with images, pricing, and inventory
- 💳 **Cryptocurrency Payments**: Users pay with Ether, fees automatically distributed
- 📱 **Responsive UI**: Works seamlessly on desktop and mobile
- 🔍 **Advanced Search**: Filter by category, vendor, price range, and text search
- 📦 **Order Tracking**: View purchase history and delivery estimates
- 🖼️ **IPFS Integration**: Decentralized image storage
- 💰 **Earnings Dashboard**: Vendors can track sales and withdraw earnings
- 🛡️ **Platform Administration**: Platform owner can manage vendors and fees

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soko-chain
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Compile smart contracts**
   ```bash
   npm run compile
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start local blockchain and frontend**
   ```bash
   npm run dev
   ```

   This command will:
   - Start a local Hardhat blockchain node
   - Start the React development server
   - Both will run concurrently

6. **Deploy the contract** (in a new terminal)
   ```bash
   npm run deploy
   ```

7. **Configure MetaMask**
   - Add localhost network (RPC: http://127.0.0.1:8545, Chain ID: 1337)
   - Import one of the test accounts from Hardhat console

## 🛠️ Project Structure

```
soko-chain/
├── contracts/              # Solidity smart contracts
│   └── SokoChain.sol       # Main e-commerce contract
├── scripts/                # Deployment scripts
│   └── deploy.ts           # Contract deployment script
├── test/                   # Smart contract tests
│   └── SokoChain.test.ts   # Comprehensive test suite
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contracts/      # Contract ABI and addresses
│   │   └── types/          # TypeScript declarations
│   └── public/             # Static assets
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Project dependencies and scripts
```

## 📋 Available Scripts

### Root Directory
- `npm run setup` - Install all dependencies
- `npm run compile` - Compile smart contracts
- `npm run test` - Run smart contract tests
- `npm run node` - Start local Hardhat blockchain
- `npm run deploy` - Deploy contracts to local network
- `npm run frontend` - Start React development server
- `npm run dev` - Start both blockchain and frontend

### Frontend Directory
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Smart Contract Details

### Main Functions

#### Vendor Functions
- `registerVendor()` - Register as a vendor on the platform
- `listProduct()` - Add new products to the store (vendors only)
- `updateProduct()` - Update product details (product owner only)
- `withdrawVendorEarnings()` - Withdraw earned funds from sales

#### Platform Owner Functions
- `updatePlatformFee()` - Adjust platform fee percentage (max 20%)
- `withdrawPlatformFees()` - Withdraw platform fees
- `deactivateVendor()` - Deactivate vendor accounts

#### Public Functions
- `buyProduct()` - Purchase products with Ether
- `getProduct()` - Get product details
- `getVendor()` - Get vendor information
- `getAllProducts()` - Get all available products
- `getAllVendors()` - Get all active vendors
- `getProductsByVendor()` - Get products from specific vendor
- `getOrderHistory()` - Get user's purchase history
- `hasUserPurchased()` - Check if user bought specific product

### Data Structures

#### Vendor Structure
```solidity
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
```

#### Product Structure
```solidity
struct Product {
    uint256 id;
    string name;
    string category;
    string imageUrl;    // IPFS URL
    uint256 cost;       // in Wei
    uint256 rating;     // 1-5 stars
    uint256 stock;      // Available quantity
    address vendor;     // Vendor address
    uint256 vendorId;   // Vendor ID
    bool exists;
    bool isActive;
}
```

#### Order Structure
```solidity
struct Order {
    uint256 timestamp;
    Product product;
    address vendor;
    uint256 platformFee;
    uint256 vendorPayment;
}
```

## 🎨 Frontend Components

- **App.tsx** - Main application component with blockchain integration
- **Navbar.tsx** - Navigation with wallet connection and search
- **ProductGrid.tsx** - Display products in responsive grid
- **ProductModal.tsx** - Product details and purchase interface
- **VendorSection.tsx** - Multi-vendor registration and product listing interface

## 🔐 Security Features

- **Owner-only Access Control** for listing products
- **Input Validation** on all smart contract functions
- **Reentrancy Protection** on financial transactions
- **Stock Validation** prevents overselling
- **Payment Verification** ensures sufficient funds

## 🧪 Testing

The project includes comprehensive unit tests covering:
- Contract deployment and initialization
- Product listing functionality
- Purchase transactions
- Access control mechanisms
- Error handling and edge cases
- Owner withdrawal functionality

Run tests with:
```bash
npm test
```

## 🔧 MetaMask Troubleshooting

### Quick Setup Check
Before using the application, verify your MetaMask setup:

```powershell
# Run the MetaMask setup helper
.\setup-metamask.ps1
```

### Common MetaMask Issues:

#### 1. "Wrong Network" Error
- **Problem**: Chain ID mismatch
- **Solution**: Ensure Chain ID is exactly `1337` (not 31337)
- **Verify**: Check Hardhat config shows `chainId: 1337`

#### 2. "Nonce Too High" Error  
- **Problem**: Transaction history mismatch after blockchain restart
- **Solution**: Reset account in MetaMask (Settings → Advanced → Reset Account)

#### 3. "Contract Not Available" Error
- **Problem**: Contract not deployed or wrong address
- **Solution**: 
  ```powershell
  npm run deploy
  ```
- **Verify**: Check `frontend/src/contracts/contract-address.json`

#### 4. Connection Refused
- **Problem**: Hardhat node not running
- **Solution**: Start the development environment
  ```powershell
  npm run dev
  ```

### Test Account Setup
The platform uses role-based accounts for testing:
- **Platform Owner** (Account #0): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Vendor Accounts** (Account #1-2): For vendor registration and product listing
- **Buyer Accounts** (Account #3-4): For purchasing products

## 🌐 IPFS Integration

The application includes placeholder IPFS integration for image storage. In production, you would integrate with:
- **Pinata** - Pinata IPFS service
- **Web3.Storage** - Web3 native storage
- **Infura IPFS** - IPFS API service

## 📱 MetaMask Setup

1. Install MetaMask browser extension
2. Add local network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH
3. Import test account from Hardhat console output

## 🚀 Deployment

### Local Development
1. Start Hardhat node: `npm run node`
2. Deploy contract: `npm run deploy`
3. Start frontend: `npm run frontend`

### Production Deployment
For mainnet or testnet deployment:
1. Update `hardhat.config.ts` with network configuration
2. Set up environment variables for private keys
3. Deploy with: `npx hardhat run scripts/deploy.ts --network <network-name>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check that MetaMask is installed and configured
2. Ensure local blockchain is running
3. Verify contract is deployed
4. Check browser console for error messages

For development questions, please refer to:
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [React Documentation](https://reactjs.org/docs)

## 🛍️ How to Use the Platform

### For Customers
1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Browse Products**: Use filters to find products by category, vendor, or price
3. **View Details**: Click on any product to see full details and vendor information
4. **Make Purchase**: Click "Buy Now" and confirm the transaction in MetaMask
5. **Track Orders**: View your purchase history in your connected wallet

### For Vendors
1. **Register as Vendor**: 
   - Connect your wallet
   - Click "Register as Vendor" tab
   - Fill in your store name and description
   - Confirm the registration transaction

2. **List Products**:
   - Once registered, use the "Add Product" tab
   - Upload product images, set prices, and manage inventory
   - Products appear immediately after transaction confirmation

3. **Manage Earnings**:
   - View your vendor stats including total sales and product count
   - Withdraw your earnings (95% of sale price after 5% platform fee)
   - Update product details and stock levels

### For Platform Administrator
- **Manage Platform Fee**: Adjust the platform fee percentage (max 20%)
- **Vendor Management**: Deactivate problematic vendors if needed
- **Withdraw Platform Fees**: Collect accumulated platform fees

---

**Happy Coding! 🎉**
