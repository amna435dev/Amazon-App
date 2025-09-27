// src/components/ElectronicList.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../store/Slices/productSlice"
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaUser } from "react-icons/fa";

const ClothList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading, error } = useSelector((state) => state.product);

    useEffect(() => {
       
        dispatch(getAllProducts({ category: "Clothing", limit: 12 }));
    }, [dispatch]);

    if (loading) return <p className="text-center py-6">Loading...</p>;
    if (error) return <p className="text-center text-red-500 py-6">{error}</p>;

    return (
        <section className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold mb-6">Clothing</h2>

            {products.length === 0 ? (
                <p>No Clothes found.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <motion.div
                            key={p._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-[#eeece2] rounded-2xl shadow-sm hover:shadow-xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative group cursor-pointer h-64">
                                {p.images && p.images.length > 0 ? (
                                    <img
                                        src={p.images[0]}
                                        alt={p.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#eeece2] text-gray-400 text-sm">
                                        No image available
                                    </div>
                                )}

                                {/* Price */}
                                <div className="absolute top-3 right-3 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                                    ${p.price.toFixed(2)}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {p.name}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center mb-2">
                                    {Array.from({ length: 5 }).map((_, i) =>
                                        i < Math.round(p.averageRating || 0) ? (
                                            <FaStar key={i} className="text-yellow-400 h-4 w-4" />
                                        ) : (
                                            <FaRegStar key={i} className="text-gray-300 h-4 w-4" />
                                        )
                                    )}
                                    <span className="ml-2 text-xs text-gray-500">
                                        {p.averageRating ? p.averageRating.toFixed(1) : "No ratings"}
                                    </span>
                                </div>

                                {/* Seller */}
                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <FaUser className="h-4 w-4 text-gray-400 mr-1" />
                                    {p.seller?.name || "Unknown Seller"}
                                </div>

                                {/* CTA */}
                                <Link
                                    to={`/product/${p._id}`}
                                    className="mt-auto block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200 text-sm font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ClothList;
