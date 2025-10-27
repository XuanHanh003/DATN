import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sign-in.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Không cần navigate("/") vì AuthContext đã xử lý
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="sign-in">
      <h1 className="sign-in-heading">⚡ Đăng nhập TechStore</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="sign-in-form">
        <label htmlFor="email" className="sign-in-label">Email</label>
        <input
          id="email"
          type="email"
          className="sign-in-input"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password" className="sign-in-label">Mật Khẩu</label>
        <input
          id="password"
          type="password"
          className="sign-in-input"
          placeholder="Nhập mật khẩu của bạn (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength="6" // Đảm bảo tối thiểu 6 ký tự
          required
        />
        <button type="submit" className="sign-in-submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p className="sign-in-already">
        <span>Bạn chưa có tài khoản?</span>
        <a href="/sign-up" className="sign-in-login">Đăng ký</a>
      </p>
    </section>
  );
}

export default SignIn;