import React from 'react';
import { Vendor } from '../App';
import { PageType } from './Router';

interface NavbarProps {
  account: string;
  onConnectWallet: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  priceRange: string;
  onPriceRangeChange: (range: string) => void;
  categories: string[];
  vendors: Vendor[];
  currentPage: PageType;
  navigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  account,
  onConnectWallet,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedVendor,
  onVendorChange,
  priceRange,
  onPriceRangeChange,
  categories,
  vendors,
  currentPage,
  navigate
}) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <nav className="navbar">
      <div className="container">        <div className="nav-content">
          <div className="nav-left">            <button 
              className="logo"
              onClick={() => navigate('/')}
            >
              <span className="logo-icon">🛍️</span>
              Fashion Meets Blockchain
            </button>
            
            <div className="nav-links">
              <button 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => navigate('/')}
              >
                Marketplace
              </button>
              <button 
                className={`nav-link ${currentPage === 'vendor' ? 'active' : ''}`}
                onClick={() => navigate('/RegVen')}
              >
                Sell
              </button>
              <button 
                className={`nav-link ${currentPage === 'orders' ? 'active' : ''}`}
                onClick={() => navigate('/orders')}
              >
                Orders
              </button>
              <button 
                className={`nav-link ${currentPage === 'disputes' ? 'active' : ''}`}
                onClick={() => navigate('/disputes')}
              >
                Disputes
              </button>
            </div>
          </div>

          <div className="nav-center">
            <input
              type="text"
              placeholder="Search clothing..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="nav-right">
            {account ? (
              <div className="wallet-connected">
                <span className="wallet-address">{shortenAddress(account)}</span>
                <div className="user-avatar">U</div>
              </div>
            ) : (
              <button className="connect-wallet-btn" onClick={onConnectWallet}>
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="container">
          <div className="filters">
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedVendor}
              onChange={(e) => onVendorChange(e.target.value)}
            >
              <option value="All">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.name}>
                  {vendor.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
            >
              <option value="All">All Prices</option>
              <option value="0-0.1">0 - 0.1 ETH</option>
              <option value="0.1-0.5">0.1 - 0.5 ETH</option>
              <option value="0.5-1">0.5 - 1 ETH</option>
              <option value="1">1+ ETH</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
