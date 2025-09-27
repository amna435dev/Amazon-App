import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaHome,  FaShoppingCart, FaBox} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { motion } from "framer-motion";

const navItems = () => [
  { to: "/", icon: FaHome, text: "Home" },
  { to: "/product-list", icon: AiFillProduct, text: "Product" },
  { to: "/user-orders", icon: FaBox, text: "Your Orders" },
  { to: "/user-cart", icon: FaShoppingCart, text: "Cart" },
  
];

function NavigatorBar({ isSidebarOpen }) {

  const { cart } = useSelector((state) => state.cart);


  return (
    <>
      {/* Sidebar for Desktop */}
      <div
        className={`hidden  h-[calc(100vh-4rem)]  lg:block fixed top-16 left-0 bg-[#e9e7e0] text-gray-900 border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${isSidebarOpen ? "w-64" : "w-20"
          }`}

      >
        <div className="p-4 flex flex-col h-full">
          <nav className="mt-4 flex-1 flex flex-col space-y-2">
            {navItems().map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 hover:text-orange-500 transition-all duration-300 group relative focus:ring-2 focus:ring-orange-500 focus:outline-none ${isActive ? "bg-gray-100 text-orange-500" : ""
                  } ${isSidebarOpen ? "justify-start" : "justify-center"}`
                }

              >
                <div className="relative">
                  <item.icon className="text-lg lg:text-xl" />
                  {item.text === "Cart" &&
                    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    )}
                  {!isSidebarOpen && (
                    <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.text}
                    </span>
                  )}
                </div>

                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm"
                  >
                    {item.text}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Navbar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white text-gray-900 z-50 shadow-lg border-t border-gray-200">
        <nav className="flex justify-around items-center p-2">
          {navItems().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 hover:text-orange-500 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:outline-none ${isActive ? "bg-gray-100 text-orange-500" : ""
                }`
              }

            >
              <div className="relative">
                <item.icon className="text-base sm:text-lg" />
                {item.text === "Cart" &&
                  cart?.items?.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
              </div>
              <span className="text-xs">{item.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default NavigatorBar;
