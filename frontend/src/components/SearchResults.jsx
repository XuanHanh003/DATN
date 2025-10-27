import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/SearchResults.css";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword.trim()) {
      setLoading(true);
      axios
        .get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search-embedding?keyword=${encodeURIComponent(keyword)}`)
        .then((res) => {
          // Backend trả về dạng { success: true, results: [...] }
          const results = res.data.results || [];
          // Chuẩn hóa dữ liệu để có đầy đủ thông tin
          const normalized = results.map((item) => ({
            _id: item.id,
            name: item.name,
            image: item.image,
            prices: item.prices,
            categoryName: item.category,
            score: item.score
          }));
          setResults(normalized);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Lỗi tìm kiếm:", err);
          setResults([]);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [keyword]);

  const getFirstValidPrice = (prices) => {
    if (!prices) return 0;
    const validSizes = ["250", "500", "1000"];
    const keys = Object.keys(prices);
    const key = keys.find(k => validSizes.includes(k)) || keys[0];
    return key && prices[key] ? prices[key] : 0;
  };

  if (loading) return <p>⏳ Đang tìm kiếm...</p>;

  if (!results.length) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div className="search-results">
      <h2>Kết quả tìm kiếm embedding cho: "{keyword}"</h2>
      <p className="search-info">Tìm thấy {results.length} sản phẩm liên quan</p>
      <div className="product-list">
        {results.map((p) => {
          const price = getFirstValidPrice(p.prices);
          return (
            <div key={p._id} className="product-item">
              <div className="product-image">
                <img 
                  src={p.image} 
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="product-info">
                <h3>{p.name}</h3>
                <p className="category">{p.categoryName}</p>
                <p className="price">{price ? `${price.toLocaleString()}₫` : "Giá chưa cập nhật"}</p>
                {p.score && (
                  <div className="relevance-score">
                    <span className="score-label">Độ liên quan:</span>
                    <span className="score-value">{(p.score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchResults;
