// src/services/signupService.js
import axios from 'axios';

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/auth/register`;

export const registerUser = async ({ username, email, phone, password }) => { // Thêm username, phone
  try {
    const response = await axios.post(API_URL, { username, email, phone, password });
    console.log('Response từ register:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi từ server khi đăng ký:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
    throw new Error(errorMessage);
  }
};