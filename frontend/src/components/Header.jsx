// src/components/Header.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // ✅ Thêm state cho ô search
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
    }, []);

    const toggleDropdown = useCallback(() => {
        setDropdownOpen(prev => !prev);
    }, []);

    const handleLogout = useCallback(() => {
        logout();
        setDropdownOpen(false);
        navigate("/");
    }, [logout, navigate]);

    // ✅ Xử lý Enter để chuyển trang tìm kiếm embedding
    const handleSearchKeyDown = useCallback((e) => {
        if (e.key === "Enter" && searchTerm.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
            setSearchTerm("");
        }
    }, [searchTerm, navigate]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // Memoize user info để tránh re-render
    const userInfo = useMemo(() => {
        if (!user || user.isGuest) return null;
        return {
            username: user.username,
            isLoggedIn: true
        };
    }, [user]);

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <div className="logo">
                        <Link to="/" className="logo-text">
                            <span className="logo-icon">⚡</span>
                            <span className="logo-name">TechStore</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                        <ul style={{ justifyContent: 'flex-start' }}>
                            <li>
                                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                                    Trang Chủ
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    {/* ✅ Ô search */}
                    <div className="flex-1 px-6">
                        <input
                            type="text"
                            placeholder="🔍 Tìm sản phẩm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className="search-input"
                        />
                    </div>

                    {/* User Actions */}
                    <div className="user-actions">
                        {userInfo ? (
                            <div className="user-dropdown">
                                <div className="user-info" onClick={toggleDropdown}>
                                    <span className="username">Chào, {userInfo.username}</span>
                                    <span className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`}>
                                        <i className="fas fa-caret-down"></i>
                                    </span>
                                </div>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Thông tin tài khoản
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="dropdown-item logout-btn"
                                        >
                                            Đăng Xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/sign-in" className="sign-in-btn">
                                Đăng Nhập
                            </Link>
                        )}
                        <button className="menu-toggle" onClick={toggleMenu}>
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
