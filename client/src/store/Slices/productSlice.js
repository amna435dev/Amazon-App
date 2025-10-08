import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../Api/productAPI";

// --- Thunks ---

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.createProduct(formData);
      console.log("getAllProducts",  res.data.product)
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Product creation failed"
      );
    }
  }
);


export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.getAllProducts(params);
      console.log("getAllProducts",  res.data.products)
      return {
        products: res.data.products,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);
export const getProductById = createAsyncThunk(
  "product/getProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.getProductById(productId);
      console.log(" getProductById  thunk res.data.product ", res.data.product);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const giveReview = createAsyncThunk(
  "product/giveReview",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const res = await api.giveReview(productId, data);
      //  console.log(" giveReview thunk res.data.review ", res.data.review);
      return res.data.review;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add review"
      );
    }
  }
);

export const getProductsBySellerId = createAsyncThunk(
  "product/getProductsBySellerId",
  async (sellerId, { rejectWithValue }) => {
    try {
      const res = await api.getProductsBySellerId(sellerId);
      return {
        sellerProducts: res.data.data,
        count: res.data.count,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch seller products"
      );
    }
  }
);

export const updateSellerProduct = createAsyncThunk(
  "product/updateSellerProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.updateSellerProduct(id, formData);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteSellerProduct = createAsyncThunk(
  "product/deleteSellerProduct",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.deleteSellerProduct(id);
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

// --- Slice ---

const productSlice = createSlice({
  name: "products",
  initialState: {
    total: 0,
    page: 1,
    pages: 1,
    products: [],
    currentProduct: null,
    sellerProducts: [],
    loading: false,
    createLoading: false,
    fetchProductLoading: false,
    reviewLoading: false,
    sellerProductsLoading: false,
    updateLoading: false,
    deleteLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.fetchProductLoading = false;
      state.reviewLoading = false;
      state.sellerProductsLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.sellerProducts.push(action.payload);
        state.createLoading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.loading = false;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Product by ID
      .addCase(getProductById.pending, (state) => {
        state.fetchProductLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.fetchProductLoading = false;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.fetchProductLoading = false;
        state.error = action.payload;
      })

      // Give Review
      .addCase(giveReview.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(giveReview.fulfilled, (state, action) => {
        if (
          state.currentProduct &&
          state.currentProduct._id === action.payload.product
        ) {
          state.currentProduct.reviews.push(action.payload);
          if (action.payload.averageRating) {
            state.currentProduct.averageRating = action.payload.averageRating;
          }
        }
        state.reviewLoading = false;
      })
      .addCase(giveReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
      })

      // Get Products by Seller ID
      .addCase(getProductsBySellerId.pending, (state) => {
        state.sellerProductsLoading = true;
        state.error = null;
      })
      .addCase(getProductsBySellerId.fulfilled, (state, action) => {
        state.sellerProducts = action.payload.sellerProducts;
        state.sellerProductsLoading = false;
      })
      .addCase(getProductsBySellerId.rejected, (state, action) => {
        state.sellerProductsLoading = false;
        state.error = action.payload;
      })

      // Update Seller Product
      .addCase(updateSellerProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSellerProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        state.sellerProducts = state.sellerProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        if (
          state.currentProduct &&
          state.currentProduct._id === updatedProduct._id
        ) {
          state.currentProduct = updatedProduct;
        }
        state.updateLoading = false;
      })
      .addCase(updateSellerProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete Seller Product
      .addCase(deleteSellerProduct.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteSellerProduct.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.products = state.products.filter((product) => product._id !== id);
        state.sellerProducts = state.sellerProducts.filter(
          (product) => product._id !== id
        );
        if (state.currentProduct && state.currentProduct._id === id) {
          state.currentProduct = null;
        }
        state.deleteLoading = false;
      })
      .addCase(deleteSellerProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, reset } = productSlice.actions;
export default productSlice.reducer;


