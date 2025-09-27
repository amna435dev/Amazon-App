import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./AppAuthLayout";
import MainLayout from "./AppMainLayout";

import Login from "../pages/register/Login";
import Signup from "../pages/register/Signup";
import Home from "../pages/home/Home";
import UpgradeSeller from "../pages/register/UpgradeSeller";
import CreateProduct from "../pages/product/CreateProduct";
import ProductList from "../pages/product/ProductList";
import ProductDetail from "../pages/product/ProductDetail";

import UpdateUser from "../pages/user/UpdateUser";
import Account from "../pages/user/Account";
import UserOrders from "../pages/order/UserOrders";
import CartPage from "../pages/cart/CartPage";
import CheckOut from "../pages/order/CheckOut";
import Dashboard from "../pages/seller/Dashboard";
import SellerProducts from "../pages/seller/SellerProducts";
import SellerOrders from "../pages/seller/SellerOrders";
import SearchProduct from "../pages/search/SearchProduct"
import FootwearList from "../pages/home/FootwearList";
import ElectronicList from "../pages/home/ElectronicList";
import ClothList from "../pages/home/ClothList";






export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

      

        <Route path="/upgrade-seller" element={<UpgradeSeller />} />
      </Route>

      {/* MAIN APP ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/Footwear-list" element={<FootwearList />} />
        <Route path="/Electronic-list" element={<ElectronicList />} />
        <Route path="/Cloth-list" element={<ClothList />} />

        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/product/:productId" element={<ProductDetail />} />

        <Route path="/update-profile/:id" element={<UpdateUser />} />
        <Route path="/user-account" element={<Account />} />
        <Route path="/user-orders" element={<UserOrders />} />
        <Route path="/user-cart" element={<CartPage />} />
        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller-products" element={<SellerProducts />} />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/search" element={<SearchProduct />} />


      </Route>
    </Routes>
  );
}
