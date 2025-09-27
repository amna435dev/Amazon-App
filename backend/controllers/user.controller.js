import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";


export const signup = async (req, res) => {
  try {
    // 1. Did I get the input?
    const { name, email, password, gender } = req.body;

    // 2. Did I validate it?
    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password, gender) are required",
      });
    }

    // 3. Did I check permissions/rules?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 4. Did I do the main action?
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: "profile_images",
      });
      profileImage = result.secure_url;
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      profileImage,
    });
    await user.save();

    // 5. Did I update anything else related?
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6. Did I respond to the client?
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};


// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// Upgrade to Seller Controller
export const upgradeSeller = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already a seller
    if (user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "User is already a seller",
      });
    }

    // Update role to seller
    user.role = "seller";
    await user.save();

    // Generate new JWT with updated role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set new cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "User upgraded to seller successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Upgrade seller error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during role upgrade",
    });
  }
};

// Get Authenticated User Controller
export const getAuthUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and populate relevant fields
   const user = await User.findById(userId)
     .select("-password")
     .populate("listedProducts")
     .populate("orders")
     .populate({
       path: "cart",
       populate: { path: "items.product" }, // to get product details inside cart
     });


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
    console.error("Get auth user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { name, email, password, gender } = req.body;
    const { profileImage } = req.files || {};

    // Only allow logged-in user to update their own account
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own account.",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedData = {};

    // Email update with uniqueness check
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered." });
      }
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter a valid email." });
      }
      updatedData.email = email.trim();
    }

    if (name) updatedData.name = name.trim();
    if (gender) updatedData.gender = gender.trim();

    // Password update with hashing
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    // Profile image update
    if (profileImage) {
      if (user.profileImage) {
        await deleteFromCloudinary(user.profileImage, "image");
      }
      const result = await uploadToCloudinary(profileImage[0].path, {
        folder: "profile_images",
      });
      updatedData.profileImage = result.secure_url;
    }

    // No fields to update .if the user didn’t send any valid fields, updatedData is {} → empty object → no point in running findByIdAndUpdate
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        gender: updatedUser.gender,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};


export const deleteUser = async (req, res) => {
  try {

   const id = req.user.id; // ✅ comes from JWT
   
    // ✅ Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ✅ Delete profile image if exists
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage, "image");
    }

    // ✅ Find all products by this seller
    const userProducts = await Product.find({ seller: id });

    // ✅ Collect all product image deletions
    const deletions = [];
    for (const product of userProducts) {
      if (product.images?.length) {
        for (const img of product.images) {
          deletions.push(deleteFromCloudinary(img, "image"));
        }
      }
    }

    // ✅ Run all deletions in parallel (safer with allSettled)
    await Promise.all(deletions);

    // ✅ Delete all products of this seller
    await Product.deleteMany({ seller: id });

    // ✅ Finally delete the user
    await User.findByIdAndDelete(id);

    // ✅ Clear JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting user account",
      error: error.message,
    });
  }
};

