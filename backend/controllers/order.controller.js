import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";


// Place Order Controller
export const placeOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;
    const userId = req.user.id;

    // ✅ Validate buyer
    const buyer = await User.findById(userId);
    if (!buyer) {
      return res.status(403).json({
        success: false,
        message: "Only Authenticated can place orders",
      });
    }

    // ✅ Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is incomplete",
      });
    }

    // ✅ Validate products and calculate total price
    let totalPrice = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
      if (product.stock < item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${product.name}. Available stock: ${product.stock}`,
        });
      }

      totalPrice += product.price * item.quantity;
      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Create new order with shipping address
    const order = new Order({
      buyer: userId,
      products: validatedProducts,
      totalPrice,
      shippingAddress,
    });

    await order.save();

    // Add order to buyer's orders
    buyer.orders.push(order._id);
    await buyer.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        buyer: order.buyer,
        products: order.products,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        overallStatus: order.overallStatus,
        orderedAt: order.orderedAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Place order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during order placement",
    });
  }
};

// Cancel Order Controller
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    // ✅ Check using overallStatus
    if (
      order.overallStatus !== "pending" &&
      order.overallStatus !== "processing"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled in its current status",
      });
    }

    // ✅ Update both overall and product status
    order.overallStatus = "cancelled";
    order.products.forEach((item) => {
      item.status = "cancelled";
    });
    await order.save();

    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        overallStatus: order.overallStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error during order cancellation", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during order cancellation",
    });
  }
};

// Get User Orders Controller
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find orders for the user
    const orders = await Order.find({ buyer: userId })
      .populate({
        path: "products.productId",
        select: "name price images",
      })
      .sort({ orderedAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate user role
    const user = await User.findById(userId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update order status",
      });
    }

    // Find order
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if seller owns any product in the order (skip null productId)
    const ownsProduct = order.products.some(
      (item) =>
        item.productId &&
        item.productId.seller &&
        item.productId.seller.toString() === userId
    );
    if (!ownsProduct) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order's status",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update status of seller's products (skip null productId)
    order.products = order.products.map((item) =>
      item.productId &&
      item.productId.seller &&
      item.productId.seller.toString() === userId
        ? { ...item, status }
        : item
    );

    // Calculate overallStatus (only consider valid products)
    const validProducts = order.products.filter((item) => item.productId);
    const allStatuses = validProducts.map((item) => item.status);
    let overallStatus;
    if (allStatuses.length === 0) {
      overallStatus = "cancelled"; // Or handle as error if no valid products
    } else if (allStatuses.every((s) => s === "delivered")) {
      overallStatus = "delivered";
    } else if (allStatuses.every((s) => s === "cancelled")) {
      overallStatus = "cancelled";
    } else if (allStatuses.some((s) => s === "cancelled")) {
      overallStatus = "partially cancelled";
    } else if (allStatuses.some((s) => s === "shipped")) {
      overallStatus = "shipped";
    } else if (allStatuses.some((s) => s === "processing")) {
      overallStatus = "processing";
    } else {
      overallStatus = "pending";
    }

    order.overallStatus = overallStatus;
    await order.save();

    // Log warning if invalid products found
    const invalidCount = order.products.filter(
      (item) => !item.productId
    ).length;
    if (invalidCount > 0) {
      console.warn(
        `Order ${orderId} has ${invalidCount} invalid product references.`
      );
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: order._id,
        status: order.overallStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update the order status. Please try again later.",
    });
  }
};

export const getOrdersByBuyerId = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const userId = req.user.id;

    // Validate user
    if (userId !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view these orders",
      });
    }

    const orders = await Order.find({ buyer: buyerId })
      .populate("products.productId", "name price images")
      .sort({ orderedAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// export const getOrdersBySellerId = async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const userId = req.user.id;

//     // Validate user
//     if (userId !== sellerId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized to view these orders",
//       });
//     }

//     // Find orders containing products from the seller using aggregation
//     const orders = await Order.aggregate([
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $match: {
//           "productDetails.seller": new mongoose.Types.ObjectId(sellerId),
//         },
//       },
//       {
//         $sort: { orderedAt: -1 },
//       },
//     ]);

//     // Populate buyer and product details, including seller field
//     const populatedOrders = await Order.populate(orders, [
//       { path: "buyer", select: "name email" },
//       { path: "products.productId", select: "name price images seller" },
//     ]);

//     res.status(200).json({
//       success: true,
//       count: populatedOrders.length,
//       data: populatedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching seller orders:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//     });
//   }
// };

export const getOrdersBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const userId = req.user.id;

    // ✅ Validate user
    if (userId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view these orders",
      });
    }

    // ✅ Find orders and populate buyer + products
    const orders = await Order.find()
      .populate({ path: "buyer", select: "name email" })
      .populate({
        path: "products.productId",
        select: "name price images seller",
      })
      .sort({ orderedAt: -1 });

    // ✅ Filter orders that belong to this seller

    const sellerIdStr = sellerId.toString();
    const sellerOrders = orders.filter((order) =>
      order.products.some(
        (item) => item.productId?.seller?.toString() === sellerIdStr
      )
    );

    res.status(200).json({
      success: true,
      count: sellerOrders.length,
      data: sellerOrders,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
