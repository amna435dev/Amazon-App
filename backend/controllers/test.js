import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";

export const signup = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { name, email, password, gender } = req.body;

    // ===================== V – Validate Data =====================
    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ===================== A – Action (Transform Data) =====================
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: "profile_images",
      });
      profileImage = result.secure_url;
    }

    // ===================== P – Perform Main Action (Create User) =====================
    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      profileImage,
    });
    await user.save();

    // ===================== U – Update Related Data / Generate Token =====================
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ===================== R – Send Response =====================
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};


export const login = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { email, password } = req.body;

    // ===================== V – Validate Data =====================
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        succes: false,
        message: "Invalid email or password",
      });
    }

    // ===================== A – Perform Action =====================
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ===================== U – Update Related Data =====================
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ===================== R – Send Response =====================
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};


export const logout = (req, res) => {
  try {
    // ===================== A – Perform Action / Update Related Data =====================
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // ===================== R – Send Response =====================
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};


export const isLoggedIn = (req, res, next) => {
  try {
    // ===================== I – Input =====================
    const token = req.cookies?.token;

    // ===================== V – Validate Data =====================
    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication failed: Token not provided. Please login to access this resource.",
      });
    }

    // ===================== C – Check Permissions/Conditions =====================
    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // ===================== P – Perform Action =====================
      req.user = userPayload;
      next(); // continue to next middleware/controller
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Auth middleware error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const upgradeSeller = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId = req.user.id;

    // ===================== V – Validate Data =====================
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "User is already a seller",
      });
    }

    // ===================== P – Perform Action =====================
    user.role = "seller";
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ===================== U – Update Related Data =====================
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ===================== R – Send Response =====================
    res.status(200).json({
      success: true,
      message: "User upgraded to seller successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Upgrade seller error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during role upgrade",
    });
  }
};


export const getAuthUser = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId = req.user.id;

    // ===================== P – Perform Action =====================
    const user = await User.findById(userId)
      .select("-password")
      .populate("listedProducts")
      .populate("orders")
      .populate({
        path: "cart",
        populate: { path: "items.product" },
      });

    // ===================== V – Validate Data =====================
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ===================== R – Send Response =====================
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImage: user.profileImage,
        listedProducts: user.listedProducts,
        orders: user.orders,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Get auth user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    // ===================== 1. GET INPUT =====================
    const userIdFromToken = req.user.id;
    const { id } = req.params;
    const { name, email, password, gender } = req.body;
    const { profileImage } = req.files || {};

    // ===================== 2. VALIDATE INPUT =====================
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (id !== userIdFromToken) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // Email validation
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    // Password validation
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // ===================== 3. BUILD UPDATED DATA OBJECT =====================
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (gender) updatedData.gender = gender;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    // ===================== 4. HANDLE PROFILE IMAGE =====================
    if (profileImage) {
      // Upload new image
      const uploadedImage = await cloudinary.uploader.upload(
        profileImage[0].path,
        {
          folder: "user_profiles",
        }
      );

      // Delete old image if exists
      if (user.profileImage?.public_id) {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }

      updatedData.profileImage = {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      };
    }

    // ===================== GUARD: NO CHANGES PROVIDED =====================
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // ===================== 5. PERFORM DATABASE UPDATE =====================
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");

    // ===================== 6. SEND RESPONSE =====================
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // ===================== ERROR HANDLING =====================
    console.error("Update user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};
  


// new approach of updating user info

export const updateUser1 = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId = req.user.userId;
    const { id } = req.params;
    const { profileImage } = req.files || {};
    const updates = req.body;

    // ===================== V – Validate Data =====================
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own account.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allowedFields = ["name", "email", "password", "gender"];
    const updatedData = {};

    for (const field of allowedFields) {
      if (updates[field]) {
        let value = updates[field].trim?.() || updates[field];

        // Email validations
        if (field === "email" && value !== user.email) {
          const existingEmail = await User.findOne({ email: value });
          if (existingEmail) {
            return res.status(400).json({
              success: false,
              message: "Email already registered",
            });
          }
          const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (!emailRegex.test(value)) {
            return res.status(400).json({
              success: false,
              message: "Please enter a valid email",
            });
          }
        }

        // Password validations
        if (field === "password") {
          if (value.length < 6) {
            return res.status(400).json({
              success: false,
              message: "Password must be at least 6 characters",
            });
          }
          const salt = await bcrypt.genSalt(10);
          value = await bcrypt.hash(value, salt);
        }

        updatedData[field] = value;
      }
    }

    // Profile image handling
    if (profileImage) {
      if (user.profileImage) {
        await deleteFromCloudinary(user.profileImage, "image");
      }
      const result = await uploadToCloudinary(profileImage[0].path, {
        folder: "profile_images",
      });
      updatedData.profileImage = result.secure_url;
    }

    // Check if any valid updates provided
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    // ===================== P – Perform Action =====================
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");

    // ===================== R – Send Response =====================
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Update user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId  = req.user.id; // logged-in user
    const { id } = req.params; // user to delete

    // ===================== V – Validate / Check Resources =====================
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ===================== P – Permissions =====================
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own account.",
      });
    }

    // ===================== A – Action =====================
    // Delete profile image if exists
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage, "image");
    }

    // ===================== R – Related Updates =====================
    // Find all products by this seller
    const userProducts = await Product.find({ seller: id });

    // Delete all product images from Cloudinary
    const deletions = [];
    for (const product of userProducts) {
      if (product.images?.length) {
        for (const img of product.images) {
          deletions.push(deleteFromCloudinary(img, "image"));
        }
      }
    }
    await Promise.all(deletions);

    // Delete all products by this seller from DB
    await Product.deleteMany({ seller: id });

    // Finally, delete the user
    await User.findByIdAndDelete(id);

    // ===================== R – Response =====================
    // Clear JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    // ===================== R – Response / Error Handling =====================
    console.log("Delete user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const createProduct = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { name, description, price, stock, category, subCategory } = req.body;
    const sellerId = req.user?.id; // logged-in user ID

    // ===================== V – Validate / Check Resources =====================
    const user = await User.findById(sellerId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create products",
      });
    }

    // ===================== A – Action =====================
    // Handle image upload if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, { folder: "product_images" })
      );
      const results = await Promise.all(uploadPromises);
      images = results.map((result) => result.secure_url);
    }

    // Create product document
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

    // ===================== R – Related Updates =====================
    // Add product reference to seller's listedProducts
    user.listedProducts.push(product._id);
    await user.save();

    // ===================== R – Response =====================
    res.status(200).json({
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
    // ===================== R – Response / Error Handling =====================
    console.error("Create product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during product creation",
    });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    // ===================== I – Input =====================
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
    } = req.body;

    // ===================== V – Validate / Prepare Query =====================
    let query = {};

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    // Filter by category & subCategory
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock availability
    if (inStock === "true") query.stock = { $gt: 0 };

    // Minimum rating
    if (minRating) query.averageRating = { $gte: Number(minRating) };

    // Sorting
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sortBy) {
      const orderBy = order === "asc" ? 1 : -1;
      sortOptions = { [sortBy]: orderBy };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // ===================== A – Action / Fetch =====================
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("seller", "name email averageRating");

    const total = await Product.countDocuments(query);

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error while fetching products",
    });
  }
};


export const getProductById = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { id } = req.params; // Get product ID from request URL

    // ===================== V – Validate / Check Resource =====================
    const product = await Product.findById(id)
      .populate("seller", "name averageRating") // populate seller info
      .populate({
        path: "reviews", // populate reviews
        populate: { path: "user", select: "name" }, // populate review user info
      });

    if (!product) {
      // Resource does not exist
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    // ===================== A – Action =====================
    // Here the main action is just fetching the product along with seller & review details

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during fetching product",
    });
  }
};


export const giveReview = async (req, res) => {
  try {
    // ===================== I – Input =====================
// inputs from client
    const userId = req.user.id; // logged-in user
    const { rating, comment } = req.body;
    const { productId } = req.params;
    // ===================== V – Validate / Check Resource =====================
    const product = await Product.findById(productId); // check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ===================== C – Check Rules / Permissions =====================
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      // rule: one review per user per product
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // ===================== A – Action / Core Logic =====================
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });
    await review.save(); // save review

    // ===================== R – Update Related Data =====================
    product.reviews.push(review._id); // add review to product
    const reviews = await Review.find({ product: productId });

    const aveRating =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    product.averageRating = Math.round(aveRating * 10) / 10; // update product average
    await product.save();

    // ===================== R – Response =====================
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
    // ===================== R – Error Handling =====================
    console.error("Error during giving review", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during adding review",
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const sellerId = req.user.id; // logged-in user
    const { id } = req.params; // product ID from URL
    const updates = req.body; // fields to update
    const files = req.files; // new images, if any

    // ===================== V – Validate / Check Resource =====================
    let product = await Product.findById(id); // check if product exists
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    // ===================== C – Check Rules / Permissions =====================
    if (product.seller.toString() !== sellerId) {
      // only seller who owns the product can update it
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ===================== A – Action / Core Logic =====================
    let images = product.images; // keep old images by default
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        uploadToCloudinary(file.path, { folder: "product_images" })
      );
      const results = await Promise.all(uploadPromises);
      images = results.map((result) => result.secure_url); // new images
    }

    product = await Product.findByIdAndUpdate(
      id,
      { ...updates, images },
      { new: true }
    );

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during update products", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during update product",
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const sellerId = req.user.id; // logged-in user
    const { id } = req.params; // product ID from URL

    // ===================== V – Validate / Check Resource =====================
    const product = await Product.findById(id); // check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ===================== C – Check Rules / Permissions =====================
    if (product.seller.toString() !== sellerId) {
      // only seller who owns the product can delete
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ===================== A – Action / Core Logic =====================
    // Delete product images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imgUrl) =>
        deleteFromCloudinary(imgUrl, "image")
      );
      await Promise.all(deletePromises);
    }

    // Delete the product from DB
    await product.deleteOne();

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during product deletion", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during product deletion",
    });
  }
};


export const placeOrder = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { products, shippingAdress } = req.body; // order info
    const buyerId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const buyer = await User.findById(buyerId); // check user exists & is a buyer
    if (!buyer || buyer.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can place orders",
      });
    }

    // Validate shipping address
    if (
      !shippingAdress ||
      !shippingAdress.fullName ||
      !shippingAdress.street ||
      !shippingAdress.city ||
      !shippingAdress.state ||
      !shippingAdress.postalCode ||
      !shippingAdress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is incomplete",
      });
    }

    let totalPrice = 0;
    const validatedProducts = [];

    // ===================== C – Check Rules / Permissions / Product Availability =====================
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${product.name}. Available stock: ${product.stock}`,
        });
      }

      totalPrice += product.price * item.quantity;

      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // ===================== A – Action / Core Logic =====================
    // Deduct stock
    for (const item of validatedProducts) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      buyer: buyerId,
      products: validatedProducts,
      totalPrice,
      shippingAdress,
    });
    await order.save();

    // Update buyer's order list
    buyer.orders.push(order._id);
    await buyer.save();

    // ===================== R – Response =====================
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        buyer: order.buyer,
        products: order.products,
        totalPrice: order.totalPrice,
        shippingAdress: order.shippingAddress,
        overallStatus: order.overallStatus,
        orderedAt: order.orderedAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during placing order", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during placing order",
    });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { orderId } = req.params; // order to cancel
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const order = await Order.findById(orderId); // check if order exists
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // ===================== C – Check Rules / Permissions =====================
    if (order.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    if (order.status !== "pending " && order.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled in its current status",
      });
    }

    // ===================== A – Action / Core Logic =====================
    order.status = "cancelled";
    await order.save();

    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during order cancellation", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during order cancellation",
    });
  }
};


export const getUsersOrders = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    // No extra validation needed here since we only fetch orders for this user

    // ===================== C – Check Rules / Permissions =====================
    // Implicit: user can only fetch their own orders (userId is from auth token)

    // ===================== A – Action / Core Logic =====================
    const orders = await Order.find({ buyer: userId })
      .populate({
        path: "products.productId",
        select: "name price images",
      })
      .sort({ orderedAt: -1 }); // fetch all orders for this user, latest first

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      orders,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error during fetching user orders", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error during fetching user orders",
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { orderId } = req.params; // order to update
    const { status } = req.body; // new status
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const user = await User.findById(userId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update order status",
      });
    }

    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ===================== C – Check Rules / Permissions =====================
    const ownsProduct = order.products.some(
      (item) => item.productId.seller.toString() === userId
    );

    if (!ownsProduct) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order's status",
      });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // ===================== A – Action / Core Logic =====================
    order.status = status;
    await order.save();

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Error updating order status:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update the order status. Please try again later.",
    });
  }
};


export const addToCart = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { productId, quantity } = req.body; // product and quantity to add
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ===================== C – Check Rules / Permissions =====================
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    // ===================== A – Action / Core Logic =====================
    if (existingItem) {
      existingItem.quantity += quantity;
      cart.totalPrice += product.price * quantity; // update total
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price, // store price in cart item
      });
      cart.totalPrice += product.price * quantity;
    }

    await cart.save();

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Add to cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to add product to cart. Please try again later.",
    });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { productId } = req.params; // product to remove
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemToRemove = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!itemToRemove) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // ===================== A – Action / Core Logic =====================
    cart.totalPrice -= itemToRemove.price * itemToRemove.quantity;

    // Remove the product from cart items array
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Remove from cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while removing from cart",
    });
  }
};


export const updateCartQuantity = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const { productId, quantity } = req.body; // product and new quantity
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // ===================== A – Action / Core Logic =====================
    // Adjust total price based on old vs new quantity
    const oldSubtotal = item.price * item.quantity;
    const newSubtotal = item.price * quantity;

    item.quantity = quantity;
    cart.totalPrice = cart.totalPrice - oldSubtotal + newSubtotal;

    await cart.save();

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Update cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart",
    });
  }
};


export const getCart = async (req, res) => {
  try {
    // ===================== I – Input =====================
    const userId = req.user.id; // logged-in user

    // ===================== V – Validate / Check Resource =====================
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images"
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ===================== R – Response =====================
    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    // ===================== R – Error Handling =====================
    console.error("Get cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};
