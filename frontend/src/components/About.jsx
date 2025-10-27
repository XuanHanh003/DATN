import React from 'react';
import '../styles/about.css';
import { useAuth } from '../context/AuthContext';

function About() {
    const { user } = useAuth();

    return (
        <section className="about section-padding" id="about">
            <div className="container">
                <div className="row">
                    <div className="section-title">
                        <h2 data-title="">Về TechStore</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="about-item">
                        <h2>TechStore - Cửa hàng điện tử hàng đầu Việt Nam</h2>
                        <p>
                            TechStore là cửa hàng điện tử chuyên nghiệp, cung cấp đầy đủ các sản phẩm công nghệ từ điện thoại, laptop, máy tính bảng đến các phụ kiện điện tử cao cấp. Với hơn 5 năm kinh nghiệm trong ngành, chúng tôi cam kết mang đến cho khách hàng những sản phẩm chính hãng, chất lượng cao với giá cả cạnh tranh nhất thị trường.
                        </p>
                        <div className="action-group" id="userAction">
                            {user ? (
                                <p className="welcome-message">Chào mừng {user.username} đến với TechStore - Cửa hàng điện tử uy tín!</p>
                            ) : (
                                <>
                                    <button className="btn" id="loginBtn">
                                        <a href="/sign-in" target="_blank" rel="noopener">
                                            Đăng nhập
                                        </a>
                                    </button>
                                    <span className="promo-text">
                                        <a href="#" target="_blank" rel="noopener">
                                            ngay để nhận ưu đãi đặc biệt!
                                        </a>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="about-item">
                        <img 
                            src="/images/tech-store-banner.jpg" 
                            alt="TechStore - Cửa hàng điện tử" 
                            onError={(e) => {
                                e.target.src = '/placeholder.png';
                                e.target.onerror = null;
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;