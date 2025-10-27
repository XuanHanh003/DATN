// src/components/SearchDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/search.css'; // 👈 Import CSS

const SearchDropdown = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const boxRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim()) {
        axios
          .get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search?keyword=${keyword}`)
          .then((res) => {
            console.log("✅ Kết quả:", res.data);
            setResults(res.data);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error("❌ Lỗi tìm kiếm:", err);
            setResults([]);
            setShowDropdown(false);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-wrapper" ref={boxRef}>
      <input
        type="text"
        placeholder="🔍 Tìm sản phẩm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="search-input"
      />
      {showDropdown && (
        <ul className="search-dropdown">
          {results.length > 0 ? (
            results.map((product) => (
              <li
                key={product._id}
                className="search-item"
                onClick={() => {
                  navigate(`/${product.category}/${product._id}`);
                  setShowDropdown(false);
                }}
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
                <span className="name">{product.name}</span>
                <span className="price">
                  {product.prices?.["250"]
                    ? `${product.prices["250"].toLocaleString()}₫`
                    : "N/A"}
                </span>
              </li>
            ))
          ) : (
            <li className="search-item not-found">Không tìm thấy sản phẩm</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchDropdown;
