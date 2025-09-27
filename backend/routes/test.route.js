import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";

import {
  signup,
  login,
  logout,
  upgradeSeller,
  getAuthUser,
  deleteUser,
  updateUser,
  createProduct,
  getAllProducts,
  getProductById,
  giveReview,
  placeOrder,
  cancelOrder,
  updateOrderStatus,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  getUsersOrders,
} from "../controllers/test.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.post("/logout", logout);

router.patch("/upgrade-seller", isLoggedIn, upgradeSeller);
router.get("/me", isLoggedIn, getAuthUser);
router.patch(
  "/: id",
  isLoggedIn,
  upload.fields([{ name: "profile", maxCount: 1 }]),
  updateUser
);
router.delete("/:id", isLoggedIn, deleteUser);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", upload.array("images", 5), isLoggedIn, createProduct);
router.post("/:productId/preview", isLoggedIn, giveReview);

router.post("/",isLoggedIn, placeOrder)
router.patch("/:orderId/cancel", isLoggedIn,cancelOrder)
router.get("/my-orders", isLoggedIn, getUsersOrders)
router.patch("/:orderId/status", isLoggedIn, updateOrderStatus)
router.post("/add", isLoggedIn, addToCart)
router.delete("/remove/:productId", isLoggedIn, removeFromCart)
router.put("/update",isLoggedIn, updateCartQuantity)
router.get("/", isLoggedIn, getCart)
export default router;
