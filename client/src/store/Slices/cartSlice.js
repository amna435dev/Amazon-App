import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../Api/cartAPI";

// --- Thunks ---

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.addToCart(data);
      return res.data.cart;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add product to cart"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.removeFromCart(productId);
       console.log('CartPage: res.data.cart', res.data.cart);
      return res.data.cart;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove product from cart"
      );
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.updateCartQuantity(productId, quantity);
      
      return res.data.cart;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update cart quantity"
      );
    }
  }
);

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getCart();
      // console.log(" getCart thunk res.data.cart ", res.data.cart);
      return res.data.cart;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// --- Slice ---

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    loading: false,
    addToCartLoading: false,
    removeFromCartLoading: false,
    updateCartQuantityLoading: false,
    fetchCartLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.loading = false;
      state.addToCartLoading = false;
      state.removeFromCartLoading = false;
      state.updateCartQuantityLoading = false;
      state.fetchCartLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.addToCartLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.addToCartLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.addToCartLoading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.removeFromCartLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.removeFromCartLoading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.removeFromCartLoading = false;
        state.error = action.payload;
      })

      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.updateCartQuantityLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.updateCartQuantityLoading = false;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.updateCartQuantityLoading = false;
        state.error = action.payload;
      })

      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.fetchCartLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.fetchCartLoading = false;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.fetchCartLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, reset } = cartSlice.actions;
export default cartSlice.reducer;
