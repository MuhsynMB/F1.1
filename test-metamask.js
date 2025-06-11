// MetaMask Connection Test
// Run this in browser console at http://localhost:3000

async function testMetaMaskConnection() {
    console.log('🦊 Testing MetaMask Connection...\n');
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask not detected! Please install MetaMask extension.');
        return;
    }
    console.log('✅ MetaMask detected');
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('✅ Accounts connected:', accounts);
        
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('🌐 Current Chain ID:', chainId);
        
        if (chainId === '0x539') { // 1337 in hex
            console.log('✅ Connected to correct network (Hardhat Local - 1337)');
        } else {
            console.warn('⚠️  Wrong network! Expected Chain ID: 0x539 (1337), Got:', chainId);
            console.log('💡 Please switch to Hardhat Local network in MetaMask');
        }
        
        // Check balance
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
        });
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        console.log('💰 Account Balance:', ethBalance.toFixed(4), 'ETH');
        
        if (ethBalance > 1000) {
            console.log('✅ Test account detected (balance > 1000 ETH)');
        } else {
            console.warn('⚠️  Low balance. Make sure you imported a test account.');
        }
        
        console.log('\n🎉 MetaMask setup looks good! Ready to use Soko Chain.');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.code === 4001) {
            console.log('💡 User rejected connection. Please connect manually.');
        } else if (error.code === -32002) {
            console.log('💡 Connection request pending. Check MetaMask popup.');
        }
    }
}

// Auto-run test
testMetaMaskConnection();
