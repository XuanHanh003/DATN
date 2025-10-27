import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/Payment.css";

const mapSizeToDisplay = (size) => {
  switch (size) {
    case "250": return "0.25kg";
    case "500": return "0.5kg";
    case "1000": return "1kg";
    default: return `${size}kg`;
  }
};

const PaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(search);
  const txnRef = params.get("txnRef");
  const transactionNo = params.get("transactionNo");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      console.log("Token trước khi xử lý thanh toán:", user?.token); // Debugging token
      console.log("pendingOrder trước khi xử lý:", localStorage.getItem("pendingOrder")); // Debugging pendingOrder

      if (!txnRef || !transactionNo || !transactionStatus) {
        setError("Thông tin giao dịch không hợp lệ. Vui lòng quay lại trang chủ.");
        setLoading(false);
        return;
      }

      if (transactionStatus !== "00") {
        setError("Giao dịch không thành công. Vui lòng quay lại trang chủ.");
        setLoading(false);
        return;
      }

      let pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));

      // Nếu có pendingOrder, sử dụng nó để hiển thị thông tin đơn hàng
      if (pendingOrder) {
        const { items, total, address } = pendingOrder;

        if (!items || !Array.isArray(items) || items.length === 0) {
          setError("Danh sách sản phẩm không hợp lệ. Vui lòng quay lại trang chủ.");
          setLoading(false);
          return;
        }
        if (!total || isNaN(total) || total <= 0) {
          setError("Tổng tiền không hợp lệ. Vui lòng quay lại trang chủ.");
          setLoading(false);
          return;
        }
        if (!address || !address.fullName || !address.phone || !address.address) {
          setError("Địa chỉ giao hàng không đầy đủ. Vui lòng quay lại trang chủ.");
          setLoading(false);
          return;
        }

        setOrderDetails(pendingOrder);
        setLoading(false);
        localStorage.removeItem("pendingOrder");
        return;
      }

      // Nếu không có pendingOrder, lấy thông tin đơn hàng từ API
      console.warn("Không tìm thấy pendingOrder trong localStorage, thử lấy từ API...");
      if (user?.token) {
        try {
          const existingOrder = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/by-transaction/${transactionNo}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          if (existingOrder.data) {
            console.log("Đã lấy được đơn hàng từ API:", existingOrder.data);
            setOrderDetails(existingOrder.data);
            setLoading(false);
            localStorage.removeItem("pendingOrder");
            return;
          } else {
            setError(
              "Không tìm thấy thông tin chi tiết đơn hàng trong hệ thống. Giao dịch của bạn đã được ghi nhận với mã giao dịch: " +
              transactionNo +
              ". Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."
            );
            setLoading(false);
            localStorage.removeItem("pendingOrder");
            return;
          }
        } catch (error) {
          console.error("Lỗi khi lấy đơn hàng từ API:", error.response?.data || error.message);
          let errorMessage = "Không thể lấy thông tin đơn hàng. Giao dịch của bạn đã được ghi nhận với mã giao dịch: " + transactionNo + ".";
          if (error.response?.status === 401) {
            errorMessage += " Token không hợp lệ, vui lòng đăng nhập lại.";
          } else if (error.response?.status === 404) {
            errorMessage += " Đơn hàng không tồn tại trong hệ thống.";
          } else {
            errorMessage += " Lỗi server, vui lòng thử lại sau.";
          }
          errorMessage += " Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.";
          setError(errorMessage);
          setLoading(false);
          localStorage.removeItem("pendingOrder");
          return;
        }
      } else {
        setError(
          "Không tìm thấy dữ liệu đơn hàng và không có token để lấy thông tin. Giao dịch của bạn đã được ghi nhận với mã giao dịch: " +
          transactionNo +
          ". Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ để biết thêm chi tiết."
        );
        setLoading(false);
        localStorage.removeItem("pendingOrder");
        return;
      }
    };

    handlePaymentSuccess();
  }, [txnRef, transactionNo, transactionStatus, user, navigate]);

  if (loading) {
    return (
      <div className="payment-container">
        <h2>Đang xử lý thanh toán...</h2>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2 className="success">Thanh toán thành công</h2>
      {error ? (
        <div>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate("/")} className="payment-btn">
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="order-summary">
          <h3>Thông tin giao dịch</h3>
          <p>Mã đơn hàng: <strong>{txnRef}</strong></p>
          <p>Mã giao dịch VNPay: <strong>{transactionNo}</strong></p>
          <h3>Chi tiết đơn hàng</h3>
          <div className="order-items">
            {orderDetails?.items?.map((item) => (
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
            <p>Tổng thanh toán ({orderDetails?.items?.length || 0} sản phẩm): <strong>{orderDetails?.total.toLocaleString()}đ</strong></p>
          </div>
          <h3>Địa chỉ giao hàng</h3>
          <p><strong>{orderDetails?.address?.fullName}</strong> ({orderDetails?.address?.phone})</p>
          <p>{orderDetails?.address?.address}</p>
          <p>Cảm ơn bạn đã mua sắm! Đơn hàng của bạn đã được ghi nhận.</p>
          <button onClick={() => navigate("/")} className="payment-btn">
            Quay lại trang chủ
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;