import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ToastContainer } from "react-toastify";
import { fetchCurrentUser } from "../store/Slices/userSlice";
import { getCart } from "../store/Slices/cartSlice";

export default function App() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // once currentUser is set → fetch cart
  useEffect(() => {
    if (currentUser) {
      dispatch(getCart());
    }
  }, [currentUser, dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}
