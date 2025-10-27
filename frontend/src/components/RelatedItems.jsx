import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/RelatedItems.css';

const RelatedItems = ({ relatedProducts, currentProductId, addToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const getPriceFromSchema = (product, size) => {
    // Kiểm tra nhiều cách để lấy giá
    if (!product) {
      return undefined;
    }

    // Cách 1: Từ prices object
    if (product.prices && product.prices[size]) {
      return product.prices[size];
    }

    // Cách 2: Từ trường price trực tiếp
    if (product.price) {
      return product.price;
    }

    // Cách 3: Từ priceSchema
    if (product.priceSchema && product.priceSchema[size]) {
      return product.priceSchema[size];
    }

    // Cách 4: Lấy giá đầu tiên có sẵn từ prices
    if (product.prices && typeof product.prices === 'object') {
      const firstPrice = Object.values(product.prices)[0];
      if (firstPrice) {
        return firstPrice;
      }
    }

    // Mặc định trả về 0 để hiển thị
    return 0;
  };

  const handleAddToCart = (product) => {
    const size = '250'; // Mặc định size nhỏ nhất
    const price = getPriceFromSchema(product, size);
    if (price === 0 || !price) {
      setError('Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price,
      image: product.image,
      attributes: { size },
      categoryName: product.categoryName || 'Không xác định',
      quantity: 1,
    });
    setError(null);
  };

  return (
    <div className="related-items">
      <h3>Sản phẩm cùng loại</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="related-list">
        {relatedProducts.length > 0 ? (
          relatedProducts
            .filter((product) => product._id !== currentProductId)
            .map((product) => {
              const size = '250';
              const currentPrice = getPriceFromSchema(product, size);

              return (
                <div key={product.productId || product._id} className="related-item">
                  <div
                    onClick={() => {
                      console.log('🔍 Related item data:', product);
                      console.log('🔍 Product ID:', product.productId || product._id);
                      console.log('🔍 Category:', product.categoryName);
                      const productId = product.productId || product._id;
                      if (!productId) {
                        console.error('❌ No valid ID found for product:', product);
                        return;
                      }
                      navigate(`/product/${encodeURIComponent(product.categoryName || 'product')}/${productId}`);
                    }}
                    className="related-item-content"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="related-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                        e.target.onerror = null;
                      }}
                    />
                    <h4 className="related-name">{product.name}</h4>
                    <p className="related-price">
                      {currentPrice && currentPrice > 0
                        ? `${currentPrice.toLocaleString()} VND / ${size}g`
                        : `Liên hệ để biết giá`}
                    </p>
                  </div>
                  <div className="related-actions">
                    <button
                      className="btn-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!currentPrice || currentPrice === 0}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p>Không có sản phẩm liên quan.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedItems;