import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/Slices/userSlice";
import productReducer from "../store/Slices/productSlice";
import orderReducer from "../store/Slices/orderSlice"
import cartReducer from "../store/Slices/cartSlice"
export const store = configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
    order: orderReducer,
    cart: cartReducer,
  },
});
