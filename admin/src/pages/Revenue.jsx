// src/pages/Revenue.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const RevenuePage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-05-28');
  const [groupBy, setGroupBy] = useState('month');
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        console.log('Calling API:', `${API_URL}/api/orders/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`);
        const { data } = await axios.get(`${API_URL}/api/orders/revenue`, {
          params: { startDate, endDate, groupBy },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('API Response:', data);
        setRevenueData(data.revenue || []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error.response ? error.response.data : error.message);
        setRevenueData([]);
      }
    };
    fetchRevenue();
  }, [startDate, endDate, groupBy]);

  useEffect(() => {
    if (!chartRef.current || !revenueData.length) return;

    const ctx = chartRef.current.getContext('2d');
    let chartInstance = Chart.getChart(ctx);
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: revenueData.map(item => item.date),
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: revenueData.map(item => item.totalRevenue),
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          x: { title: { display: true, text: groupBy === 'day' ? 'Ngày' : 'Tháng' } },
          y: { title: { display: true, text: 'Doanh thu (VNĐ)' }, beginAtZero: true },
        },
        plugins: { legend: { display: true } },
      },
    });
  }, [revenueData, groupBy]);

  return (
    <div className="container">
      <h1>Doanh Thu</h1>
      <div className="filter">
        <label>Nhóm theo: </label>
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
        </select>
        <label>Ngày bắt đầu: </label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label>Ngày kết thúc: </label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <canvas ref={chartRef} id="revenueChart" />
      <table>
        <thead>
          <tr>
            <th>{groupBy === 'day' ? 'Ngày' : 'Tháng'}</th>
            <th>Doanh thu (VNĐ)</th>
            <th>Số đơn hàng</th>
          </tr>
        </thead>
        <tbody>
          {revenueData.length === 0 ? (
            <tr><td colSpan="3">Không có dữ liệu doanh thu hoặc lỗi kết nối</td></tr>
          ) : (
            revenueData.map(item => (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{item.totalRevenue.toLocaleString()}</td>
                <td>{item.orderCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RevenuePage;