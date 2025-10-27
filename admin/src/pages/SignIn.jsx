// src/pages/SignIn.jsx - Đồng bộ với frontend
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/sign-in.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <section className="sign-in">
      <h1 className="sign-in-heading">Đăng nhập Admin</h1>
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
          minLength="6"
          required
        />
        <button type="submit" className="sign-in-submit">Đăng nhập</button>
      </form>
      <p className="sign-in-already">
        <span>Bạn chưa có tài khoản admin?</span>
        <span className="sign-in-login">Liên hệ quản trị viên</span>
      </p>
    </section>
  );
};

export default SignIn;