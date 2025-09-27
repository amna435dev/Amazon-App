import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { updateUser } from "../../store/Slices/userSlice";
import { FaCamera } from "react-icons/fa";


const UpdateUser = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, updateUserLoading, error } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        password: "",
        gender: currentUser.gender || "",
      });
      setPreviewImage(currentUser.profileImage || null);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Append all non-empty form fields dynamically
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        // Append profile image if exists
        if (profileImage) data.append("profileImage", profileImage);

        try {
            await dispatch(updateUser({ userId: id, formData: data })).unwrap();
            toast.success("Profile updated successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err || "Failed to update profile");
        }
    };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-[#eeece2] py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-4 bg-gray-100 p-4 rounded-xl shadow-lg">
        {/* Top-centered Profile Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-gray-100 ring-4 ring-indigo-100">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xl font-semibold">
                  <span>{(formData?.name || "U").toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Upload trigger (visually styled label) */}
            <label className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs p-2 font-medium cursor-pointer shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <FaCamera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-gray-500">JPG, PNG up to 5MB</p>
        </div>

        <div>
          <h2 className="text-center text-xl sm:text-3xl font-extrabold text-gray-900">
            Update Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Modify your details below
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 sm:text-sm "


                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 sm:text-sm "
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password (minimum 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 sm:text-sm "
                placeholder="Enter new password"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male" >
                  Male
                </option>
                <option value="female" >
                  Female
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={updateUserLoading}
              className={`w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                updateUserLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {updateUserLoading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UpdateUser;
