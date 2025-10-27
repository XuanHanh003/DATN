import React from 'react';
import '../styles/Footer.css';


function Footer() {
    return (
        <footer className="footer" id="contact">
            <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
                <div className="me-5 d-none d-lg-block">
                    <span>Liên hệ với chúng tôi qua các nền tảng mạng xã hội:</span>
                </div>
                <div className="social">
                    <a href="https://www.facebook.com/share/15M33BvckA/?mibextid=wwXIfr" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://www.tiktok.com/@huongviettinh?_t=ZS-8wjqc5dIT3Z&_r=1" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fa-brands fa-tiktok"></i>
                    </a>
                    <a href="https://www.youtube.com/@thaimarketcongtytnhh7543" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fa-brands fa-youtube"></i>
                    </a>
                    <a href="https://www.instagram.com/huongviettinh?igsh=MXVwbDQ3Zm9jY2wyMg%3D%3D&utm_source=qr" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
            </section>

            <section>
                <div className="container text-center text-md-start mt-5">
                    <div className="row mt-3">
                        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-gem me-3"></i>Nhóm 17
                            </h6>
                            <p></p>
                        </div>
                        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Chứng nhận </h6>
                            <p><a href="#!" className="text-reset">Vệ sinh an toàn</a></p>
                            <p><a href="#!" className="text-reset">Ngon</a></p>
                            <p><a href="#!" className="text-reset">Bổ</a></p>
                            <p><a href="#!" className="text-reset">Rẻ</a></p>
                        </div>
                        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Các chi nhánh cửa hàng</h6>
                            <p><a href="#!" className="text-reset">54 Liễu Giai, Quận Ba Đình, Hà Nội</a></p>
                            <p><a href="#!" className="text-reset">136 Hồ Tùng Mậu, Quận Nam Từ Liêm, Hà Nội</a></p>
                            <p><a href="#!" className="text-reset">24 Quang Trung, Quận Hoàn Kiếm, Hà Nội</a></p>
                            <p><a href="#!" className="text-reset">18 Hoàng Quốc Việt, Quận Cầu Giấy, Hà Nội</a></p>
                        </div>
                        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Liên Hệ</h6>
                            <p><i className="fas fa-home me-3"></i>10 Trần Phú, Hà Đông, Hà Nội</p>
                            <p><i className="fas fa-envelope me-3"></i><a href="mailto:example@email.com">huongviettinh@email.com</a></p>
                            <p><i className="fas fa-phone me-3"></i>+84 234 567 89</p>
                            <p><i className="fas fa-print me-3"></i>+84 234 567 89</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="text-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                © 2025 Copyright:
                <a className="text-reset fw-bold" href="https://mdbootstrap.com/">Nhóm 17</a>
            </div>
        </footer>
    );
}

export default Footer;