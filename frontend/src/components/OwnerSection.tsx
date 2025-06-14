import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Vendor } from '../App';

interface OwnerSectionProps {
  sokoChain: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  isPlatformOwner: boolean;
  isVendor: boolean;
  currentVendor: Vendor | null;
  onProductAdded: () => void;
  onVendorRegistered: () => void;
}

const OwnerSection: React.FC<OwnerSectionProps> = ({
  sokoChain,
  provider,
  isPlatformOwner,
  isVendor,
  currentVendor,
  onProductAdded,
  onVendorRegistered
}) => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'product'>(isVendor ? 'product' : 'vendor');
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    description: ''
  });
  const [formData, setFormData] = useState({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'stock' ? parseInt(value) : value
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, imageFile: file }));
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
    
    // For demo purposes, we'll create a placeholder URL
    // In production, you would use something like:
    
    /* Example Pinata integration:
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });
    
    const result = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    */
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock IPFS hash based on file name and content
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    return `https://ipfs.io/ipfs/${mockHash}`;
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sokoChain || !provider) {
      toast.error('Contract not loaded');
      return;
    }

    if (!vendorFormData.name || !vendorFormData.description) {
      toast.error('Please fill in all vendor fields');
      return;
    }

    setLoading(true);

    try {
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);

      toast.info('Registering vendor...');
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
      } else if (error.message.includes('Already registered')) {
        toast.error('You are already registered as a vendor');
      } else {
        toast.error('Failed to register vendor');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sokoChain || !provider) {
      toast.error('Contract not loaded');
      return;
    }

    if (!isVendor) {
      toast.error('You must be a registered vendor to list products');
      return;
    }

    if (!formData.name || !formData.imageFile || !formData.cost) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload image to IPFS
      toast.info('Uploading image to IPFS...');
      const imageUrl = await uploadToIPFS(formData.imageFile);
      
      // Convert cost to Wei
      const costInWei = ethers.parseEther(formData.cost);

      // Get signer and connect to contract
      const signer = await provider.getSigner();
      const sokoChainWithSigner = sokoChain.connect(signer);

      // List the product using the multi-vendor function
      toast.info('Listing product on blockchain...');
      const tx = await sokoChainWithSigner.listProduct(
        formData.name,
        formData.category,
        imageUrl,
        costInWei,
        formData.rating,
        formData.stock
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Product listed successfully!');
      
      // Reset form
      setFormData({
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
      } else if (error.message.includes('Not a registered vendor')) {
        toast.error('You must be a registered vendor to list products');
      } else {
        toast.error('Failed to list product');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="owner-section">
      {/* Vendor/Product Tabs */}
      <div className="vendor-tabs">
        <button 
          className={`tab-btn ${activeTab === 'vendor' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendor')}
        >
          🏪 Vendor Registration
        </button>
        <button 
          className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
          disabled={!isVendor}
        >
          📦 List Product
        </button>
      </div>

      {/* Vendor Registration Form */}
      {activeTab === 'vendor' && !isVendor && (
        <div>
          <h2 className="owner-title">🏪 Register as Vendor</h2>
          <form onSubmit={handleVendorSubmit} className="owner-form">
            <div className="form-group">
              <label className="form-label">Vendor Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={vendorFormData.name}
                onChange={handleVendorInputChange}
                placeholder="e.g., Fashion Boutique"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                value={vendorFormData.description}
                onChange={handleVendorInputChange}
                placeholder="Describe your store and products..."
                required
                rows={4}
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

      {/* Vendor Info Display */}
      {isVendor && currentVendor && (
        <div className="vendor-info">
          <h3>👋 Welcome, {currentVendor.name}!</h3>
          <p>{currentVendor.description}</p>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Products Listed</strong>
              {currentVendor.productCount}
            </div>
            <div className="stat-item">
              <strong>Total Sales</strong>
              {currentVendor.totalSales} ETH
            </div>
            <div className="stat-item">
              <strong>Status</strong>
              {currentVendor.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      )}

      {/* Product Listing Form */}
      {activeTab === 'product' && isVendor && (
        <div>
          <h2 className="owner-title">📦 List New Product</h2>
          
          <form onSubmit={handleSubmit} className="owner-form">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Cotton T-Shirt"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleInputChange}
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
                  {formData.imageFile ? (
                    <strong>✅ {formData.imageFile.name}</strong>
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
                value={formData.cost}
                onChange={handleInputChange}
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
                value={formData.rating}
                onChange={handleInputChange}
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
                value={formData.stock}
                onChange={handleInputChange}
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
                'List Product on Marketplace'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Info message for non-vendors */}
      {!isVendor && (
        <div className="info-message">
          <p>Register as a vendor to start selling your clothing products on the marketplace!</p>
        </div>
      )}
    </section>
  );
};

export default OwnerSection;
