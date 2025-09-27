import React, { useState } from "react";
import { FiFilter } from "react-icons/fi"; // Filter icon

const categories = ["Electronics", "Clothing", "Footwear"];
const subCategories = {
    Electronics: ["Phones", "Laptops"],
    Clothing: ["TopWear", "BottomWear"],
    Footwear: ["Men", "Women", "Kids"],
};

const SearchInput = ({ onSearch, initialSearch = "" }) => {
    const [formData, setFormData] = useState({
        search: initialSearch,
        category: "",
        subCategory: "",
        minPrice: "",
        maxPrice: "",
        inStock: false,
        minRating: "",
        sortBy: "",
        order: "desc",
    });

    const [showFilters, setShowFilters] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== "" && value !== false)
        );
        onSearch(params);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Search bar + Filter button */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        name="search"
                        value={formData.search}
                        onChange={handleInputChange}
                        placeholder="Search products..."
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <FiFilter size={20} />
                    </button>
                    <button
                        type="submit"
                        className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Search
                    </button>
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory */}
                        {formData.category && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory
                                </label>
                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Subcategories</option>
                                    {subCategories[formData.category]?.map((sub) => (
                                        <option key={sub} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Price */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Min Price
                                </label>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={formData.minPrice}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Price
                                </label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={formData.maxPrice}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="1000"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Rating
                            </label>
                            <select
                                name="minRating"
                                value={formData.minRating}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Any Rating</option>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Star{num > 1 ? "s" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort By
                                </label>
                                <select
                                    name="sortBy"
                                    value={formData.sortBy}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Default</option>
                                    <option value="price">Price</option>
                                    <option value="averageRating">Rating</option>
                                    <option value="createdAt">Date Added</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order
                                </label>
                                <select
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>

                        {/* In Stock */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="inStock"
                                checked={formData.inStock}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-gray-700 font-medium">In Stock Only</label>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchInput;
