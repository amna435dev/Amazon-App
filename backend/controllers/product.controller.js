import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";
import mongoose from "mongoose";

// Create Product Controller
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      subCategory,
     
    } = req.body;
    const sellerId = req.user.id;

    // Check if user is a seller
    const user = await User.findById(sellerId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create products",
      });
    }

    // Handle profile image upload
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, { folder: "product_images" })
      );
      const results = await Promise.all(uploadPromises);
      images = results.map((result) => result.secure_url);
    }
    // Create new product
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      subCategory,
      images,
      seller: sellerId,
    });

    await product.save();

    // Add product to seller's listedProducts
    user.listedProducts.push(product._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        subCategory: product.subCategory,
        images: product.images,
        seller: product.seller,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during product creation",
    });
  }
};

// Get All Products Controller
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      inStock,
      minRating,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // 🔍 Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    //  Filter by category & subCategory
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    //  Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    //  Stock availability
    if (inStock === "true") query.stock = { $gt: 0 };

    //  Minimum rating filter
    if (minRating) query.averageRating = { $gte: Number(minRating) };

    //  Sorting (default: newest first)
    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      const orderBy = order === "asc" ? 1 : -1;
      sortOptions = { [sortBy]: orderBy };
    }

    //  Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("seller", "name email averageRating");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching products",
      });
  }
};

// Get Product by ID Controller
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email averageRating") // seller details
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name email" }, // reviewer details
      });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching product" });
  }
};

// Give Review Controller
export const giveReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create new review
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    // Add review to product
    product.reviews.push(review._id);

    // Update average rating
    const reviews = await Review.find({ product: productId });
    
    const avgRating =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    product.averageRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: {
        id: review._id,
        product: review.product,
        user: review.user,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Give review error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding review",
    });
  }
};

// Update Product Controller
export const updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check ownership
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Handle image update (if provided)
    let images = product.images;
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, { folder: "product_images" })
      );
      const results = await Promise.all(uploadPromises);
      images = results.map((result) => result.secure_url);
    }

    // Update fields
    product = await Product.findByIdAndUpdate(
      id,
      { ...req.body, images },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.seller.toString() !== sellerId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    //  Delete product images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imgUrl) =>
        deleteFromCloudinary(imgUrl, "image")
      );
      await Promise.all(deletePromises);
    }

    //  Delete the product from MongoDB
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product and related images deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductsBySellerId = async (req, res) => {
  try {
    const sellerId = req.params.sellerId; 

    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    // Find all products by sellerId
    const products = await Product.find({ seller: sellerId })
      .populate("seller", "name email") 
      .populate("reviews"); 

    // Check if products exist
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }

    // Return products
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};