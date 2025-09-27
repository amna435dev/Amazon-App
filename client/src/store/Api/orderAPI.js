import axios from "axios";

const BASE_URL = "http://localhost:5004/api/orders";
const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const placeOrder = (data) =>
  api.post("/", data, {
    headers: { "Content-Type": "application/json" },
  });

export const cancelOrder = (orderId) => api.patch(`/${orderId}/cancel`);

export const getUserOrders = () => api.get("/my-orders");

export const updateOrderStatus = (orderId, status) =>
  api.patch(
    `/${orderId}/status`,
    { status },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

export const getOrdersByBuyerId = (buyerId) => api.get(`/buyer/${buyerId}`);

export const getOrdersBySellerId = (sellerId) =>
    api.get(`/seller/${sellerId}`);


