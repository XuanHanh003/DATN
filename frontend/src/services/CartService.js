// src/services/CartService.js
import axios from 'axios';

import { apiConfig } from '../config/api';

const BASE_URL = `${apiConfig.baseURL}/api/carts`;

export async function fetchCart(token) {
  try {
    if (!token) throw new Error('Thiếu token');
    const response = await axios.get(`${apiConfig.baseURL}/api/carts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    throw error.response?.data || error;
  }
}

export async function addToCart(product, token) {
  try {
    if (!token) throw new Error('Thiếu token');
    const { productId, quantity = 1, name, price, image, attributes = {}, categoryName } = product;
    const payload = {
      productId,
      quantity,
      attributes,
      name,
      price,
      image,
      categoryName
    };
    console.log('Adding to cart:', payload);

    const response = await axios.post(
      `${apiConfig.baseURL}/api/cart/add`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
  }
}

export async function increaseQuantity(productId, attributes, token) {
  try {
    if (!token) throw new Error('Thiếu token');
    console.log('Increasing quantity:', { productId, attributes });

    const response = await axios.post(
      `${apiConfig.baseURL}/api/cart/increase/${productId}`,
      { attributes }, // Gửi attributes trong body
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error increasing quantity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi tăng số lượng');
  }
}

export async function decreaseQuantity(productId, attributes, token) {
  try {
    if (!token) throw new Error('Thiếu token');
    console.log('Decreasing quantity:', { productId, attributes });

    const response = await axios.post(
      `${apiConfig.baseURL}/api/cart/decrease/${productId}`,
      { attributes }, // Gửi attributes trong body
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error decreasing quantity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi giảm số lượng');
  }
}

export async function removeFromCart(productId, attributes, token) {
  try {
    if (!token) throw new Error('Thiếu token');
    console.log('Removing from cart:', { productId, attributes });

    const response = await axios.delete(
      `${apiConfig.baseURL}/api/cart/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { attributes } // Gửi attributes trong body
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa khỏi giỏ hàng');
  }
}