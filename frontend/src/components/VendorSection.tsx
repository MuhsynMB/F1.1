import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Vendor } from '../App';

interface VendorSectionProps {
  sokoChain: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  isPlatformOwner: boolean;
  isVendor: boolean;
  currentVendor: Vendor | null;
  onProductAdded: () => void;
  onVendorRegistered: () => void;
  account: string;
}

const VendorSection: React.FC<VendorSectionProps> = ({
  sokoChain,
  provider,
  isPlatformOwner,
  isVendor,
  currentVendor,
  onProductAdded,
  onVendorRegistered,
  account
}) => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'product'>(isVendor ? 'product' : 'vendor');
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
      [name]: name === 'cost' || name === 'rating' || name === 'stock' ? 
        (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setProductFormData(prev => ({ ...prev, imageFile: file }));
      toast.success('Image selected successfully');
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // Simulate IPFS upload - In a real application, you would integrate with
    // Pinata, Web3.Storage, or another IPFS service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock IPFS hash
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return `ipfs://${mockHash}`;
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sokoChain || !provider) {
      toast.error('Contract not loaded');
      return;
    }

    if (!vendorFormData.name || !vendorFormData.description) {
      toast.error('Please fill in all vendor information');
      return;
    }

    setLoading(true);

    try {
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);      toast.info('Registering vendor...');
      // @ts-ignore - Contract functions are dynamically loaded
      const tx = await sokoChainWithSigner.registerVendor(
        vendorFormData.name,
        vendorFormData.description
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Vendor registered successfully!');
      
      // Reset form
      setVendorFormData({
        name: '',
        description: ''
      });

      // Switch to product tab
      setActiveTab('product');

      // Notify parent to reload vendors
      onVendorRegistered();

    } catch (error: any) {
      console.error('Error registering vendor:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('already registered')) {
        toast.error('Address already registered as vendor');
      } else {
        toast.error('Failed to register vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sokoChain || !provider) {
      toast.error('Contract not loaded');
      return;
    }

    if (!productFormData.name || !productFormData.imageFile || !productFormData.cost) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload image to IPFS
      toast.info('Uploading image to IPFS...');
      const imageUrl = await uploadToIPFS(productFormData.imageFile);
      
      // Convert cost to Wei
      const costInWei = ethers.parseEther(productFormData.cost.toString());

      // Get signer and connect to contract
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);      // List the product
      toast.info('Listing product on blockchain...');
      // @ts-ignore - Contract functions are dynamically loaded
      const tx = await sokoChainWithSigner.listProduct(
        productFormData.name,
        productFormData.category,
        imageUrl,
        costInWei,
        productFormData.rating,
        productFormData.stock
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
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

      // Notify parent to reload products
      onProductAdded();

    } catch (error: any) {
      console.error('Error listing product:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('Only registered vendors')) {
        toast.error('Only registered vendors can list products');
      } else {
        toast.error('Failed to list product');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="owner-section">
      {!account ? (
        <div className="connect-wallet-prompt">
          <h2 className="owner-title">🔗 Connect Your Wallet</h2>
          <p className="connect-message">
            Connect your wallet to start selling clothing items on Soko Chain. 
            You'll be able to register as a vendor and list your products.
          </p>
          <div className="connect-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🏪</span>
              <span>Create your own store</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📦</span>
              <span>List unlimited products</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span>Earn cryptocurrency payments</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <span>Secure blockchain transactions</span>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        <div className="vendor-info">
          <h3>📊 Your Vendor Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Store Name:</strong> {currentVendor.name}
            </div>
            <div className="stat-item">
              <strong>Products Listed:</strong> {currentVendor.productCount}
            </div>
            <div className="stat-item">
              <strong>Total Sales:</strong> {currentVendor.totalSales}
            </div>
            <div className="stat-item">
              <strong>Status:</strong> {currentVendor.isActive ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vendor' && !isVendor && (
        <div>
          <h2 className="owner-title">🏪 Register as Vendor</h2>
          <form onSubmit={handleVendorSubmit} className="owner-form">
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
                className="form-input"
                value={vendorFormData.description}
                onChange={handleVendorInputChange}
                placeholder="Describe your store and what you sell..."
                rows={3}
                required
              />
            </div>

            <button 
              type="submit" 
              className="add-product-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                  Registering Vendor...
                </>
              ) : (
                'Register as Vendor'
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'product' && isVendor && (
        <div>
          <h2 className="owner-title">📦 Add New Product</h2>
          <form onSubmit={handleProductSubmit} className="owner-form">
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
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Product Image *</label>
              <div
                className={`image-upload ${dragOver ? 'dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                <div className="upload-text">
                  {productFormData.imageFile ? (
                    <strong>✅ {productFormData.imageFile.name}</strong>
                  ) : (
                    <>
                      <strong>Drag & drop an image here</strong>
                      <br />
                      or click to select
                    </>
                  )}
                </div>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Price (ETH) *</label>
              <input
                type="number"
                name="cost"
                className="form-input"
                value={productFormData.cost}
                onChange={handleProductInputChange}
                placeholder="0.1"
                min="0"
                step="0.001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating (1-5)</label>
              <select
                name="rating"
                className="form-input"
                value={productFormData.rating}
                onChange={handleProductInputChange}
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                value={productFormData.stock}
                onChange={handleProductInputChange}
                min="1"
              />
            </div>

            <button 
              type="submit" 
              className="add-product-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                  Adding Product...
                </>
              ) : (
                'Add Product to Store'
              )}
            </button>
          </form>
        </div>
      )}      {!isVendor && activeTab === 'product' && (
        <div className="info-message">
          <p>Please register as a vendor first to add products.</p>
        </div>
      )}
        </>
      )}
    </section>
  );
};

export default VendorSection;
