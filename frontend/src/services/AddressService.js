import axios from 'axios';

import { apiConfig } from '../config/api';

const API_URL = `${apiConfig.baseURL}/api/addresses`;

const AddressService = {
  getAddresses: async (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token không tồn tại hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    }
    try {
      console.log('Gửi yêu cầu tới:', API_URL, 'với token:', token); // Debug
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Danh sách địa chỉ từ server:', response.data); // Debug
      return Array.isArray(response.data) ? response.data : []; // Đảm bảo trả về mảng
    } catch (error) {
      console.error('Lỗi từ server khi lấy địa chỉ:', error.response?.status, error.response?.data || error.message);
      if (error.response?.status === 404) {
        return []; // Trả về mảng rỗng nếu không tìm thấy
      }
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách địa chỉ');
    }
  },

  addAddress: async (address, token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token không tồn tại hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    }
    try {
      const response = await axios.post(API_URL, address, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.address;
    } catch (error) {
      console.error('Lỗi từ server khi thêm địa chỉ:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể thêm địa chỉ');
    }
  },

  updateAddress: async (id, updatedAddress, token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token không tồn tại hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    }
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.address;
    } catch (error) {
      console.error('Lỗi từ server khi cập nhật địa chỉ:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật địa chỉ');
    }
  },

  deleteAddress: async (id, token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token không tồn tại hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    }
    try {
      console.log('Gửi yêu cầu xóa địa chỉ với id:', id, 'và token:', token);
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Kết quả xóa địa chỉ:', response.status, response.data);
      return { success: true }; // Trả về trạng thái thành công
    } catch (error) {
      console.error('Lỗi từ server khi xóa địa chỉ:', error.response?.status, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể xóa địa chỉ');
    }
  },
};

export default AddressService;