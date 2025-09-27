import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import UpdateQuantity from "./UpdateQuantity";
import { getCart } from "../../store/Slices/cartSlice";
import { PlaceOrderButton } from "./PlaceOrderButton";

const CheckOut = () => {
    const dispatch = useDispatch();
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });

    const { cart, fetchCartLoading, error } = useSelector((state) => state.cart);

    // Fetch cart on mount
    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    const productsForOrder =
        cart?.items?.map((item) => ({
            productId: typeof item.product === "string" ? item.product : item.product._id,
            quantity: item.quantity,
        })) || [];

    const totalPrice =
        cart?.items?.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        ) || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen max-w-5xl mx-auto p-4 sm:p-6 md:p-10 mt-6 md:mt-10 pb-20"
        >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
                Checkout
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* LEFT SIDE - ORDER SUMMARY */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="md:col-span-3 bg-white shadow-xl rounded-xl p-6 space-y-6"
                >
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Order Summary
                    </h3>

                    {fetchCartLoading ? (
                        <p className="text-gray-600">Loading cart...</p>
                    ) : error ? (
                        <p className="text-red-500 text-sm font-medium">
                            Failed to load cart
                        </p>
                    ) : cart?.items?.length > 0 ? (
                        <div className="space-y-6">
                            {cart.items.map((item) => (
                                <motion.div
                                    key={item.product?._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-4 border-b border-gray-200 pb-4"
                                >
                                    <img
                                        src={item.product.images?.[0] }
                                        alt={item.product.name}
                                        className="w-20 h-20 object-cover rounded-md shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {item.product.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Price: ${item?.product?.price?.toFixed(2) || "0.00"}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            Quantity:
                                            <UpdateQuantity
                                                productId={item.product._id}
                                                currentQuantity={item.quantity}
                                            />
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-gray-900">
                                            Subtotal: $
                                            {(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                                <span>Total:</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm font-medium">
                            Your cart is empty
                        </p>
                    )}
                </motion.div>

                {/* RIGHT SIDE - SHIPPING DETAILS */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="md:col-span-2 bg-white shadow-xl rounded-xl p-6 space-y-6"
                >
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Shipping Details
                    </h3>

                    <form className="grid  gap-4 sm:grid-cols-2">
                        <input
                            type="text"
                            name="fullName"
                            value={shippingAddress.fullName}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full sm:col-span-2"
                        />
                        <input
                            type="text"
                            name="street"
                            value={shippingAddress.street}
                            onChange={handleChange}
                            placeholder="Street Address"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full sm:col-span-2"
                        />
                        <input
                            type="text"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            name="postalCode"
                            value={shippingAddress.postalCode}
                            onChange={handleChange}
                            placeholder="Postal Code"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            name="country"
                            value={shippingAddress.country}
                            onChange={handleChange}
                            placeholder="Country"
                            className="border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 p-3 rounded-lg w-full"
                        />
                    </form>

                    {/* CTA */}
                    <div className="pt-4">
                        {productsForOrder.length > 0 && (
                            <PlaceOrderButton
                                products={productsForOrder}
                                shippingAddress={shippingAddress}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CheckOut;
