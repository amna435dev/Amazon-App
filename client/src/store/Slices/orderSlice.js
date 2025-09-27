import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../Api/orderAPI";

// --- Thunks ---

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.placeOrder(data);
      console.log("place order log", res.data.order);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Order placement failed"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await api.cancelOrder(orderId);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Order cancellation failed"
      );
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "order/getUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getUserOrders();
      return res.data.orders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const getOrdersByBuyerId = createAsyncThunk(
  "order/getOrdersByBuyerId",
  async (buyerId, { rejectWithValue }) => {
    try {
      const res = await api.getOrdersByBuyerId(buyerId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const getOrdersBySellerId = createAsyncThunk(
  "order/getOrdersBySellerId",
  async (sellerId, { rejectWithValue }) => {
    try {
      const res = await api.getOrdersBySellerId(sellerId);
        
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      console.log("updateOrderStatus thunk res.data.order", res.data.order);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

// --- Slice ---

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    placeOrderLoading: false,
    cancelOrderLoading: false,
    fetchOrdersLoading: false,
    updateStatusLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.loading = false;
      state.placeOrderLoading = false;
      state.cancelOrderLoading = false;
      state.fetchOrdersLoading = false;
      state.updateStatusLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.placeOrderLoading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
       
        state.currentOrder = action.payload;
       
        state.placeOrderLoading = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeOrderLoading = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.cancelOrderLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder };
        }
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = { ...state.currentOrder, ...updatedOrder };
        }
        state.cancelOrderLoading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelOrderLoading = false;
        state.error = action.payload;
      })

      // Get User Orders
      .addCase(getUserOrders.pending, (state) => {
        state.fetchOrdersLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.fetchOrdersLoading = false;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.fetchOrdersLoading = false;
        state.error = action.payload;
      })

      // Get Orders by Buyer ID
      .addCase(getOrdersByBuyerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByBuyerId.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(getOrdersByBuyerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Orders by Seller ID
      .addCase(getOrdersBySellerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersBySellerId.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(getOrdersBySellerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatusLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(
          (order) => order._id === updatedOrder.id
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder };
        }
        if (state.currentOrder?._id === updatedOrder.id) {
          state.currentOrder = { ...state.currentOrder, ...updatedOrder };
        }
        state.updateStatusLoading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatusLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, reset } = orderSlice.actions;
export default orderSlice.reducer;
