import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Product, Vendor } from '../App';

interface ProductModalProps {
  product: Product;
  vendors: Vendor[];
  account: string;
  sokoChain: ethers.Contract | null;
  onClose: () => void;
  onBuy: (productId: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  vendors,
  account,
  sokoChain,
  onClose,
  onBuy
}) => {
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    checkPurchaseHistory();
  }, [product.id, account, sokoChain]);

  const getVendorInfo = () => {
    const vendor = vendors.find(v => v.vendorAddress === product.vendor);
    return vendor || { name: 'Unknown Vendor', description: 'No description available' };
  };

  const checkPurchaseHistory = async () => {
    if (!sokoChain || !account) return;

    try {
      const purchased = await sokoChain.hasUserPurchased(account, product.id);
      setHasPurchased(purchased);

      if (purchased) {
        // Get order history to find purchase date
        const orders = await sokoChain.getOrderHistory(account);
        const order = orders.find((order: any) => Number(order.product.id) === product.id);
        if (order) {
          const date = new Date(Number(order.timestamp) * 1000);
          setPurchaseDate(date.toLocaleDateString());
        }
      }
    } catch (error) {
      console.error('Error checking purchase history:', error);
    }
  };

  const handleBuy = async () => {
    setLoading(true);
    try {
      await onBuy(product.id);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (costInWei: bigint) => {
    return `${ethers.formatEther(costInWei)} ETH`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'star' : 'star empty'}>
        ★
      </span>
    ));
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 7) + 3); // 3-10 days
    return deliveryDate.toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-product-image">
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

          <h2 className="modal-product-name">{product.name}</h2>          <div className="modal-product-details">
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{product.category}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Vendor:</span>
              <span className="detail-value" style={{ fontWeight: 'bold', color: '#667eea' }}>
                {getVendorInfo().name}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value" style={{ color: '#667eea', fontWeight: 'bold' }}>
                {formatPrice(product.cost)}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Rating:</span>
              <div className="detail-value">
                <div className="product-rating">
                  {renderStars(product.rating)}
                  <span>({product.rating}/5)</span>
                </div>
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-label">Stock:</span>
              <span className={`detail-value ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>

            {account && (
              <div className="detail-row">
                <span className="detail-label">Your Address:</span>
                <span className="detail-value" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {account.slice(0, 10)}...{account.slice(-8)}
                </span>
              </div>
            )}
          </div>

          {hasPurchased ? (
            <div className="purchased-info">
              <strong>✅ Item purchased on {purchaseDate}</strong>
            </div>
          ) : (
            <>
              {!account ? (
                <div className="purchased-info" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                  Please connect your wallet to purchase this item
                </div>
              ) : product.stock === 0 ? (
                <button className="buy-button" disabled>
                  Out of Stock
                </button>
              ) : (
                <button 
                  className="buy-button" 
                  onClick={handleBuy}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                      Processing...
                    </>
                  ) : (
                    `Buy Now - ${formatPrice(product.cost)}`
                  )}
                </button>
              )}
            </>
          )}

          <div className="delivery-info">
            <strong>📦 Estimated Delivery:</strong> {getEstimatedDelivery()}
            <br />
            <small>Free shipping on all orders</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
