import axios from 'axios';

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/categories`;

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/list`);
  return response.data;
};

export const addCategory = async (categoryData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Chưa đăng nhập');

  const response = await axios.post(`${API_URL}/add`, categoryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
