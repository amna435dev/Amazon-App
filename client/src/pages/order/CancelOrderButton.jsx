import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { cancelOrder } from '../../store/Slices/orderSlice';


export const CancelOrderButton = ({ orderId }) => {
    const dispatch = useDispatch();
    const { cancelOrderLoading } = useSelector((state) => state.order);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(cancelOrder(orderId)).unwrap();
            toast.success('Order cancelled successfully!');
        } catch (err) {
            toast.error(err || 'Failed to cancel order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelOrder}
            disabled={cancelOrderLoading || isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${(cancelOrderLoading || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            {cancelOrderLoading || isSubmitting ? 'Cancelling...' : 'Cancel Order'}
        </motion.button>
    );
};