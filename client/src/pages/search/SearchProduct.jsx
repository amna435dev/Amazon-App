import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getAllProducts, clearError } from "../../store/Slices/productSlice";
import SearchInput from "./SearchInput";
import SearchResult from "./SearchResult";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchProduct = () => {
    const dispatch = useDispatch();
    const query = useQuery().get("q") || "";

    const { products, loading, error, page, pages } = useSelector(
        (state) => state.product
    );

    const [searchParams, setSearchParams] = useState({
        search: query,
        page: 1,
        limit: 10,
    });

    // Update searchParams if URL query changes
    useEffect(() => {
        setSearchParams((prev) => ({ ...prev, search: query, page: 1 }));
    }, [query]);

    const handleSearch = (params) => {
        setSearchParams({ ...params, page: 1, limit: 10 });
    };

    useEffect(() => {
        dispatch(getAllProducts(searchParams));
    }, [dispatch, searchParams]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handlePageChange = (newPage) => {
        setSearchParams((prev) => ({ ...prev, page: newPage }));
    };

    return (
        <div className="min-h-screen bg-[#eeece2] p-8 md:p-8 pb-20">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Search Products</h1>
            <SearchInput onSearch={handleSearch} initialSearch={query} />
            {loading ? (
                <div className="text-center text-lg text-gray-600">Loading...</div>
            ) : (
                <SearchResult
                    products={products || []}
                    currentPage={page}
                    pages={pages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default SearchProduct;
