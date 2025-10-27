// src/pages/Dashboard.jsx - Professional Admin Dashboard
import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize with empty data
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          totalCustomers: 0
        });

        setRecentOrders([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Hoàn thành', class: 'badge-success' },
      pending: { label: 'Chờ xử lý', class: 'badge-warning' },
      processing: { label: 'Đang xử lý', class: 'badge-neutral' },
      cancelled: { label: 'Đã hủy', class: 'badge-error' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'badge-neutral' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng trở lại! Đây là tổng quan về cửa hàng của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L18 21H6L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.totalCustomers.toLocaleString()}</h3>
            <p>Khách hàng</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-dashboard-section">
        <div className="admin-section-header">
          <h2>Đơn hàng gần đây</h2>
          <button className="btn btn-secondary btn-sm">Xem tất cả</button>
        </div>
        
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-sm">#{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td className="font-semibold">{formatCurrency(order.amount)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-neutral">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-dashboard-section">
        <div className="admin-section-header">
          <h2>Thao tác nhanh</h2>
        </div>
        
        <div className="admin-quick-actions">
          <button className="admin-quick-action-btn">
            <div className="admin-quick-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="admin-quick-action-content">
              <h4>Thêm sản phẩm</h4>
              <p>Tạo sản phẩm mới</p>
            </div>
          </button>

          <button className="admin-quick-action-btn">
            <div className="admin-quick-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="admin-quick-action-content">
              <h4>Xem báo cáo</h4>
              <p>Phân tích doanh thu</p>
            </div>
          </button>

          <button className="admin-quick-action-btn">
            <div className="admin-quick-action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L18 21H6L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="admin-quick-action-content">
              <h4>Quản lý đơn hàng</h4>
              <p>Xử lý đơn hàng mới</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;