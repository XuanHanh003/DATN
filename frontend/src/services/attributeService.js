import axios from 'axios';

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/attributes`;

export const getAttributes = async () => {
  const response = await axios.get(`${API_URL}/list`);
  return response.data;
};

export const addAttribute = async (attributeData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Chưa đăng nhập');

  const response = await axios.post(`${API_URL}/add`, attributeData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
