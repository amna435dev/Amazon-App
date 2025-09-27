import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getProductById } from '../../store/Slices/productSlice';
import { AddToCartButton } from "../cart/AddToCartButton";
import GiveReview from './GiveReview';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const ProductDetail = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, fetchProductLoading, error } = useSelector(
        (state) => state.product
    );

    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showGiveReview, setShowGiveReview] = useState(false);
    const [showReviews, setShowReviews] = useState(false);

    useEffect(() => {
        if (!productId) {
            toast.error('Invalid product ID');
            navigate('/');
            return;
        }
        dispatch(getProductById(productId));
    }, [productId, dispatch, navigate]);

    useEffect(() => {
        if (currentProduct?.images?.length > 0) {
            setSelectedImage(currentProduct.images[0]);
        }
    }, [currentProduct]);

    if (fetchProductLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block h-10 w-10 border-4 border-t-indigo-600 border-gray-200 rounded-full"
                />
                <p className="mt-3 text-gray-600 text-lg">Loading product...</p>
            </div>
        );
    }

    if (error) {
        toast.error(error);
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }

    if (!currentProduct) {
        return (
            <div className="text-center py-10 text-gray-500 text-lg">
                Product not found. Please try another product.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto pb-20 p-6 md:p-10 bg-[#eeece2] rounded-2xl shadow-xl"
        >
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: Thumbnail Images */}
                <div className="flex md:flex-col gap-3 justify-center">
                    {currentProduct.images?.length > 0 ? (
                        currentProduct.images.map((img, index) => (
                            <motion.img
                                key={index}
                                src={img}
                                alt={`thumb-${index}`}
                                onClick={() => setSelectedImage(img)}
                                whileHover={{ scale: 1.05 }}
                                className={`w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border-2 ${selectedImage === img
                                        ? 'border-indigo-600 ring-2 ring-indigo-300'
                                        : 'border-gray-200'
                                    }`}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500">No images available</p>
                    )}
                </div>

                {/* Middle: Main Image */}
                <div className="flex-1 flex justify-center items-center">
                    {selectedImage ? (
                        <motion.img
                            src={selectedImage}
                            alt="main"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] object-contain rounded-2xl shadow-lg border border-gray-100 bg-[#eeece2]"
                        />
                    ) : (
                        <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
                            <p className="text-gray-500">No image selected</p>
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="flex-1 space-y-5">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        {currentProduct.name || 'Unnamed Product'}
                    </h2>

                    <p className="text-2xl md:text-3xl font-semibold text-green-600">
                        ${currentProduct.price?.toFixed(2) || '0.00'}
                    </p>

                    <div className="flex items-center gap-2">
                        <p className="text-yellow-500 font-medium flex items-center gap-1">
                            <FaStar /> {currentProduct.averageRating || 0}
                        </p>
                        <span className="text-gray-400 text-sm">(Customer Rating)</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {currentProduct.description || 'No description available'}
                    </p>

                    <p className="text-gray-600">
                        <span className="font-semibold">Stock:</span>{' '}
                        {currentProduct.stock > 0 ? (
                            <span className="text-green-600">{currentProduct.stock}</span>
                        ) : (
                            <span className="text-red-500">Out of stock</span>
                        )}
                    </p>

                    <p className="text-gray-600">
                        <span className="font-semibold">Seller:</span>{' '}
                        {currentProduct.seller?.name || 'Unknown'} (
                        {currentProduct.seller?.email || 'N/A'})
                    </p>

                    <p className="text-sm text-gray-400">
                        Added on:{' '}
                        {currentProduct.createdAt
                            ? new Date(currentProduct.createdAt).toDateString()
                            : 'N/A'}
                    </p>

                    {/* Action Button */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="flex w-full gap-4">
                            <div className="flex items-center border rounded-lg shadow-sm">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-indigo-600"
                                >
                                    -
                                </button>
                                <span className="px-4 py-1 text-gray-800 font-semibold">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-indigo-600"
                                >
                                    +
                                </button>
                            </div>

                            <div className="flex-1">
                                <AddToCartButton productId={productId} quantity={quantity} />
                            </div>
                        </div>

                        {/* Buttons: Show/Hide Reviews & Give Review */}
                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => setShowReviews((prev) => !prev)}
                                className="bg-indigo-500 p-2 rounded-2xl w-full text-white hover:bg-indigo-600"
                            >
                                {showReviews ? 'Hide Reviews' : 'Show Reviews'}
                            </button>

                            <button
                                onClick={() => setShowGiveReview((prev) => !prev)}
                                className="bg-blue-500 p-2 rounded-2xl w-full text-white hover:bg-blue-600"
                            >
                                {showGiveReview ? 'Cancel Review' : 'Give Review'}
                            </button>
                        </div>

                        {/* Show Reviews */}
                        {showReviews && currentProduct.reviews?.length > 0 ? (
                            <div className="mt-4 space-y-4 w-full max-h-72 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                                {currentProduct.reviews.map((r) => (
                                    <div key={r._id} className="border-b pb-2">
                                        <p className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <FaUserCircle /> {r.user?.name || 'Anonymous'}
                                            <span className="ml-2 text-yellow-500 flex items-center gap-1">
                                                <FaStar /> {r.rating}
                                            </span>
                                        </p>
                                        <p className="text-gray-600 text-sm">{r.comment}</p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : showReviews ? (
                            <p className="text-gray-500 mt-2">No reviews yet.</p>
                        ) : null}

                        {/* Give Review Form */}
                        {showGiveReview && <GiveReview productId={productId} />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductDetail;
