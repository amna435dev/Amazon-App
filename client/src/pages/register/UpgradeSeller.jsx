import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { upgradeSeller } from "../../store/Slices/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";

const UpgradeSeller = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);


  const handleUpgrade = async () => {
    if (currentUser?.role === "seller") {
      toast.info("You are already a seller!");
      return;
    }

    try {
      await dispatch(upgradeSeller()).unwrap();
      
      toast.success("Successfully upgraded to seller!");
      navigate("/");
    } catch (err) {

      toast.error(err || "Failed to upgrade to seller");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
      >
        <h2 className="text-xl sm:text-3xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
          <FaUserShield /> Become a Seller
        </h2>
        {error && (
          <p className="text-red-400 text-center mb-4 font-medium">{error}</p>
        )}
        <div className="text-center text-white/80 mb-6">
          <p>Upgrade your account to start selling products on our platform!</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUpgrade}
          disabled={loading || currentUser?.role === "seller"}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Upgrading...
            </span>
          ) : (
            "Upgrade to Seller"
          )}

        </motion.button>
      </motion.div>
    </div>
  );
};

export default UpgradeSeller;
