import React from 'react';
import { ethers } from 'ethers';
import { Product, Vendor } from '../App';

interface ProductGridProps {
  products: Product[];
  vendors: Vendor[];
  onProductClick: (product: Product) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  categories: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  vendors,
  onProductClick,
  selectedCategory,
  onCategoryChange,
  selectedVendor,
  onVendorChange,
  categories
}) => {
  const getVendorName = (vendorAddress: string) => {
    const vendor = vendors.find(v => v.vendorAddress === vendorAddress);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'star' : 'star empty'}>
        ★
      </span>
    ));
  };

  const formatPrice = (costInWei: bigint) => {
    return `${ethers.formatEther(costInWei)} ETH`;
  };

  return (
    <section className="products-section">
      <h1 className="section-title">Premium Clothing Collection</h1>
      
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="loading">
          <p>No products found. {selectedCategory !== 'All' ? 'Try selecting a different category.' : ''}</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onProductClick(product)}
            >
              <div className="product-image">
                {product.imageUrl && product.imageUrl.startsWith('http') ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  `Image: ${product.name}`
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-vendor">by {getVendorName(product.vendor)}</p>
                <div className="product-price">{formatPrice(product.cost)}</div>
                
                <div className="product-rating">
                  {renderStars(product.rating)}
                  <span>({product.rating}/5)</span>
                </div>
                
                <div className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
