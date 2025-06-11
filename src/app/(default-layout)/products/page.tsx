"use client";

import React, { useEffect, useState } from "react";
import { productService } from "@/api/productService"; // Assume you have this service
import { FiFilter, FiSearch } from "react-icons/fi";
import ProductCard from "@/components/product/ProductCard";
import { categoriesService } from "@/api/categoriesService";
import { set } from "zod";

interface Product {
  id: string;
  productName: string;
  price: number;
  productImages: [string];
  brand: string;
  category: string;
  productDescription?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchBrandsAndCategories = async () => {
    try {
      // const [brandsData, categoriesData] = await Promise.all([
      //   productService.getAllBrands(),
      //   categoriesService.getAllCategories(),
      // ]);
      // setBrands(brandsData);
      // setCategories(categoriesData);

      const categoriesData = await categoriesService.getAllCategories();
      setCategories(categoriesData.map((item) => item.categoryName));
    } catch (error) {
      console.error("Failed to fetch brands or categories:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        console.log("Fetched products:", data);

        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandsAndCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = products;

    // Filter by search
    if (search) {
      result = result.filter(
        (product) =>
          product.productName?.toLowerCase().includes(search.toLowerCase()) ||
          product.productDescription
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        Array.isArray(product.category)
          ? product.category.some((cat: any) =>
              typeof cat === "string"
                ? selectedCategories.includes(cat)
                : selectedCategories.includes(cat.categoryName)
            )
          : false
      );
    }

    setFilteredProducts(result);
  }, [search, selectedBrands, selectedCategories, products]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSearch("");
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-lvh">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>

      {/* Search bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile filter button */}
        <button
          className="md:hidden flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <FiFilter /> {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters */}
        <div
          className={`w-full md:w-64 ${
            mobileFiltersOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Brands</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="mr-2"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Try changing your filters or search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  productName={product.productName}
                  price={product.price}
                  productImages={product.productImages}
                  brand={product.brand}
                  category={product.category}
                  productDescription={product.productDescription}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
