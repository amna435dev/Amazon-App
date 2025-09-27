import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  giveReview,
  getProductsBySellerId,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Public route
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", upload.array("images", 5), isLoggedIn, createProduct);
router.post("/:productId/review", isLoggedIn, giveReview);
router.get("/seller/:sellerId", getProductsBySellerId);
router.delete("/seller/:id", isLoggedIn, deleteProduct);
router.patch(
  "/seller/:id",
  upload.array("images", 5),
  isLoggedIn,
  updateProduct
);

export default router;
