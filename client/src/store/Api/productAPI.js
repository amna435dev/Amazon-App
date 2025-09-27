import axios from "axios";

const BASE_URL = "http://localhost:5004/api/products";
const api = axios.create({ baseURL:BASE_URL, withCredentials:true });

export const createProduct = (formData) =>
  api.post("/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllProducts = (params = {}) => api.get("/", { params });

export const getProductById = (productId) => api.get(`/${productId}`);

export const giveReview = (productId, data) =>
  api.post(`/${productId}/review `, data, {
    headers: { "Content-Type": "application/json" },
  });

export const getProductsBySellerId = (sellerId) =>
  api.get(`/seller/${sellerId}`);

export const updateSellerProduct = (id, formData) =>
  api.patch(`/seller/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSellerProduct = (id) => api.delete(`/seller/${id}`);
