import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";
import { signIn } from "../services/signinService";
import { registerUser } from "../services/signupService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    const tempUserId = localStorage.getItem("tempUserId");

    const initializeUser = async () => {
      if (token) {
        console.log("Token từ localStorage:", token);
        try {
          const response = await axios.get(`${apiConfig.baseURL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("User data từ /me:", response.data);

          if (isMounted) {
            setUser({ ...response.data, _id: response.data.id, token, isGuest: false });
            setLoading(false);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error.response?.data || error.message);
          if (isMounted) {
            localStorage.removeItem("token");
            const guestId = tempUserId || `guest-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("tempUserId", guestId);
            setUser({ _id: guestId, isGuest: true });
            navigate("/sign-in");
            setLoading(false);
          }
        }
      } else if (tempUserId) {
        if (isMounted) {
          setUser({ _id: tempUserId, isGuest: true });
          setLoading(false);
        }
      } else {
        const guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("tempUserId", guestId);
        if (isMounted) {
          setUser({ _id: guestId, isGuest: true });
          setLoading(false);
        }
      }
    };

    initializeUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const login = async (email, password) => {
    try {
      if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu.");
      console.log("Đang gửi request login:", { email, apiURL: apiConfig.baseURL });

      const response = await signIn(email, password);
      console.log("Response từ login:", response);

      const { token, user: userData } = response;

      if (!token || typeof token !== "string" || !userData) {
        throw new Error("Không nhận được token hoặc dữ liệu user từ server");
      }

      localStorage.setItem("token", token);
      localStorage.removeItem("tempUserId");

      setUser({ ...userData, _id: userData.id, token, isGuest: false });
      console.log("Đăng nhập thành công, chuyển về trang chủ");
      navigate("/"); // Chuyển về trang chủ sau khi đăng nhập thành công
    } catch (error) {
      console.error("Chi tiết lỗi login:", error);
      const errorMessage = error.message || "Email hoặc mật khẩu không đúng";
      console.error("Lỗi login:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (username, email, phone, password) => {
    try {
      if (!username || !email || !phone || !password) {
        throw new Error("Vui lòng nhập đầy đủ thông tin.");
      }

      console.log("Đang gửi request register:", { username, email, phone });

      const response = await registerUser({ username, email, phone, password });
      console.log("Response từ register:", response);

      const { token, user: userData } = response;

      if (!token || typeof token !== "string" || !userData) {
        throw new Error("Không nhận được token hoặc dữ liệu user từ server");
      }

      localStorage.setItem("token", token);
      localStorage.removeItem("tempUserId");

      setUser({ ...userData, _id: userData.id, token, isGuest: false });
      navigate("/"); // Chuyển về trang chủ sau khi đăng ký thành công
    } catch (error) {
      const errorMessage = error.message || "Đăng ký thất bại";
      console.error("Lỗi register:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log("Đăng xuất, xóa token và chuyển sang guest");
    localStorage.removeItem("token");
    const guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tempUserId", guestId);
    setUser({ _id: guestId, isGuest: true });
    navigate("/"); // Chuyển về trang chủ hoặc trang bạn muốn
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
