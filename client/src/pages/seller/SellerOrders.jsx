import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrdersBySellerId,
  updateOrderStatus,
  clearError,
} from "../../store/Slices/orderSlice";
import { motion } from "framer-motion";
import {
  FaUser,
  FaBoxOpen,
  FaMoneyBillWave,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

const SellerOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, updateStatusLoading, error } = useSelector(
    (state) => state.order
  );
  const { currentUser } = useSelector((state) => state.user);
  const sellerId = currentUser?.id;

  useEffect(() => {
    if (sellerId) {
      dispatch(getOrdersBySellerId(sellerId)).unwrap();
    }
  }, [dispatch, sellerId]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
    } catch (err) {
      console.error("❌ Status update failed:", err);
    }
  };

  // Badge styling for statuses
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
      <div className="min-h-screen  dark:from-gray-900 dark:to-gray-950 pb-20  md:p-8">
      <h1 className="  text-2xl md:text-4xl font-bold mb-8 text-gray-900">
        📦 Seller Orders
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-700 dark:text-gray-300">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg">
          No orders found yet.
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const filteredProducts = order.products.filter(
              (item) => item.productId?.seller?.toString() === sellerId
            );

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                   Order Id: {order._id}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.overallStatus] || "bg-gray-200"
                    }`}
                  >
                    {order.overallStatus}
                  </span>
                </div>

                {/* Buyer & Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <FaUser className="text-blue-500" /> Buyer:{" "}
                    <span className="font-medium">{order.buyer.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" /> Total:{" "}
                    <span className="font-medium">${order.totalPrice}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaInfoCircle className="text-indigo-500" /> Status:{" "}
                    <span className="capitalize">{order.overallStatus}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock className="text-gray-500" /> Ordered:{" "}
                    {new Date(order.orderedAt).toLocaleString()}
                  </p>
                </div>

                {/* Products */}
                <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Products
                </h3>
                {filteredProducts.length === 0 ? (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    No products found for this seller.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredProducts.map((item) => (
                      <div
                        key={item.productId._id}
                        className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          <FaBoxOpen className="inline mr-2 text-purple-500" />
                          {item.productId.name}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Price: ${item.productId.price}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              statusColors[item.status] || "bg-gray-200"
                            }`}
                          >
                            {item.status}
                          </span>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            disabled={updateStatusLoading}
                            className="ml-auto px-3 py-1 rounded-md border bg-white text-gray-900 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
