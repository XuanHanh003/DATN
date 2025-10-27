// src/services/signInService.js
import axios from "axios";

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/auth/login`;

export const signIn = async (email, password) => {
  try {
    const response = await axios.post(API_URL, { email, password });
    console.log('Response từ signIn:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi từ server khi đăng nhập:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi server!";
    throw new Error(errorMessage);
  }
};