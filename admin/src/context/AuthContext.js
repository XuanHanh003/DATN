// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra người dùng:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const signIn = async (email, password) => {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      const userData = await getMe();
      setUser(userData);
      if (userData.role === "admin") {
        navigate("/products");
      } else {
        alert("Chỉ admin mới có quyền truy cập!");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      alert("Đăng nhập thất bại: " + error.message);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};