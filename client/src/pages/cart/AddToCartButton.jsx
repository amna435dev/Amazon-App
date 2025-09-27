import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { addToCart } from '../../store/Slices/cartSlice';

export const AddToCartButton = ({ productId, quantity = 1 }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { addToCartLoading } = useSelector((state) => state.cart);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddToCart = async () => {
        if (!currentUser) {

            toast.error('Please log in to add items to your cart');
            navigate('/login');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const data = { productId, quantity };
            await dispatch(addToCart(data)).unwrap();

            toast.success('Product added to cart!');

        } catch (err) {
            console.error('AddToCartButton: Error:', err);
            toast.error(err || 'Failed to add product to cart');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={addToCartLoading || isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${addToCartLoading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            {addToCartLoading || isSubmitting ? 'Adding...' : 'Add to Cart'}
        </motion.button>
    );
};