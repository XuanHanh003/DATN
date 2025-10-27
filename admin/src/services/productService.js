// src/services/productService.js
import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/products/list");
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await api.post("/products/add", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};