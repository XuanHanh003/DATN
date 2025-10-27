import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sign-up.css';
import { useAuth } from '../context/AuthContext';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '', // Đổi từ name thành username để khớp với schema
    email: '',
    phone: '', // Thêm phone
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      // Gọi register với 4 tham số: username, email, phone, password
      await register(formData.username, formData.email, formData.phone, formData.password);
      setMessage('Đăng ký thành công! Đang chuyển hướng...');
      setFormData({ username: '', email: '', phone: '', password: '' });
      // Không cần setTimeout và navigate vì AuthContext đã xử lý
    } catch (error) {
      setMessage(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-up">
      <h1 className="sign-up-heading">⚡ Đăng ký TechStore</h1>
      {message && (
        <p style={{ color: message.includes('thành công') ? 'green' : 'red', textAlign: 'center' }}>
          {message}
        </p>
      )}
      <form id="signUpForm" className="sign-up-form" onSubmit={handleSubmit}>
        <label htmlFor="username" className="sign-up-label">Họ và tên</label>
        <input
          id="username"
          name="username" // Đổi từ name thành username
          className="sign-up-input"
          placeholder="Ví dụ: Mai Thái Huy"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <label htmlFor="email" className="sign-up-label">Email</label>
        <input
          id="email"
          name="email"
          className="sign-up-input"
          type="email"
          placeholder="Ví dụ: abcxyz@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="phone" className="sign-up-label">Số điện thoại</label>
        <input
          id="phone"
          name="phone"
          className="sign-up-input"
          type="tel"
          placeholder="Ví dụ: 0123456789"
          value={formData.phone}
          onChange={handleChange}
          pattern="0[0-9]{9}" // Đảm bảo bắt đầu bằng 0 và có 10 chữ số
          title="Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số"
          required
        />
        <label htmlFor="password" className="sign-up-label">Mật Khẩu</label>
        <input
          id="password"
          name="password"
          className="sign-up-input"
          type="password"
          placeholder="Nhập mật khẩu của bạn (tối thiểu 6 ký tự)"
          value={formData.password}
          onChange={handleChange}
          minLength="6" // Đảm bảo tối thiểu 6 ký tự
          required
        />
        <button type="submit" className="sign-up-submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng kí"}
        </button>
      </form>
      <p className="sign-up-already">
        <span>Bạn đã có tài khoản?</span>
        <a href="/sign-in" className="sign-up-login">Đăng nhập</a>
      </p>
    </div>
  );
}

export default SignUp;    