import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductsBySellerId, clearError } from "../../store/Slices/productSlice";
import SellerProductCard from "./SellerProductCard";

const SellerProducts = () => {
    const dispatch = useDispatch();
    const { sellerProducts, sellerProductsLoading, error } = useSelector((state) => state.product);
    console.log("seller products ", sellerProducts);
    const { currentUser } = useSelector((state) => state.user); 
    const sellerId = currentUser?.id;
   
    useEffect(() => {
        if (sellerId) {
            dispatch(getProductsBySellerId(sellerId));
        }
    }, [dispatch, sellerId]);

    useEffect(() => {
        if (error) {
            alert(error); 
            dispatch(clearError());
        }
    }, [error, dispatch]);

    return (
        <div className="min-h-screen bg-[#eeece2] p-8 sm:p-8 pb-20">
            <h1 className="text-3xl font-bold mb-6">Your Products</h1>
            {sellerProductsLoading ? (
                <div className="text-center">Loading...</div>
            ) : sellerProducts.length === 0 ? (
                <div className="text-center text-gray-500">
                    No products found. Create a new product to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellerProducts.map((product) => (
                        <SellerProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerProducts;