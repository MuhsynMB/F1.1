# 🦊 MetaMask Configuration for Soko Chain Development

## Prerequisites
- MetaMask browser extension installed
- Hardhat node running (`npm run node`)

## 1. Add Custom Network

### Network Configuration
```
Network Name: Soko Chain Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

### Steps to Add Network:
1. Open MetaMask extension
2. Click network dropdown (top center)
3. Click "Add Network" or "Add a network manually"
4. Fill in the configuration above
5. Click "Save"

## 2. Import Test Accounts

When you run `npx hardhat node`, it generates 20 test accounts with 10,000 ETH each.

### Default Test Accounts (Private Keys):
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Platform Owner)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Vendor 1)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Vendor 2)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Buyer 1)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (Buyer 2)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

### To Import an Account:
1. Click the account avatar (top right)
2. Select "Import Account"
3. Select "Private Key"
4. Paste one of the private keys above
5. Click "Import"

## 3. Switch to Local Network

1. Click the network dropdown
2. Select "Soko Chain Local" (or whatever you named it)
3. Verify you see your imported accounts with 10,000 ETH

## 4. Test Connection

### Verify Your Setup:
1. Navigate to `http://localhost:3000`
2. Click "Connect Wallet"
3. MetaMask should prompt to connect
4. Select the account you want to use
5. Approve the connection

### Expected Behavior:
- ✅ Wallet connects successfully
- ✅ Account address displays in the navbar
- ✅ Contract connection works
- ✅ No "Contract not available" errors

## 5. Account Roles

| Account | Role | Purpose |
|---------|------|---------|
| Account #0 | Platform Owner | Deploy contracts, set fees, withdraw platform fees |
| Account #1-2 | Vendors | Register as vendors, list products, withdraw earnings |
| Account #3-4 | Buyers | Purchase products, view order history |

## 6. Troubleshooting

### Common Issues:

#### "Wrong Network" Error
- Ensure Chain ID is exactly `1337`
- Verify RPC URL is `http://127.0.0.1:8545`
- Make sure Hardhat node is running

#### "Nonce Too High" Error
- Reset account in MetaMask:
  - Settings → Advanced → Reset Account
  - This clears transaction history

#### "Contract Not Found" Error
- Ensure contract is deployed (`npm run deploy`)
- Check contract address in `frontend/src/contracts/contract-address.json`

#### Connection Refused
- Verify Hardhat node is running on port 8545
- Check that no firewall is blocking the connection

## 7. Development Workflow

1. **Start Development Environment:**
   ```powershell
   npm run dev
   ```

2. **Deploy Contract (if needed):**
   ```powershell
   npm run deploy
   ```

3. **Open Application:**
   - Navigate to `http://localhost:3000`
   - Connect MetaMask
   - Start testing!

## 8. Security Notes

⚠️ **Important**: These are development accounts only!
- Never use these private keys on mainnet
- Never send real ETH to these addresses
- These keys are public and should only be used for local testing

## 9. Network Reset

If you need to reset the blockchain:
1. Stop Hardhat node (Ctrl+C)
2. Restart with `npm run node`
3. Redeploy contracts with `npm run deploy`
4. Reset MetaMask accounts if needed
