import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// ✅ Add product to cart

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validate product exists
    const product = await Product.findById(productId).select(
      "price name images"
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Attempt to update existing item quantity
    let cart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      {
        $inc: {
          "items.$.quantity": quantity,
          totalPrice: product.price * quantity,
        },
      },
      { new: true }
    ).populate("items.product", "name price images");

    // If product wasn't in the cart, push as new item
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $push: { items: { product: productId, quantity } },
          $inc: { totalPrice: product.price * quantity },
        },
        { new: true, upsert: true }
      ).populate("items.product", "name price images");
    }

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to add product to cart. Please try again later.",
    });
  }
};

// ✅ Remove product from cart

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Find the cart with the item to remove and populate product details
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "price name images"
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove the product from items
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      // No item was removed
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Recalculate totalPrice based on remaining items
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // Save the cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("removeFromCart: Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while removing from cart",
    });
  }
};

// ✅ Update quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }


    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId).select("price");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const oldSubtotal = product.price * item.quantity;
    const newSubtotal = product.price * quantity;

    item.quantity = quantity;
    cart.totalPrice = cart.totalPrice - oldSubtotal + newSubtotal;

    await cart.save();

    // ✅ repopulate before sending response
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart",
    });
  }
};

// ✅ Get user cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images"
    );
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching cart" });
  }
};
