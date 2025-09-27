import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { giveReview, clearError } from "../../store/Slices/productSlice";

const GiveReview = ({ productId }) => {
    const dispatch = useDispatch();
    const { reviewLoading, error } = useSelector((state) => state.product);
    const [formData, setFormData] = useState({
        rating: "",
        comment: "",
    });
    const [successMessage, setSuccessMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rating) {
            alert("Please select a rating");
            return;
        }

        try {
            await dispatch(
                giveReview({ productId, data: { rating: Number(formData.rating), comment: formData.comment } })
            ).unwrap();
            setSuccessMessage("Review submitted successfully!");
            setFormData({ rating: "", comment: "" }); // Reset form
            setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3s
        } catch (err) {
            console.error("Review submission failed:", err);
        }
    };

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    return (
        <div className="bg-[#eeece2] w-full  shadow-lg rounded-lg p-6 border border-gray-200 max-w-lg mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Write a Review</h2>
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
                    {successMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                    </label>
                    <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md bg-[#eeece2] text-gray-800 focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a rating</option>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                                {num} Star{num > 1 ? "s" : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment
                    </label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md bg-[#eeece2] text-gray-800 focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Write your review here..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={reviewLoading}
                    className={`w-full p-2 rounded-md text-white ${reviewLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </div>
    );
};

export default GiveReview;