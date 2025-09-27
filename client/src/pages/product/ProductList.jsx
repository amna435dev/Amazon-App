// ProductList.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../store/Slices/productSlice";
import ProductCard from "./ProductCard";

const ProductList = ({ params = {} }) => {
  const dispatch = useDispatch();
  const { products, loading, total, page, pages } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getAllProducts(params));
  }, [dispatch]);

  if (loading) {
    return <p className="text-center mt-10">Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No products available.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination Info */}
      <div className="mt-4 text-center text-gray-600">
        Page {page} of {pages} — Total Products: {total}
      </div>
    </div>
  );
};

export default ProductList;
