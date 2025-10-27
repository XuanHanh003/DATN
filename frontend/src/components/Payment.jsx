import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AddressService from "../services/AddressService"; // Import AddressService
import "../styles/Payment.css";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);

  useEffect(() => {
    if (!state || (!state.selectedItems && !state.item) || !state.total || state.total <= 0) {
      setError("Không có sản phẩm nào để thanh toán. Vui lòng quay lại giỏ hàng.");
      setTimeout(() => navigate("/cart"), 3000);
    } else {
      fetchAddresses();
    }
  }, [state, navigate]);

  const fetchAddresses = async () => {
    if (!user?.token || isFetchingAddresses) return;
    setIsFetchingAddresses(true);
    try {
      const addresses = await AddressService.getAddresses(user.token);
      setSavedAddresses(addresses);
      const addressToSelect = addresses.find((addr) => addr._id === state?.selectedAddress?._id) || addresses[0];
      if (addressToSelect) {
        setSelectedAddress({
          _id: addressToSelect._id,
          fullName: addressToSelect.fullName,
          phone: addressToSelect.phone,
          province: addressToSelect.province,
          district: addressToSelect.district,
          ward: addressToSelect.ward,
          detail: addressToSelect.detail,
        });
      } else if (state?.selectedAddress) {
        setSelectedAddress(state.selectedAddress);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", err);
      setError("Không thể tải danh sách địa chỉ. Vui lòng thêm địa chỉ mới.");
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  const items = state?.selectedItems || (state?.item ? [state.item] : []);
  const total = state?.total || 0;

  const createOrderInfo = (items) =>
    items
      .map((item) => {
        const size = item.attributes?.size || "default";
        const price = item.prices?.get(size) || item.price || 0;
        return `${item.name} - ${item.quantity} x ${price.toLocaleString()}đ (Size: ${size})`;
      })
      .join(", ");

  const handlePayment = async () => {
    if (!items.length || !total) {
      setError("Dữ liệu thanh toán không hợp lệ.");
      return;
    }

    if (
      !selectedAddress?.fullName ||
      !selectedAddress?.phone ||
      !selectedAddress?.province ||
      !selectedAddress?.district ||
      !selectedAddress?.ward ||
      !selectedAddress?.detail
    ) {
      setError("Vui lòng chọn hoặc thêm địa chỉ giao hàng đầy đủ trước khi thanh toán.");
      setTimeout(() => navigate("/cart"), 3000);
      return;
    }

    if (!user?.token || !user?._id) {
      setError("Vui lòng đăng nhập để thanh toán.");
      setTimeout(() => navigate("/sign-in"), 3000);
      return;
    }

    const addressString = `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;

    const products = [];
    items.forEach((item) => {
      const size = item.attributes?.size || "default";
      const price = item.prices?.get(size) || item.price || 0;
      console.log(`Product: ${item.name}, Size: ${size}, Price: ${price}, Attributes:`, item.attributes);
      if (!size || price <= 0) {
        setError(`Dữ liệu không hợp lệ cho sản phẩm ${item.name}. Vui lòng kiểm tra kích thước hoặc giá.`);
        return;
      }
      products.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price,
        size: size,
        color: item.attributes?.color || "Không xác định",
      });
    });

    if (products.length === 0) {
      setError("Không có sản phẩm nào hợp lệ để thanh toán.");
      return;
    }

    const pendingOrder = {
      userId: user._id,
      items: products,
      totalPrice: total,
      address: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: addressString,
      },
    };

    if (
      !pendingOrder.items.length ||
      !pendingOrder.totalPrice ||
      !pendingOrder.address.fullName ||
      !pendingOrder.address.phone ||
      !pendingOrder.address.address
    ) {
      setError("Dữ liệu đơn hàng không đầy đủ. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Dữ liệu gửi đến API:", {
        amount: total,
        orderInfo: createOrderInfo(items),
        userId: pendingOrder.userId,
        items: pendingOrder.items,
        totalPrice: pendingOrder.totalPrice,
        address: pendingOrder.address,
        token: user.token, // Thêm để debug
      });
      const response = await axios.post(
        "http://localhost:5001/create_payment",
        {
          amount: total,
          orderInfo: createOrderInfo(items),
          userId: pendingOrder.userId,
          items: pendingOrder.items,
          totalPrice: pendingOrder.totalPrice,
          address: pendingOrder.address,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (response.data.status === "success") {
        window.location.href = response.data.url;
      } else {
        setError(response.data.error || "Không thể tạo URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        logout();
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/sign-in"), 3000);
      } else {
        setError(
          error.response?.data?.error || error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!items.length || !total) {
    return (
      <div className="payment-container">
        <h2>Thanh toán</h2>
        <p className="error-message">{error || "Đang tải..."}</p>
      </div>
    );
  }

  return (
    <div className="payment-container with-background">
      <h2>Thanh toán</h2>
      <div className="order-summary">
        <h3>Thông tin đơn hàng</h3>
        <div className="order-items">
          {items.map((item) => {
            const size = item.attributes?.size || "default";
            const price = item.prices?.get(size) || item.price || 0;
            return (
              <div key={`${item.productId}`} className="order-item">
                <img src={item.image} alt={item.name} className="order-item-image" />
                <div className="order-item-details">
                  <p>
                    <strong>{item.name}</strong>
                  </p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Đơn giá: {price.toLocaleString()}đ</p>
                  <p>Kích thước: {item.attributes?.size || "Không xác định"}</p>
                  <p>Màu sắc: {item.attributes?.color || "Không xác định"}</p>
                  <p>Tổng: {(price * item.quantity).toLocaleString()}đ</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="order-total">
          <p>
            Tổng thanh toán ({items.length} sản phẩm): <strong>{total.toLocaleString()}đ</strong>
          </p>
        </div>
      </div>
      <div className="shipping-address">
        <h3>Địa chỉ giao hàng</h3>
        {isFetchingAddresses ? (
          <p>Đang tải địa chỉ...</p>
        ) : selectedAddress ? (
          <div>
            <p>
              <strong>{selectedAddress.fullName}</strong> ({selectedAddress.phone})
            </p>
            <p>
              {`${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}
            </p>
          </div>
        ) : (
          <p>Chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ trong giỏ hàng.</p>
        )}
      </div>
      <div className="payment-actions">
        {error && <p className="error-message">{error}</p>}
        <button
          onClick={handlePayment}
          disabled={loading || !selectedAddress?.fullName || !user?.token || isFetchingAddresses}
          className="payment-btn"
        >
          {loading ? "Đang xử lý..." : "Thanh toán với VNPay"}
        </button>
      </div>
    </div>
  );
};

export default Payment;