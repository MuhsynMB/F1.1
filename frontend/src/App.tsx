import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import VendorSection from './components/VendorSection';
import Router, { useRouter } from './components/Router';
import VendorPage from './pages/VendorPage';
import Footer from './components/Footer';

export interface Vendor {
  id: number;
  vendorAddress: string;
  name: string;
  description: string;
  isActive: boolean;
  totalSales: number;
  productCount: number;
  registrationDate: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  cost: bigint;
  rating: number;
  stock: number;
  vendor: string;
  vendorId: number;
  exists: boolean;
  isActive: boolean;
}

export interface Order {
  timestamp: number;
  product: Product;
  vendor: string;
  platformFee: bigint;
  vendorPayment: bigint;
}

const AppContent: React.FC = () => {
  const { currentPage, navigate } = useRouter();
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [sokoChain, setSokoChain] = useState<ethers.Contract | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPlatformOwner, setIsPlatformOwner] = useState<boolean>(false);
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');

  const categories = ['All', 'T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];

  useEffect(() => {
    loadBlockchainData();
  }, []);
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedVendor, priceRange]);  const loadBlockchainData = async () => {
    try {
      setLoading(true);
      
      if (!window.ethereum) {
        toast.error('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Load contract
      const contractAddress = await import('./contracts/contract-address.json');
      const contractABI = await import('./contracts/SokoChain.json');
      
      console.log('Contract address:', contractAddress.SokoChain);
      console.log('Contract ABI loaded successfully');
        const sokoChain = new ethers.Contract(
        contractAddress.SokoChain,
        contractABI,
        provider
      );
      setSokoChain(sokoChain);

      // Test contract connection
      try {
        const owner = await sokoChain.platformOwner();
        console.log('Contract connected successfully! Platform owner:', owner);
        toast.success('✅ Connected to SokoChain contract!');
      } catch (error) {
        console.error('Contract call failed:', error);
        toast.error('Failed to connect to contract. Please ensure Hardhat node is running.');
        return;
      }

      // Load products and vendors
      await loadProducts(sokoChain);
      await loadVendors(sokoChain);
      
      // Check if connected account is platform owner or vendor
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        
        const platformOwner = await sokoChain.platformOwner();
        setIsPlatformOwner(currentAccount.toLowerCase() === platformOwner.toLowerCase());
        
        // Check if user is a registered vendor
        const isRegisteredVendor = await sokoChain.isRegisteredVendor(currentAccount);
        setIsVendor(isRegisteredVendor);
        
        if (isRegisteredVendor) {
          const vendorData = await sokoChain.getVendorByAddress(currentAccount);
          setCurrentVendor({
            id: Number(vendorData.id),
            vendorAddress: vendorData.vendorAddress,
            name: vendorData.name,
            description: vendorData.description,
            isActive: vendorData.isActive,
            totalSales: Number(vendorData.totalSales),
            productCount: Number(vendorData.productCount),
            registrationDate: Number(vendorData.registrationDate)
          });
        }
      }
      
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      toast.error('Failed to connect to contract. Please ensure Hardhat node is running.');
    } finally {
      setLoading(false);
    }
  };
  const loadProducts = async (contract: ethers.Contract) => {
    try {
      const allProducts = await contract.getAllProducts();
      const loadedProducts: Product[] = allProducts.map((product: any) => ({
        id: Number(product.id),
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl,
        cost: product.cost,
        rating: Number(product.rating),
        stock: Number(product.stock),
        vendor: product.vendor,
        vendorId: Number(product.vendorId),
        exists: product.exists,
        isActive: product.isActive
      }));

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadVendors = async (contract: ethers.Contract) => {
    try {
      const allVendors = await contract.getAllVendors();
      const loadedVendors: Vendor[] = allVendors.map((vendor: any) => ({
        id: Number(vendor.id),
        vendorAddress: vendor.vendorAddress,
        name: vendor.name,
        description: vendor.description,
        isActive: vendor.isActive,
        totalSales: Number(vendor.totalSales),
        productCount: Number(vendor.productCount),
        registrationDate: Number(vendor.registrationDate)
      }));

      setVendors(loadedVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
          if (sokoChain) {
          const platformOwner = await sokoChain.platformOwner();
          setIsPlatformOwner(accounts[0].toLowerCase() === platformOwner.toLowerCase());
          
          // Check if user is a registered vendor
          const isRegisteredVendor = await sokoChain.isRegisteredVendor(accounts[0]);
          setIsVendor(isRegisteredVendor);
          
          if (isRegisteredVendor) {
            const vendorData = await sokoChain.getVendorByAddress(accounts[0]);
            setCurrentVendor({
              id: Number(vendorData.id),
              vendorAddress: vendorData.vendorAddress,
              name: vendorData.name,
              description: vendorData.description,
              isActive: vendorData.isActive,
              totalSales: Number(vendorData.totalSales),
              productCount: Number(vendorData.productCount),
              registrationDate: Number(vendorData.registrationDate)
            });
          }
        }
        
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by vendor
    if (selectedVendor !== 'All') {
      const vendor = vendors.find(v => v.name === selectedVendor);
      if (vendor) {
        filtered = filtered.filter(product => product.vendor === vendor.vendorAddress);
      }
    }

    // Filter by price range
    if (priceRange !== 'All') {
      const [min, max] = priceRange.split('-').map(p => parseFloat(p));
      filtered = filtered.filter(product => {
        const priceInEth = parseFloat(ethers.formatEther(product.cost));
        if (max) {
          return priceInEth >= min && priceInEth <= max;
        } else {
          return priceInEth >= min;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const buyProduct = async (productId: number) => {
    if (!sokoChain || !provider) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return;
      }

      if (product.stock === 0) {
        toast.error('Product is out of stock');
        return;
      }      // @ts-ignore - Contract functions are dynamically loaded
      const tx = await sokoChainWithSigner.buyProduct(productId, {
        value: product.cost
      });

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Purchase successful!');
      
      // Reload products to update stock
      await loadProducts(sokoChain);
      
      // Close modal
      setSelectedProduct(null);
      
    } catch (error: any) {
      console.error('Error buying product:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds');
      } else {
        toast.error('Failed to purchase product');
      }
    }
  };
  const onProductAdded = () => {
    if (sokoChain) {
      loadProducts(sokoChain);
    }
  };

  const onVendorRegistered = () => {
    if (sokoChain) {
      loadVendors(sokoChain);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading Soko Chain...
      </div>
    );
  }

  return (
    <div className="App">      <Navbar
        account={account}
        onConnectWallet={connectWallet}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedVendor={selectedVendor}
        onVendorChange={setSelectedVendor}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}        categories={categories}
        vendors={vendors}
        currentPage={currentPage}
        navigate={navigate}
      />

      {/* Hero Section - Only show on home page */}
      {currentPage === 'home' && (
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">Fashion Meets Blockchain</h1>
                <p className="hero-description">
                  Soko Chain brings decentralized fashion commerce with secure smart 
                  contracts, multi-chain payments, and fair dispute resolution.
                </p>              <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Shop Now
                  </button>                  <button className="btn-secondary" onClick={() => navigate('/RegVen')}>
                    List Clothing
                  </button>
                </div>
              </div>
              <div className="hero-image">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Fashion Shopping" 
                  className="hero-img"
                />
              </div>
            </div>
          </div>        </section>
      )}

      {/* Render content based on current page */}
      {currentPage === 'home' && (
        <main className="container">
          <ProductGrid
            products={filteredProducts}
            vendors={vendors}
            onProductClick={setSelectedProduct}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            categories={categories}
          />        
          <VendorSection
            sokoChain={sokoChain}
            provider={provider}
            isPlatformOwner={isPlatformOwner}
            isVendor={isVendor}
            currentVendor={currentVendor}
            onProductAdded={onProductAdded}
            onVendorRegistered={onVendorRegistered}
            account={account}
          />
        </main>
      )}

      {currentPage === 'vendor' && (
        <VendorPage
          account={account}
          sokoChain={sokoChain}
          provider={provider}
          onConnectWallet={connectWallet}
        />
      )}

      {currentPage === 'orders' && (
        <main className="container">
          <div className="coming-soon">
            <h2>📦 Orders Management</h2>
            <p>Coming soon! Track your orders and sales history here.</p>
          </div>
        </main>
      )}

      {currentPage === 'disputes' && (
        <main className="container">
          <div className="coming-soon">
            <h2>⚖️ Dispute Resolution</h2>
            <p>Coming soon! Resolve disputes safely with blockchain-powered arbitration.</p>
          </div>
        </main>
      )}{selectedProduct && (
        <ProductModal
          product={selectedProduct}
          vendors={vendors}
          account={account}
          sokoChain={sokoChain}
          onClose={() => setSelectedProduct(null)}
          onBuy={buyProduct}        />
      )}

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
