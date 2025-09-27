import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { removeFromCart } from '../../store/Slices/cartSlice'; // Adjust path

export const RemoveFromCartButton = ({ productId, onRemove }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { removeFromCartLoading, error } = useSelector((state) => state.cart);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastError, setLastError] = useState(null);

    // Handle error toasts
    useEffect(() => {
        if (error && !isSubmitting && error !== lastError) {
            
            toast.error(error || 'Failed to remove product from cart');
            setLastError(error);
        }
    }, [error, isSubmitting, lastError]);

    const handleRemoveFromCart = async () => {
        if (!currentUser) {
            toast.error('Please log in to remove items from your cart');
            navigate('/login');
            return;
        }
        if (!window.confirm('Are you sure you want to remove this product from your cart?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(removeFromCart(productId)).unwrap();
           
            toast.success('Product removed from cart!');
            if (onRemove) {
                onRemove();
            }
        } catch (err) {
            console.error('RemoveFromCartButton: Error:', err);
            // Error toast handled in useEffect
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveFromCart}
            disabled={removeFromCartLoading || isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${removeFromCartLoading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            {removeFromCartLoading || isSubmitting ? 'Removing...' : 'Remove'}
        </motion.button>
    );
};