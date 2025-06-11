# 🛍️ Soko Chain - Decentralized Multi-Vendor Clothing Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.0+-blue.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)

A decentralized e-commerce platform built on Ethereum blockchain, specifically designed for clothing sales. Features multi-vendor architecture, cryptocurrency payments, and IPFS integration for decentralized storage.

![Soko Chain Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=Soko+Chain+Marketplace)

## 🌟 Features

### 🔗 Blockchain & Smart Contract
- **Ethereum Smart Contracts** developed with Solidity
- **Local Development** using Hardhat blockchain
- **Multi-Vendor Architecture** - anyone can register as a vendor and list products
- **Platform Fee System** - configurable percentage fee (default 5%)
- **Vendor Earnings Management** - vendors can withdraw their earnings
- **On-chain Product Storage** with IPFS image integration
- **Secure Transactions** with built-in validation and error handling

### 🎨 Frontend
- **React.js** with TypeScript for type safety
- **Ethers.js** integration for blockchain interaction
- **MetaMask Wallet** connection and management
- **Responsive Design** optimized for clothing presentation
- **Real-time Product Filtering** by category, vendor, and price
- **Toast Notifications** for transaction feedback
- **Vendor Dashboard** with stats and product management

### 🏪 Key Functionality
- **Vendor Registration** - become a seller on the platform
- **Product Management** - list, update, and manage inventory
- **Cryptocurrency Payments** - secure ETH transactions
- **Purchase History** - track all transactions on-chain
- **Multi-Category Support** - T-Shirts, Jeans, Dresses, Jackets, Shoes, Accessories
- **Rating System** - 5-star product ratings
- **Stock Management** - real-time inventory tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

### Installation

1. **Clone the repository:**   ```bash
   git clone https://github.com/MuhsynMB/soko-chain.git
   cd soko-chain
   ```

2. **Install dependencies:**
   ```bash
   npm run setup
   ```

3. **Start development environment:**
   ```bash
   npm run dev
   ```

4. **Configure MetaMask:**
   ```bash
   # Run the MetaMask setup helper
   .\setup-metamask.ps1
   ```

5. **Open the application:**
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Start exploring the marketplace!

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install all dependencies |
| `npm run dev` | Start Hardhat node + frontend |
| `npm run node` | Start Hardhat blockchain node |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contracts to local network |
| `npm run test` | Run smart contract tests |
| `npm run frontend` | Start frontend development server |

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

## 🦊 MetaMask Configuration

### Network Settings
```
Network Name: Soko Chain Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
```

### Test Accounts
The development environment provides test accounts with 10,000 ETH each:

| Role | Address | Purpose |
|------|---------|---------|
| Platform Owner | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Deploy contracts, manage platform |
| Vendor 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Register as vendor, list products |
| Vendor 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Second vendor account |
| Buyer 1 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | Purchase products |
| Buyer 2 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | Second buyer account |

📖 **Detailed MetaMask setup instructions**: [METAMASK_SETUP.md](./METAMASK_SETUP.md)

## 🎨 Frontend Components

- **App.tsx** - Main application component with blockchain integration
- **Navbar.tsx** - Navigation with wallet connection and search
- **ProductGrid.tsx** - Display products in responsive grid
- **ProductModal.tsx** - Product details and purchase interface
- **VendorSection.tsx** - Multi-vendor registration and product listing interface
- **VendorPage.tsx** - Dedicated vendor dashboard and management
- **Footer.tsx** - Professional footer with marketplace information

## 🔐 Security Features

- **Access Control** - Role-based permissions for vendors and platform owner
- **Input Validation** - Comprehensive validation on all smart contract functions
- **Reentrancy Protection** - Secure financial transactions
- **Stock Validation** - Prevents overselling
- **Payment Verification** - Ensures sufficient funds before transactions

## 🧪 Testing

The project includes comprehensive unit tests covering:
- Contract deployment and initialization
- Vendor registration and management
- Product listing and purchasing
- Access control mechanisms
- Error handling and edge cases
- Financial transactions and withdrawals

Run tests with:
```bash
npm test
```

## 🌐 IPFS Integration

The application includes placeholder IPFS integration for image storage. In production, integrate with:
- **Pinata** - Pinata IPFS service
- **Web3.Storage** - Web3 native storage
- **Infura IPFS** - IPFS API service

## 📁 Project Structure

```
soko-chain/
├── contracts/                 # Smart contracts
│   └── SokoChain.sol         # Main marketplace contract
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Application pages
│   │   ├── contracts/       # Contract ABI and addresses
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── scripts/                   # Deployment scripts
├── test/                     # Smart contract tests
├── typechain-types/          # Generated TypeScript types
└── docs/                     # Documentation
```

## 🛠️ Development Workflow

### For Customers
1. **Connect Wallet** - Connect MetaMask to the application
2. **Browse Products** - Use filters to find products by category, vendor, or price
3. **View Details** - Click on products to see full details and vendor information
4. **Make Purchase** - Click "Buy Now" and confirm transaction in MetaMask
5. **Track Orders** - View purchase history in connected wallet

### For Vendors
1. **Connect Wallet** - Connect MetaMask with a test account
2. **Register as Vendor** - Complete vendor registration with store details
3. **List Products** - Add products with images, descriptions, and pricing
4. **Manage Inventory** - Update product details and stock levels
5. **Withdraw Earnings** - Collect payments from sales (95% after platform fee)

### For Developers
1. **Start Development Environment** - `npm run dev`
2. **Deploy Contracts** - `npm run deploy`
3. **Run Tests** - `npm test`
4. **Configure MetaMask** - Use provided test accounts
5. **Develop Features** - Hot reload enabled for frontend development

## 🚀 Deployment

### Local Development
```bash
# Start Hardhat node
npm run node

# Deploy contract
npm run deploy

# Start frontend
npm run frontend
```

### Production Deployment
For mainnet or testnet deployment:
1. Update `hardhat.config.ts` with network configuration
2. Set up environment variables for private keys
3. Deploy with: `npx hardhat run scripts/deploy.ts --network <network-name>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Implement proper error handling and security checks
- Follow React best practices for component organization
- Ensure smart contract security with proper validation
- Maintain clean, readable code with appropriate comments

## 🔧 Troubleshooting

### Common Issues

#### MetaMask Connection
- **Wrong Network Error**: Ensure Chain ID is exactly `1337`
- **Nonce Issues**: Reset account in MetaMask settings
- **Connection Refused**: Verify Hardhat node is running on port 8545

#### Contract Issues
- **Contract Not Found**: Redeploy with `npm run deploy`
- **Contract Not Available**: Check contract address in `frontend/src/contracts/contract-address.json`

#### Development Environment
- **Port Conflicts**: Frontend runs on port 3000, Hardhat on 8545
- **Build Errors**: Run `npm run compile` to rebuild contracts

📖 **Detailed troubleshooting**: [METAMASK_SETUP.md](./METAMASK_SETUP.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

## 🎯 Roadmap

- [ ] IPFS integration for image storage
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Mobile responsive design improvements
- [ ] Advanced search and filtering
- [ ] Vendor analytics dashboard
- [ ] Social features (reviews, favorites)
- [ ] Payment integration (multiple cryptocurrencies)

---

**Built with ❤️ using Ethereum, React, and Hardhat**

*Empowering decentralized commerce, one transaction at a time.*
"# Final1" 
"# Final1" 
#   F i n a l 1  
 