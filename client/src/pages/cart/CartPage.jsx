import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getCart } from '../../store/Slices/cartSlice';
import { fetchCurrentUser } from '../../store/Slices/userSlice';
import { RemoveFromCartButton } from './RemoveFromCartButton';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, fetchCartLoading, error } = useSelector((state) => state.cart);
    console.log('CartPage: cart', cart);
    const { currentUser, userLoading, userError } = useSelector((state) => state.user);
    const [isUserChecked, setIsUserChecked] = useState(false);

    useEffect(() => {
        const checkUserAndFetchCart = async () => {
            if (!currentUser && !userLoading) {
                
                try {
                    await dispatch(fetchCurrentUser()).unwrap();
                } catch (err) {
                   
                    toast.error('Please log in to view your cart');
                    navigate('/login');
                    return;
                }
            }
            setIsUserChecked(true);
        };

        checkUserAndFetchCart();
    }, [dispatch, currentUser, userLoading, navigate]);

    useEffect(() => {
        if (isUserChecked && currentUser) {
            
            dispatch(getCart());
        }
    }, [dispatch, currentUser, isUserChecked]);

    useEffect(() => {
        if (error) {
           
            toast.error(error || 'Failed to fetch cart');
        }
        if (userError) {
           
            toast.error(userError || 'Failed to fetch user data');
            navigate('/login');
        }
    }, [error, userError, navigate]);

    const handleRemoveSuccess = () => {
      
        dispatch(getCart());
    };

    if (userLoading || !isUserChecked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block h-12 w-12 border-4 border-t-indigo-600 border-gray-300 rounded-full"
                ></motion.div>
                <p className="mt-4 text-lg font-medium text-gray-600">Loading user data...</p>
            </div>
        );
    }

    if (fetchCartLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block h-12 w-12 border-4 border-t-indigo-600 border-gray-300 rounded-full"
                ></motion.div>
                <p className="mt-4 text-lg font-medium text-gray-600">Loading cart...</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Your Shopping Cart</h1>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-2xl"
                >
                    <p className="text-lg font-medium">Your cart is empty.</p>
                    <a
                        href="/product-list"
                        className="mt-4 inline-block py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Shop Now
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
        >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Your Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Cart Items */}
                <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6">
                    <div className="space-y-6">
                        {cart.items.map((item) => (
                            <motion.div
                                key={item.product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-4 border-b border-gray-200 pb-4"
                            >
                                <img
                                    src={item.product.images?.[0] }
                                    alt={item.product.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shadow-sm"
                                />
                                <div className="flex-1">
                                    <p className="text-lg sm:text-xl font-semibold text-gray-900">{item.product.name}</p>
                                    <p className="text-sm text-gray-600">Price: ${item.product.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                                        Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                                <RemoveFromCartButton
                                    productId={item.product._id}
                                    onRemove={() => handleRemoveSuccess(item.product._id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3 bg-white rounded-xl shadow-2xl p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        Subtotal ({cart.items.length} items):{' '}
                        <span className="font-semibold text-gray-900">${cart.totalPrice.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Shipping and taxes calculated at checkout</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => navigate('/check-out')}
                    >
                        Proceed to Checkout
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default CartPage;