import axios from 'axios';

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/products`;
const CATEGORY_URL = `${apiConfig.baseURL}/api/categories`;

// ✅ Lấy danh sách sản phẩm theo categoryId
export const fetchMenuItems = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/list?categoryId=${categoryId}`);
    return response.data.products || [];
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    return [];
  }
};

// ✅ Lấy danh sách tất cả category
export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${CATEGORY_URL}/list`);
    return response.data.categories || [];
  } catch (error) {
    console.error('Lỗi lấy danh mục:', error);
    return [];
  }
};
