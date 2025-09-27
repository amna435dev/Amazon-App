// ProductCard.jsx
import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { _id, name, images = [], price, averageRating = 0 } = product;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  return (
    <div className="border rounded-md p-4 flex flex-col cursor-pointer group relative overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
      {/* Price Tag */}
      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded z-10 font-semibold">
        ${price.toFixed(2)}
      </div>

      {/* Product Image */}
      <div className="relative w-full h-52 overflow-hidden rounded-md" onClick={nextImage}>
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === currentImageIndex ? "bg-orange-500" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>

          {/* Star Rating */}
          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }).map((_, i) =>
              i < Math.round(averageRating) ? (
                <FaStar key={i} className="text-yellow-400 h-4 w-4" />
              ) : (
                <FaRegStar key={i} className="text-gray-300 h-4 w-4" />
              )
            )}
            <span className="ml-2 text-xs text-gray-500">
              {averageRating ? averageRating.toFixed(1) : "No ratings"}
            </span>
          </div>
        </div>

        {/* View Detail Button */}
        <Link
          to={`/product/${_id}`}
          className="mt-3 text-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
        >
          View Detail
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
