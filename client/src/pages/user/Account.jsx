import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { deleteUser } from "../../store/Slices/userSlice";
import {
    FaUserCircle,
    FaEnvelope,
    FaTransgender,
    FaTrash,
    FaEdit,
    FaPlusCircle,
    FaChartPie,
    FaRocket
} from "react-icons/fa";

const Account = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser, error } = useSelector((state) => state.user);

    const handleDeleteAccount = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            return;
        }
        try {
            await dispatch(deleteUser()).unwrap();
            toast.success("Account deleted successfully!");
            navigate("/login");
        } catch (err) {
            toast.error(err || "Failed to delete account");
        }
    };

    const handleUpdateProfile = () => {
        navigate(`/update-profile/${currentUser.id}`);
    };

    const handleCreateProduct = () => {
        navigate("/create-product");
    };

    const handleDashboard = () => {
        navigate("/dashboard");
    };

    const handleUpgradeSeller = () => {
        navigate("/upgrade-seller");
    };

    if (!currentUser) {
        return (
            <div className="text-center py-12 text-lg font-medium text-gray-600">
                No user data available. Please log in.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex items-center justify-center bg-[#eeece2] py-8 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl w-full space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 py-12 p-10 rounded-2xl shadow-2xl">
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-4">
                    {currentUser.profileImage ? (
                        <img
                            src={currentUser.profileImage}
                            alt="Profile"
                            className="h-28 w-28 rounded-full object-cover shadow-md"
                        />
                    ) : (
                        <FaUserCircle className="h-28 w-28 text-gray-400" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                        {currentUser.name || "Unnamed User"}
                    </h2>
                    <p className="text-gray-500 text-sm">Manage your e-commerce profile</p>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <FaEnvelope className="text-blue-600 text-xl" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-800">
                                {currentUser.email || "Not set"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <FaTransgender className="text-pink-500 text-xl" />
                        <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="text-sm font-medium text-gray-800">
                                {currentUser.gender || "Not set"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <FaUserCircle className="text-green-600 text-xl" />
                        <div>
                            <p className="text-xs text-gray-500">Account ID</p>
                            <p className="text-sm font-medium text-gray-800">
                                {currentUser.id || "Not available"}
                            </p>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <button
                        onClick={handleUpdateProfile}
                        className="flex items-center gap-3 p-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition"
                    >
                        <FaEdit /> Update Profile
                    </button>

                    {currentUser.role === "seller" ? (
                        <>
                            <button
                                onClick={handleCreateProduct}
                                className="flex items-center gap-3 p-4 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
                            >
                                <FaPlusCircle /> Create Product
                            </button>

                            <button
                                onClick={handleDashboard}
                                className="flex items-center gap-3 p-4 rounded-xl bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 transition"
                            >
                                <FaChartPie /> Dashboard
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleUpgradeSeller}
                            className="flex items-center gap-3 p-4 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
                        >
                            <FaRocket /> Become Creator
                        </button>
                    )}

                    <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-3 p-4 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition"
                    >
                        <FaTrash /> Delete Account
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Account;
