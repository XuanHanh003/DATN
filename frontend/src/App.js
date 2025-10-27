// App.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BigImage from './components/BigImage';
import About from './components/About';
import Menu from './components/Menu';
import CartSidebar from './components/CartSidebar';
import Team from './components/Team';
import SignIn from './components/SignIn';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Payment from './components/Payment';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ChatBot from './components/ChatBot';
import AdvancedChatBot from './components/AdvancedChatBot';
import Profile from './components/Profile';
import SummerBanner from "./components/SummerBanner";
import SearchResults from "./components/SearchResults";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Sử dụng useAuth

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-wrapper">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="main-content">
                  <Header />
                  <SummerBanner />
                  <BigImage />
                  <About />
                  <Menu />
                  <CartSidebar />
                  <Team />
                  <AdvancedChatBot />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/sign-in" 
              element={
                <div className="main-content"> 
                  <Header />
                  <SignIn />
                </div>
              } 
            />
            <Route 
              path="/sign-up" 
              element={
                <div className="main-content"> 
                  <Header />
                  <SignUp />
                </div>
              } 
            />
            <Route 
              path="/product/:category/:id" 
              element={
                <div className="main-content">
                  <Header />
                  <ProductDetail />
                  <Footer />
                </div>
              } 
            />
            <Route path="/payment" element={<Payment />} />
            {/* Thêm tuyến đường cho giỏ hàng */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/search" element={<SearchResults />} />
            <Route 
              path="/cart" 
              element={
                <div className="main-content">
                  <Header />
                  <Cart />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div className="main-content">
                    <Header />
                    <Profile />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;