import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaPlusCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 
        w-64 bg-gray-800 text-white p-6 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64
        sm:w-56 sm:p-4 xs:w-48 xs:p-3
    `}
      >
        <div className="flex justify-between items-center pt-10 mb-6">
          <h2 className="text-xl sm:text-lg xs:text-base font-bold">
            Seller Dashboard
          </h2>

          {/* Close button only visible on small screens */}
          <button
            className="block md:hidden text-white hover:text-gray-300"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={22} />
          </button>
        </div>

        <nav>
          <ul>
            <li className="mb-3">
              <Link
                to="/create-product"
                className="flex items-center gap-2 sm:gap-2 xs:gap-1 p-2 sm:p-2 xs:p-1 rounded hover:bg-gray-700 text-sm sm:text-sm xs:text-xs"
              >
                <FaPlusCircle size={16} /> Create Product
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/seller-products"
                className="flex items-center gap-2 sm:gap-2 xs:gap-1 p-2 sm:p-2 xs:p-1 rounded hover:bg-gray-700 text-sm sm:text-sm xs:text-xs"
              >
                <FaBoxOpen size={16} /> Manage Products
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/seller-orders"
                className="flex items-center gap-2 sm:gap-2 xs:gap-1 p-2 sm:p-2 xs:p-1 rounded hover:bg-gray-700 text-sm sm:text-sm xs:text-xs"
              >
                <FaClipboardList size={16} /> Manage Orders
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1  p-8 md:ml-64">
        {/* Menu button for mobile */}
        <button
          className="md:hidden mb-4 text-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <FaBars size={24} />
        </button>

        <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">
          Use the sidebar to create a new product, manage your existing
          products, or view and update your orders.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
