# Soko Chain 🛍️⛓️

Soko Chain is a decentralized fashion marketplace powered by the Ethereum blockchain. It provides a secure, transparent, and modern platform for vendors to register their stores, list clothing products, and for buyers to purchase items using cryptocurrency.

 <!-- Replace with a real screenshot or GIF of your app -->

## ✨ Features

-   **Decentralized Marketplace**: Built on Ethereum, ensuring no single point of failure.
-   **Vendor Registration**: Users can register their own stores on the blockchain.
-   **Product Management**: Vendors can list, update, and manage their clothing products.
-   **Crypto Payments**: Secure and direct payments in Ether (ETH).
-   **MetaMask Integration**: Seamless connection to user's MetaMask wallet for all transactions.
-   **Transparent Transactions**: All sales and registrations are recorded on-chain for full transparency.
-   **Responsive UI**: A modern and clean user interface built with React and TypeScript.

## 🛠️ Tech Stack

-   **Blockchain**: Solidity, Hardhat, Ethers.js
-   **Frontend**: React, TypeScript, Vite, CSS
-   **Wallet**: MetaMask
-   **Testing**: Chai, Mocha

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Prerequisites

Make sure you have the following software installed:

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [Git](https://git-scm.com/)
-   [MetaMask](https://metamask.io/) browser extension

### 2. Clone the Repository

Open your terminal and clone the repository:

```bash
git clone https://github.com/MuhsynMB/F1.1.git
cd soko-chain
```

### 3. Install Dependencies

This project is a monorepo-style setup. You need to install dependencies for both the root (Hardhat) and the frontend (React).

```bash
# Install root dependencies
npm install

# Navigate to the frontend directory and install its dependencies
cd frontend
npm install
cd ..
```

## 🏃‍♀️ Running the Development Environment

To run the application, you will need three separate terminal windows.

### Terminal 1: Start the Local Blockchain

This command starts a local Hardhat blockchain node that simulates the Ethereum network. It will also list several test accounts with their private keys and 10000 ETH each.

```bash
npx hardhat node
```

### Terminal 2: Deploy the Smart Contract

With the Hardhat node running, deploy the `SokoChain` smart contract to the local network.

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Note:** Every time you restart the Hardhat node, you must redeploy the contract.

### Terminal 3: Start the Frontend Application

Finally, start the React development server.

```bash
cd frontend
npm run dev
```

Your application should now be running at **`http://localhost:3000`**.

## 🦊 MetaMask Setup

To interact with the application, you need to configure MetaMask to connect to your local Hardhat network.

1.  **Add a new network** in MetaMask with the following details:
    -   **Network Name**: `Hardhat Local`
    -   **New RPC URL**: `http://127.0.0.1:8545`
    -   **Chain ID**: `1337`
    -   **Currency Symbol**: `ETH`

2.  **Import a test account** to have funds for transactions.
    -   In MetaMask, click "Import account".
    -   Copy and paste one of the private keys provided by the `npx hardhat node` command. For example, the first account's private key is usually:
        ```
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
        ```

Now you can connect your wallet to the app and start registering as a vendor or purchasing products!

## 🧪 Running Tests

To run the smart contract unit tests, use the following command in the root directory:

```bash
npx hardhat test
```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
