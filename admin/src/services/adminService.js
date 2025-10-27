// src/services/adminService.js
import api from "./api";

export const checkAdminRole = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};