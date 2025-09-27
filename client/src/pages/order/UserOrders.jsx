import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { getUserOrders } from "../../store/Slices/orderSlice";
import { CancelOrderButton } from "./CancelOrderButton";
import {
    FaShippingFast,
    FaBoxOpen,
    FaTimesCircle,
    FaMoneyBillWave,
} from "react-icons/fa";

const UserOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, fetchOrdersLoading, error } = useSelector(
        (state) => state.order
    );
    
    const {
        currentUser,
        loading: authLoading,
        error: userError,
    } = useSelector((state) => state.user);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!authLoading && !currentUser && userError) {
            toast.error("Please log in to view your orders");
            navigate("/login");
            return;
        }
        if (userError) {
            toast.error(userError);
            navigate("/login");
            return;
        }
        if (currentUser) {
            dispatch(getUserOrders());
        }
    }, [dispatch, authLoading, currentUser, userError, navigate]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "shipped":
                return "bg-blue-100 text-blue-800";
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "pending":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (authLoading || fetchOrdersLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="h-10 w-10 border-4 border-t-indigo-600 border-gray-200 rounded-full"
                ></motion.div>
                <p className="mt-3 text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        toast.error(error);
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto p-6 pb-20 md:pb-6"


        >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500 text-center">You haven’t placed any orders yet.</p>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                        >
                            {/* Order Summary Header */}
                            <div className="p-5 bg-gradient-to-r from-indigo-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-700 font-medium">
                                        Order ID: <span className="font-semibold">{order._id}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <FaShippingFast className="text-indigo-600" />
                                        Placed on:{" "}
                                        {new Date(order.orderedAt).toLocaleDateString("en-US")}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-green-600" />
                                        Total: ${order.totalPrice?.toFixed(2)}
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <FaBoxOpen className="text-gray-600" />
                                        Status:{" "}
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                order.overallStatus
                                            )}`}
                                        >
                                            {order.overallStatus.charAt(0).toUpperCase() +
                                                order.overallStatus.slice(1)}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleOrderDetails(order._id)}
                                        className="py-2 px-4 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                                    >
                                        {expandedOrder === order._id ? "Hide Details" : "View Details"}
                                    </motion.button>
                                    {["pending", "processing"].includes(order.overallStatus) && (
                                        <CancelOrderButton
                                            orderId={order._id}
                                            onCancel={() => console.log("Cancel order", order._id)}
                                            className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                                            icon={<FaTimesCircle />}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Expandable Order Details */}
                            {expandedOrder === order._id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6 space-y-6"
                                >
                                    {/* Shipping */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                            Shipping Address
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress.fullName},{" "}
                                            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                                            {order.shippingAddress.state},{" "}
                                            {order.shippingAddress.postalCode},{" "}
                                            {order.shippingAddress.country}
                                        </p>
                                    </div>

                                    {/* Products */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                            Products
                                        </h3>
                                        <div className="divide-y divide-gray-200">
                                            {order.products.map((item) => (
                                                <div
                                                    key={item.productId._id}
                                                    className="py-4 flex items-center gap-4"
                                                >
                                                    {item.productId.images?.[0] && (
                                                        <img
                                                            src={item.productId.images[0]}
                                                            alt={item.productId.name}
                                                            className="w-16 h-16 rounded-lg object-cover border"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {item.productId.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Quantity: {item.quantity}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Price: ${item.productId.price?.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs">
                                                            Status:{" "}
                                                            <span
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                                    item.status
                                                                )}`}
                                                            >
                                                                {item.status.charAt(0).toUpperCase() +
                                                                    item.status.slice(1)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default UserOrders;
