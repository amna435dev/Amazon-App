import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateSellerProduct,
    deleteSellerProduct,
} from "../../store/Slices/productSlice";

const SellerProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { updateLoading, deleteLoading } = useSelector(
        (state) => state.product
    );

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        subCategory: product.subCategory,
    });
    const [images, setImages] = useState([]);
    const [stockStatus, setStockStatus] = useState(product.stock > 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updateFormData = new FormData();

        Object.entries(formData).forEach(([key, value]) =>
            updateFormData.append(key, value)
        );

        images.forEach((image) => updateFormData.append("images", image));

        try {
            await dispatch(
                updateSellerProduct({ id: product._id, formData: updateFormData })
            ).unwrap();
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await dispatch(deleteSellerProduct(product._id)).unwrap();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleToggleStock = async () => {
        const newStockStatus = !stockStatus;
        const updateFormData = new FormData();
        updateFormData.append("stock", newStockStatus ? 1 : 0);

        try {
            await dispatch(
                updateSellerProduct({ id: product._id, formData: updateFormData })
            ).unwrap();
            setStockStatus(newStockStatus);
        } catch (err) {
            console.error("Stock update failed:", err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100 overflow-hidden">
            {isEditing ? (
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Stock
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Category & SubCategory */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                SubCategory
                            </label>
                            <input
                                type="text"
                                name="subCategory"
                                value={formData.subCategory}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Images
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-1 w-full text-gray-700"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={updateLoading}
                            className="bg-blue-600 flex-1 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
                        >
                            {updateLoading ? "Updating..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div>
                    {/* Image */}
                    <div className="relative group">
                        <img
                            src={product.images[0] || "https://via.placeholder.com/300"}
                            alt={product.name}
                            className="w-full h-56 object-cover rounded-t-xl transform group-hover:scale-105 transition duration-300"
                        />
                        <span
                            className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full ${stockStatus
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {stockStatus ? `In Stock (${product.stock})` : "Out of Stock"}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {product.description}
                        </p>
                        <p className="mt-3 text-xl font-bold text-blue-600">
                            ${product.price}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {product.category} / {product.subCategory}
                        </p>

                            {/* Buttons */}
                            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                {/* Edit + Mark In/Out grouped */}
                                <div className="flex flex-row  gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-yellow-500 flex-1 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleToggleStock}
                                        disabled={updateLoading}
                                        className={`px-4 py-2  rounded-lg font-semibold text-white ${stockStatus
                                                ? "bg-red-500 hover:bg-red-600"
                                                : "bg-green-500 hover:bg-green-600"
                                            }`}
                                    >
                                        {updateLoading
                                            ? "Updating..."
                                            : stockStatus
                                                ? "Mark Out"
                                                : "Mark In"}
                                    </button>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold w-full sm:w-auto"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProductCard;
