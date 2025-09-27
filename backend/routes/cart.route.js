import express from "express";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
} from "../controllers/cart.controller.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js"; 

const router = express.Router();

router.post("/add", isLoggedIn, addToCart);
router.delete("/remove/:productId", isLoggedIn, removeFromCart);
router.patch("/quantity/:productId", isLoggedIn, updateCartQuantity);

router.get("/", isLoggedIn, getCart);

export default router;
