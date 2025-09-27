import express from "express";
import {
  placeOrder,
  cancelOrder,
  getUserOrders,
  updateOrderStatus,
  getOrdersByBuyerId,
  getOrdersBySellerId,
} from "../controllers/order.controller.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js"; 

const router = express.Router();

// Protected routes
router.post("/", isLoggedIn, placeOrder);
router.patch("/:orderId/cancel", isLoggedIn, cancelOrder);
router.get("/my-orders", isLoggedIn, getUserOrders);
router.get("/buyer/:buyerId", isLoggedIn, getOrdersByBuyerId);
router.get("/seller/:sellerId", isLoggedIn, getOrdersBySellerId);
router.patch("/:orderId/status", isLoggedIn, updateOrderStatus);

export default router;
