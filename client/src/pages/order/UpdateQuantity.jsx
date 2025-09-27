// src/components/Checkout/UpdateQuantity.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { updateCartQuantity } from "../../store/Slices/cartSlice";

const UpdateQuantity = ({ productId, currentQuantity }) => {
    const dispatch = useDispatch();
    const { updateCartQuantityLoading } = useSelector((state) => state.cart);

    const [quantity, setQuantity] = useState(currentQuantity);

    const handleUpdate = async (newQuantity) => {
        if (newQuantity < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }
        setQuantity(newQuantity);

        try {
            await dispatch(updateCartQuantity({ productId, quantity: newQuantity })).unwrap();
            toast.success("Quantity updated successfully!");
        } catch (err) {
            toast.error(err || "Failed to update quantity");
        }
    };

    return (
        <div className="flex items-center gap-3 mt-2">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdate(quantity - 1)}
                disabled={updateCartQuantityLoading}
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                -
            </motion.button>

            <span className="font-semibold text-gray-800">{quantity}</span>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdate(quantity + 1)}
                disabled={updateCartQuantityLoading}
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                +
            </motion.button>
        </div>
    );
};

export default UpdateQuantity;
