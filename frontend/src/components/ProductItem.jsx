import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductItem.css';

const ProductItem = ({ product, addToCart, selectedAddress, categoryName }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lấy tất cả các kích thước từ prices (hỗ trợ cả Map và Object)
  const getAvailableSizes = () => {
    if (!product?.prices) return [];
    if (product.prices instanceof Map) {
      return Array.from(product.prices.keys());
    }
    return Object.keys(product.prices);
  };

  const availableSizes = getAvailableSizes();

  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const getPrice = (size) => {
    if (!product?.prices) {
      console.error('❌ No prices available for product:', product?.name);
      return undefined;
    }
    if (product.prices instanceof Map) {
      return product.prices.get(size);
    }
    return product.prices[size];
  };

  const handleAddToCart = () => {
    if (!availableSizes.includes(selectedSize)) {
      setError(`Vui lòng chọn kích thước hợp lệ (${availableSizes.join(', ')}).`);
      return;
    }
    const price = getPrice(selectedSize);
    if (price === undefined) {
      setError("Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.");
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price,
      image: product.image,
      attributes: { size: selectedSize },
      categoryName: categoryName || 'Không xác định',
      quantity
    };
    console.log('🛒 Adding to cart:', cartItem);

    addToCart(cartItem);
    setError(null);
  };

  const handleBuyNow = () => {
    if (!user?.token) {
      navigate('/sign-in');
      return;
    }
    if (!availableSizes.includes(selectedSize)) {
      setError(`Vui lòng chọn kích thước hợp lệ (${availableSizes.join(', ')}).`);
      return;
    }
    const price = getPrice(selectedSize);
    if (price === undefined) {
      setError("Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.");
      return;
    }

    const totalAmount = price * quantity;
    const item = {
      productId: product._id,
      name: product.name,
      price,
      image: product.image,
      attributes: { size: selectedSize },
      categoryName: categoryName || 'Không xác định',
      quantity,
      selected: true
    };

    console.log('💳 Navigating to payment with item:', item);

    navigate('/payment', {
      state: {
        selectedItems: [item],
        total: totalAmount,
        selectedAddress
      }
    });
    setError(null);
  };

  const currentPrice = getPrice(selectedSize);
  const originalPrice = currentPrice ? currentPrice / (1 - 0.17) : null;

  return (
    <div className="product-item">
      {!product ? (
        <div>Không có dữ liệu sản phẩm.</div>
      ) : (
        <>
          <div className="product-image-container">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image"
              onError={(e) => {
                e.target.src = '/placeholder.png';
                e.target.onerror = null;
              }}
            />
          </div>
          <div className="product-info">
            <h2 className="product-name">{product.name}</h2>
            <p className="product-description">{product.description || "Không có mô tả"}</p>
            <p className="product-category">
              Phân loại: {categoryName || "Đang cập nhật"}
            </p>
            <div className="product-meta">
              <span className="product-rating">
                ⭐ {product.rating || 0} ({product.sold || 0} lượt bán)
              </span>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="product-price">
              {originalPrice && (
                <span className="original-price">
                  {Math.round(originalPrice).toLocaleString()} VND
                </span>
              )}
              <span className="current-price">
                {currentPrice !== undefined ? `${currentPrice.toLocaleString()} VND` : "Giá chưa cập nhật"} / {selectedSize || 'N/A'}
              </span>
            </div>
            <div className="product-options">
              <label>Chọn kích thước: </label>
              <div className="weight-options">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`weight-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    disabled={getPrice(size) === undefined}
                  >
                    {size} 
                  </button>
                ))}
              </div>
            </div>
            <div className="product-quantity">
              <label>Số lượng: </label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={handleAddToCart} className="btn-add" disabled={currentPrice === undefined}>
                Thêm vào giỏ hàng
              </button>
              <button onClick={handleBuyNow} className="btn-buy" disabled={currentPrice === undefined}>
                Mua ngay
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductItem;