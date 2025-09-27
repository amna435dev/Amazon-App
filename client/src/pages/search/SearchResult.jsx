import React from "react";
import { Link } from "react-router-dom";

const SearchResult = ({ products, currentPage, pages, onPageChange }) => {
    return (
        <div className="mt-8 max-w-6xl mx-auto">
            {products.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium">
                    No products found.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                to={`/product/${product._id}`}
                                key={product._id}
                                className="bg-white shadow-lg rounded-xl p-4 border border-gray-100 hover:shadow-2xl transition-transform transform hover:-translate-y-1 hover:scale-105"
                            >
                                <img
                                    src={product.images?.[0] || "https://via.placeholder.com/150"}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {product.name}
                                </h3>
                                <p className="text-green-600 font-bold mt-1">${product.price}</p>
                                <p className="text-gray-600 text-sm">
                                    Rating: {product.averageRating || "No reviews"}
                                </p>
                                <p
                                    className={`text-sm font-medium mt-1 ${product.stock > 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center items-center space-x-4">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-5 py-2 rounded-lg text-white font-semibold transition ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 font-medium">
                            Page {currentPage} of {pages}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className={`px-5 py-2 rounded-lg text-white font-semibold transition ${currentPage === pages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchResult;
