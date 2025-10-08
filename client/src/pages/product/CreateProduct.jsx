import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../store/Slices/productSlice";
import { FaUpload, FaSpinner, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const categories = [
    "Electronics",
    "Clothing",
    "Footwear",

];

const subCategories = {
    Electronics: ["Phones", "Laptops"],
    Clothing: ["TopWear", "BottomWear"],
    Footwear: ["Men", "Women", "Kids"],


};


const CreateProduct = () => {
    const dispatch = useDispatch();
    const { createLoading, error } = useSelector((state) => state.product);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: categories[0],
        subCategory: subCategories[categories[0]][0],
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: value,
    //         ...(name === "category" && { subCategory: subCategories[value][0] }),
    //     }));
    // };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            // Start by copying old state
            let updatedForm = { ...prev, [name]: value };

            // If category is changed, also reset subCategory
            if (name === "category") {
                updatedForm.subCategory = subCategories[value][0];
            }

            return updatedForm;
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
        }));
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "images") {
                value.forEach((image) => data.append("images", image));
            } else {
                data.append(key, value);
            }
        });

        try {
            await dispatch(createProduct(data)).unwrap();

            toast.success("Product created successfully!");

            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                category: categories[0],
                subCategory: subCategories[categories[0]][0],
                images: [],
            });
            setImagePreviews([]);
        } catch (err) {
            console.error("Product creation failed:", err);
            toast.error(err || "Failed to Product creation failed");

        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl pb-16 mx-auto p-6 bg-[#eeece2] rounded-lg shadow-lg my-10"
        >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Create New Product
            </h2>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Product Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        placeholder="Enter product name"
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        placeholder="Enter product description"
                    />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Price ($)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                            placeholder="Enter price"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="stock"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Stock
                        </label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                            placeholder="Enter stock quantity"
                        />
                    </div>
                </div>

                {/* Category and SubCategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="custom-select mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-[#eeece2]"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="subCategory"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Sub-Category
                        </label>
                        <select
                            id="subCategory"
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleInputChange}
                            className="custom-select mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-[#eeece2]"
                        >
                            {subCategories[formData.category].map((subCat) => (
                                <option key={subCat} value={subCat}>
                                    {subCat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>



                {/* Image Upload */}
                <div >
                    <label
                        htmlFor="images"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Product Images
                    </label>
                    <div className="mt-1  flex items-center justify-center px-6 py-2  border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-2  text-center flex flex-col items-center">
                            {/* Upload button + drag text */}
                            <div className="flex flex-col p-2 items-center text-sm text-gray-600">
                                <label
                                    htmlFor="images"
                                    className="relative cursor-pointer  rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 flex flex-col items-center gap-2 px-4 py-2 transition-all duration-200 ease-in-out"
                                >
                                    {/* Icon */}
                                    <FaUpload className="h-12 w-12 text-orange-500" />
                                    <span className="text-base font-semibold">Upload images</span>
                                    <input
                                        id="images"
                                        name="images"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="mt-1 text-sm text-gray-500">or drag and drop</p>
                            </div>

                            {/* Hint text */}
                            <p className="text-xs text-gray-400">PNG, JPG, up to 5MB each</p>
                        </div>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="h-40 w-full object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={createLoading}
                        className={`w-full sm:w-full md:w-full lg:w-auto 
              px-6 py-3 bg-orange-500 text-white rounded-md 
              hover:bg-orange-600 focus:outline-none focus:ring-2 
              focus:ring-orange-500 transition-colors duration-200 
              flex items-center justify-center gap-2 
              ${createLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {createLoading ? (
                            <>
                                <FaSpinner className="animate-spin h-5 w-5" />
                                Creating...
                            </>
                        ) : (
                            "Create Product"
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateProduct;