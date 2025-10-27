import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMenuItems, fetchCategories } from '../services/menuService';
import { useCart } from '../context/CartContext';
import '../styles/menu.css';

function Menu() {
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [sortOption, setSortOption] = useState('default');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading categories...');
        const cats = await fetchCategories();
        console.log('Categories loaded:', cats);
        
        if (!cats || cats.length === 0) {
          setError('Không có danh mục nào được tìm thấy');
          setLoading(false);
          return;
        }
        
        setCategories(cats);
        const allProducts = [];

        console.log('Loading products for each category...');
        for (let cat of cats) {
          try {
            const items = await fetchMenuItems(cat.categoryId || cat._id);
            console.log(`Items for category ${cat.name}:`, items);
            if (items && items.length > 0) {
              allProducts.push(...items.map(item => ({ ...item, categoryName: cat.name })));
            }
          } catch (catError) {
            console.error(`Error loading products for category ${cat.name}:`, catError);
          }
        }

        console.log('Total products loaded:', allProducts.length);
        setAllItems(allProducts);
        setFilteredItems(allProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Không thể tải danh mục hoặc sản phẩm: ' + err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let itemsToShow = [...allItems];

    const activeCats = Object.keys(selectedCategories).filter(key => selectedCategories[key]);
    if (activeCats.length > 0) {
      itemsToShow = itemsToShow.filter(item => activeCats.includes(item.categoryName));
    }

    if (sortOption === 'low-to-high') {
      itemsToShow.sort((a, b) => getFirstPrice(a) - getFirstPrice(b));
    } else if (sortOption === 'high-to-low') {
      itemsToShow.sort((a, b) => getFirstPrice(b) - getFirstPrice(a));
    } else if (sortOption === 'best-seller') {
      itemsToShow.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortOption === 'rating') {
      itemsToShow.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredItems(itemsToShow);
  }, [allItems, selectedCategories, sortOption]);

  const handleCategoryChange = (catName) => {
    setSelectedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const getFirstPrice = (item) => {
    const keys = Object.keys(item.prices || {});
    const validSizes = ['default', '250', '500', '1000'];
    const firstValidKey = keys.find(key => validSizes.includes(key)) || keys[0];
    return item.prices && firstValidKey ? item.prices[firstValidKey] : 0;
  };

  const handleAddToCart = async (item) => {
    console.log('🛒 handleAddToCart called with:', item);
    
    const keys = Object.keys(item.prices || {});
    const validSizes = ['default', '250', '500', '1000'];
    const firstKey = keys.find(key => validSizes.includes(key)) || keys[0] || 'default';
    
    if (!item.prices || !firstKey || !item.prices[firstKey]) {
      setError(`Giá sản phẩm "${item.name}" chưa được cập nhật`);
      return;
    }

    const price = item.prices[firstKey];
    const cartItem = {
      productId: item._id,
      name: item.name,
      price,
      image: item.image,
      quantity: 1,
      attributes: { size: firstKey },
      categoryName: item.categoryName || 'Không xác định'
    };
    
    console.log('🛒 Adding to cart:', cartItem);
    
    try {
      await addToCart(cartItem);
      console.log('✅ Successfully added to cart');
      
      // Hiển thị thông báo thành công
      setShowSuccessMessage(true);
      setError(null);
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setError(`Lỗi khi thêm "${item.name}" vào giỏ hàng: ${error.message}`);
    }
  };

  return (
    <section className="menu" id="dactrung">
      <div className="menu-wrapper">
        <div className="menu-sidebar">
          <h3>Danh Mục</h3>
        {loading && <p className="loading-message">Đang tải...</p>}
        {error && <p className="error-message">{error}</p>}
        {showSuccessMessage && (
          <div className="success-message">
            ✅ Đã thêm sản phẩm vào giỏ hàng thành công!
          </div>
        )}
          <div className="category-checkbox">
            {categories.map(cat => (
              <label key={cat.categoryId || cat._id}>
                <input
                  type="checkbox"
                  checked={!!selectedCategories[cat.name]}
                  onChange={() => handleCategoryChange(cat.name)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="menu-main-content">
          <div className="section-title">
            <h2>SẢN PHẨM CỦA CHÚNG TÔI</h2>
          </div>

          <div className="menu-title">
            <h2>Tận hưởng vị ngon tự nhiên từ thực phẩm đa dạng...</h2>
          </div>

          <div className="menu-products">
            <div className="menu-sort">
              <select value={sortOption} onChange={handleSortChange}>
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="low-to-high">Giá: Thấp đến cao</option>
                <option value="high-to-low">Giá: Cao đến thấp</option>
                <option value="best-seller">Bán chạy</option>
                <option value="rating">Đánh giá</option>
              </select>
            </div>

            <div className="menu-lists">
              {loading ? (
                <div className="loading-container">
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="no-products">
                  <p>Không có sản phẩm nào được tìm thấy</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                const keys = Object.keys(item.prices || {});
                const validSizes = ['default', '250', '500', '1000'];
                const firstKey = keys.find(key => validSizes.includes(key)) || keys[0] || 'default';
                const price = item.prices ? item.prices[firstKey] : 0;
                const originalPrice = price ? price / 0.8 : 0;

                return (
                  <div className="food-items" key={item.productId || item._id}>
                    <div
                      className="food-item"
                      onClick={() => {
                        console.log('🔍 Menu item data:', item);
                        console.log('🔍 Item ID:', item.productId || item._id);
                        console.log('🔍 Category:', item.categoryName);
                        const itemId = item.productId || item._id;
                        if (!itemId) {
                          console.error('❌ No valid ID found for item:', item);
                          return;
                        }
                        navigate(`/product/${encodeURIComponent(item.categoryName)}/${itemId}`);
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                          e.target.onerror = null;
                        }}
                      />
                      <h2>{item.name}</h2>
                    </div>
                    <div className="food-price">
                      <span className="current-price">
                        {price ? `${price.toLocaleString()} VND` : 'Giá chưa cập nhật'} / {firstKey}
                      </span>
                      <span className="original-price">
                        {originalPrice ? `${Math.round(originalPrice).toLocaleString()} VND` : 'N/A'}
                      </span>
                      <span className="discount">-20%</span>
                    </div>
                    <div className="food-meta">
                      <span>⭐ {item.rating || 5.0}</span>
                      <span>Đã bán {item.sold || 0}</span>
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                    >
                      🛒
                    </button>
                  </div>
                );
              })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Menu;