import React, { useState } from "react";
import { Link, useNavigate, } from "react-router-dom"; // useSearchParams
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/Slices/userSlice";
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Amazon from "../assets/Amazon Logo.png";

function Header({ toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchParams, setSearchParams] = useSearchParams();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      // Success: close user menu and navigate
      setIsUserMenuOpen(false);
      navigate("/login");
    } catch (err) {
      // Handle errors if logout fails
      console.error("Logout error:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return; // don't search empty

    // Navigate to search page with query param
    navigate(`/search?q=${encodeURIComponent(trimmedTerm)}`);

    // Optionally clear the header input
    setSearchTerm("");
  };

  // const handleSearchV1 = (e) => {
  //   e.preventDefault();

  //   const query = searchTerm.trim();
  //   if (!query) return;

  //   // Navigate to Search page first
  //   navigate("/search");

  //   // Update the query param
  //   setSearchParams({ q: query });

  //   // Optional: clear the header input
  //   setSearchTerm("");
  // };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="bg-[#eeece2] text-[#3d3929] fixed top-0 z-50 w-full shadow-md">
      <div className="max-w-7xl px-2 sm:px-4 flex items-center justify-between">
        {/* Menu Icon and Logo (Hidden on small screens) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="p-2 rounded-full hover:bg-slate-600 hover:text-amber-400 transition-all duration-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          >
            <FaBars className="text-xl sm:text-2xl" />
          </button>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <Link to="/">
              <img
                src={Amazon}
                alt="Amazon Logo"
                className="h-18 w-auto object-contain"
              />
            </Link>
          </motion.div>
        </div>

        {/* Search Bar for Larger Screens */}
        <div className="hidden sm:flex flex-1 mx-2 sm:mx-4 max-w-2xl">
          <form
            onSubmit={handleSearch}
            className="flex rounded-md overflow-hidden border border-gray-300 w-full"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 transition-colors duration-200"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Search Bar for Small Screens */}
        <div className="flex sm:hidden flex-1 mx-2">
          <form
            onSubmit={handleSearch}
            className="flex rounded-md overflow-hidden border border-gray-300 w-full"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search Amazon..."
              className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 transition-colors duration-200"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* User Menu  for each screen*/}
        <div className=" sm:block relative">
          {currentUser ? (
            <>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200"
              >
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={`Profile picture of ${currentUser.name}`}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-profile.png")}
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-600" />
                )}
                <span className=" hidden sm:block text-sm">
                  {" "}
                  {currentUser.name}
                </span>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200"
                  >
                    <Link
                      to="/user-account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Account
                    </Link>
                    <Link
                      to="/user-orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Orders
                    </Link>
                    {currentUser.role !== "seller" && (
                      <Link
                        to="/upgrade-seller"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Become a Seller
                      </Link>
                    )}
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="inline mr-2" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-all duration-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
