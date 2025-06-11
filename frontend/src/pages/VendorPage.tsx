import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Vendor } from '../App';

interface VendorPageProps {
  account: string;
  sokoChain: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  onConnectWallet: () => void;
}

const VendorPage: React.FC<VendorPageProps> = ({
  account,
  sokoChain,
  provider,
  onConnectWallet
}) => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'product'>('vendor');
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    description: ''
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'T-Shirts',
    imageFile: null as File | null,
    cost: '',
    rating: 5,
    stock: 1
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];

  useEffect(() => {
    if (account && sokoChain) {
      checkVendorStatus();
    }
  }, [account, sokoChain]);

  const checkVendorStatus = async () => {
    if (!sokoChain || !account) return;

    try {
      const vendorData = await sokoChain.getVendorByAddress(account);
      if (vendorData.vendorAddress !== "0x0000000000000000000000000000000000000000") {
        setIsVendor(true);
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
        setActiveTab('product');
      }
    } catch (error) {
      console.log('User is not a vendor yet');
    }
  };

  const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'stock' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setProductFormData(prev => ({
          ...prev,
          imageFile: file
        }));
      } else {
        toast.error('Please drop an image file');
      }
    }
  };  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sokoChain || !provider) {
      toast.error('Contract not available');
      return;
    }

    if (!vendorFormData.name.trim() || !vendorFormData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);

      const tx = await sokoChainWithSigner.registerVendor(
        vendorFormData.name,
        vendorFormData.description
      );

      toast.info('Registration submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Vendor registration successful!');
      
      // Reset form and check vendor status
      setVendorFormData({ name: '', description: '' });
      await checkVendorStatus();
      
    } catch (error: any) {
      console.error('Error registering vendor:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('already registered')) {
        toast.error('You are already registered as a vendor');
      } else {
        toast.error('Failed to register vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // For development, we'll use a placeholder image URL
    // In production, you would implement actual IPFS upload here
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  };
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sokoChain || !provider) {
      toast.error('Contract not available');
      return;
    }

    if (!productFormData.name.trim() || !productFormData.cost.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }    setLoading(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
      
      if (productFormData.imageFile) {
        imageUrl = await uploadToIPFS(productFormData.imageFile);
      }

      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);

      const costInWei = ethers.parseEther(productFormData.cost);

      const tx = await sokoChainWithSigner.listProduct(
        productFormData.name,
        productFormData.category,
        imageUrl,
        costInWei,
        productFormData.rating,
        productFormData.stock
      );

      toast.info('Product listing submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Product listed successfully!');
      
      // Reset form
      setProductFormData({
        name: '',
        category: 'T-Shirts',
        imageFile: null,
        cost: '',
        rating: 5,
        stock: 1
      });

      // Update vendor stats
      await checkVendorStatus();
        } catch (error: any) {
      console.error('Error listing product:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected');
      } else {
        toast.error('Failed to list product');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="vendor-page">
        <div className="container">
          <section className="vendor-hero">
            <div className="vendor-hero-content">
              <h1>Start Selling on Soko Chain</h1>
              <p>Join our decentralized marketplace and reach customers worldwide with blockchain technology.</p>
              <button className="btn-primary" onClick={onConnectWallet}>
                Connect Wallet to Get Started
              </button>
            </div>
          </section>
          
          <section className="vendor-benefits">
            <h2>Why Sell on Soko Chain?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🏪</div>
                <h3>Your Own Store</h3>
                <p>Create your branded storefront with full control over your products and pricing.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">💰</div>
                <h3>Crypto Payments</h3>
                <p>Receive payments instantly in cryptocurrency with low transaction fees.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🔒</div>
                <h3>Secure Transactions</h3>
                <p>All transactions are secured by blockchain technology and smart contracts.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🌍</div>
                <h3>Global Reach</h3>
                <p>Sell to customers anywhere in the world without geographical restrictions.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-page">
      <div className="container">
        <header className="vendor-header">
          <h1>🏪 Vendor Dashboard</h1>
          <p>Manage your store and products on Soko Chain</p>
        </header>

        <div className="vendor-content">
          <div className="vendor-tabs">
            {!isVendor && (
              <button 
                className={`tab-btn ${activeTab === 'vendor' ? 'active' : ''}`}
                onClick={() => setActiveTab('vendor')}
              >
                🏪 Register as Vendor
              </button>
            )}
            
            {isVendor && (
              <button 
                className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
                onClick={() => setActiveTab('product')}
              >
                📦 Add Product
              </button>
            )}
          </div>

          {currentVendor && (
            <div className="vendor-stats">
              <h3>📊 Your Store Stats</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{currentVendor.name}</div>
                  <div className="stat-label">Store Name</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentVendor.productCount}</div>
                  <div className="stat-label">Products Listed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentVendor.totalSales}</div>
                  <div className="stat-label">Total Sales</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentVendor.isActive ? '✅ Active' : '❌ Inactive'}</div>
                  <div className="stat-label">Status</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vendor' && !isVendor && (
            <div className="vendor-form-section">
              <h2>🏪 Register Your Store</h2>
              <form onSubmit={handleVendorSubmit} className="vendor-form">
                <div className="form-group">
                  <label className="form-label">Store Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={vendorFormData.name}
                    onChange={handleVendorInputChange}
                    placeholder="e.g., Fashion Central, Style Hub"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Description *</label>
                  <textarea
                    name="description"
                    className="form-input form-textarea"
                    value={vendorFormData.description}
                    onChange={handleVendorInputChange}
                    placeholder="Describe your store and what makes it unique..."
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register as Vendor'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'product' && isVendor && (
            <div className="product-form-section">
              <h2>📦 Add New Product</h2>
              <form onSubmit={handleProductSubmit} className="product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={productFormData.name}
                      onChange={handleProductInputChange}
                      placeholder="e.g., Premium Cotton T-Shirt"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-input"
                      value={productFormData.category}
                      onChange={handleProductInputChange}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <div 
                    className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <div className="file-upload-text">
                      {productFormData.imageFile ? (
                        <span>Selected: {productFormData.imageFile.name}</span>
                      ) : (
                        <>
                          <span>📷 Drop an image here or click to browse</span>
                          <small>Supports JPG, PNG, GIF up to 10MB</small>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (ETH) *</label>
                    <input
                      type="number"
                      name="cost"
                      className="form-input"
                      value={productFormData.cost}
                      onChange={handleProductInputChange}
                      placeholder="0.01"
                      step="0.001"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-input"
                      value={productFormData.stock}
                      onChange={handleProductInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding Product...' : 'Add Product to Store'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPage;
