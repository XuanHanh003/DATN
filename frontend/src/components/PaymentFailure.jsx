import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Payment.css";

// Hàm ánh xạ size từ cơ sở dữ liệu sang định dạng hiển thị
const mapSizeToDisplay = (size) => {
  switch (size) {
    case "250": return "0.25kg";
    case "500": return "0.5kg";
    case "1000": return "1kg";
    default: return `${size}kg`;
  }
};

const PaymentFailure = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const txnRef = params.get("txnRef");
  const responseCode = params.get("responseCode");
  const [orderDetails, setOrderDetails] = useState(null);

  const errorMessages = {
    "24": "Bạn đã hủy giao dịch.",
    "13": "Giao dịch thất bại do nhập sai OTP.",
    "07": "Tài khoản không đủ số dư.",
    // Thêm các mã lỗi khác nếu cần
  };

  const errorMessage = errorMessages[responseCode] || "Giao dịch thất bại. Vui lòng thử lại.";

  useEffect(() => {
    const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
    if (pendingOrder) {
      setOrderDetails(pendingOrder);
    }

    if (!txnRef || !responseCode) {
      // Nếu thiếu thông tin, chuyển hướng về giỏ hàng sau 3 giây
      setTimeout(() => navigate("/cart"), 3000);
    }
  }, [txnRef, responseCode, navigate]);

  return (
    <div className="payment-container">
      <h2>Thanh toán thất bại</h2>
      {txnRef && responseCode ? (
        <div className="order-summary">
          <h3>Thông tin lỗi</h3>
          <p>Mã đơn hàng: <strong>{txnRef}</strong></p>
          <p>Mã lỗi: <strong>{responseCode}</strong></p>
          <p>{errorMessage}</p>
          {orderDetails && (
            <>
              <h3>Chi tiết đơn hàng</h3>
              <div className="order-items">
                {orderDetails.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="order-item">
                    <img src={item.image} alt={item.name} className="order-item-image" />
                    <div className="order-item-details">
                      <p><strong>{item.name}</strong></p>
                      <p>Phân loại: {mapSizeToDisplay(item.size)}</p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Đơn giá: {item.price.toLocaleString()}đ</p>
                      <p>Tổng: {(item.price * item.quantity).toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <p>Tổng thanh toán ({orderDetails.items.length} sản phẩm): <strong>{orderDetails.total.toLocaleString()}đ</strong></p>
              </div>
              <h3>Địa chỉ giao hàng</h3>
              <p><strong>{orderDetails.address?.fullName}</strong> ({orderDetails.address?.phone})</p>
              <p>{orderDetails.address?.address}</p>
            </>
          )}
          <button
            onClick={() => navigate("/cart")}
            className="payment-btn"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      ) : (
        <p>Thông tin giao dịch không hợp lệ. Đang chuyển hướng về giỏ hàng...</p>
      )}
    </div>
  );
};

export default PaymentFailure;