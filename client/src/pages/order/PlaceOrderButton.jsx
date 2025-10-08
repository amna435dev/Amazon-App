// PlaceOrderButton.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { placeOrder } from "../../store/Slices/orderSlice";

export const PlaceOrderButton = ({ products, shippingAddress }) => {
    const dispatch = useDispatch();
    const { placeOrderLoading } = useSelector((state) => state.order);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePlaceOrder = async () => {
        //  Validate shipping
        if (
            !shippingAddress ||
            !shippingAddress.fullName ||
            !shippingAddress.street ||
            !shippingAddress.city ||
            !shippingAddress.state ||
            !shippingAddress.postalCode ||
            !shippingAddress.country
        ) {
            toast.error("Please provide a complete shipping address");
            return;
        }

        //  Validate cart products
        if (!products || products.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = { products, shippingAddress };
            await dispatch(placeOrder(orderData)).unwrap();
            toast.success("Order placed successfully!");
        } catch (err) {
            toast.error(err || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlaceOrder}
            disabled={placeOrderLoading || isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${placeOrderLoading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {placeOrderLoading || isSubmitting ? "Placing Order..." : "Place Order"}
        </motion.button>
    );
};
