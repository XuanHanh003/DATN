// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { getAllOrders, updateOrderStatus } from "../services/adminService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Khởi tạo activeStatus từ localStorage (nếu có), mặc định là "All"
  const [activeStatus, setActiveStatus] = useState(() => {
    return localStorage.getItem("activeStatus") || "All";
  });

  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lưu activeStatus vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("activeStatus", activeStatus);
    filterOrdersByStatus(activeStatus); // Áp dụng bộ lọc khi activeStatus thay đổi
  }, [activeStatus, orders]);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
      // Áp dụng bộ lọc ngay sau khi lấy dữ liệu
      filterOrdersByStatus(activeStatus);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };

  const filterOrdersByStatus = (status) => {
    setActiveStatus(status);
    if (status === "All") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === status);
      setFilteredOrders(filtered);
    }
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Làm mới danh sách đơn hàng
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };

  const toggleOrderDetails = (order) => {
    if (selectedOrder && selectedOrder._id === order._id) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "All":
        return "Tất cả";
      case "Pending":
        return "Chờ xác nhận";
      case "Processing":
        return "Đã xác nhận";
      case "Confirmed":
        return "Đã đóng gói";
      case "Shipped":
        return "Đang giao hàng";
      case "Delivered":
        return "Giao thành công";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <h1>Quản Lý Đơn Hàng</h1>

        <div className="status-filter">
          {statuses.map((status) => (
            <button
              key={status}
              className={activeStatus === status ? "active" : ""}
              onClick={() => filterOrdersByStatus(status)}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>

        <table>
          <thead>
            <tr>
              <th>ID Đơn Hàng</th>
              <th>Khách Hàng</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
              <th>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <>
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userId?.username || "Không xác định"}</td>
                  <td>{order.totalPrice}</td>
                  <td>{getStatusLabel(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">Chờ xác nhận</option>
                      <option value="Processing">Đã xác nhận</option>
                      <option value="Confirmed">Đã đóng gói</option>
                      <option value="Shipped">Đang giao hàng</option>
                      <option value="Delivered">Giao thành công</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => toggleOrderDetails(order)}>
                      {selectedOrder && selectedOrder._id === order._id ? "Ẩn" : "Xem chi tiết"}
                    </button>
                  </td>
                </tr>
                {selectedOrder && selectedOrder._id === order._id && (
                  <tr>
                    <td colSpan="7">
                      <div className="order-details">
                        <h3>Chi Tiết Đơn Hàng</h3>
                        <div className="order-info">
                          <p><strong>Tên người nhận:</strong> {selectedOrder.address.fullName}</p>
                          <p><strong>Số điện thoại:</strong> {selectedOrder.address.phone}</p>
                          <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.address.address}</p>
                        </div>
                        <h4>Chi Tiết Sản Phẩm</h4>
                        <table className="product-details-table">
                          <thead>
                            <tr>
                              <th>Tên Sản Phẩm</th>
                              <th>Số Lượng</th>
                              <th>Giá</th>
                              <th>Kích Thước</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.products.map((product, index) => (
                              <tr key={index}>
                                <td>{product.productId?.name || "Không xác định"}</td>
                                <td>{product.quantity}</td>
                                <td>{product.price}</td>
                                <td>{product.size}g</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
};

export default Orders;