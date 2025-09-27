import axios from "axios";

const BASE_URL = "http://localhost:5004/api/Carts";

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const addToCart = (data) =>
  api.post("/add", data, {
    headers: { "Content-Type": "application/json" },
  });

export const removeFromCart = (productId) => api.delete(`/remove/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(
    `/quantity/${productId}`,
    { quantity },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

export const getCart = () => api.get("/");
