"use client";

import React, { useEffect, useState } from "react";
import { productService } from "@/api/productService";

import { FiFilter, FiSearch } from "react-icons/fi";
import ProductCard from "@/components/product/ProductCard";
import { categoriesService } from "@/api/categoriesService";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000000];
const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "price", label: "Price" },
  { value: "salePercentage", label: "Sale %" },
  { value: "expiryDate", label: "Expiry Date" },
  { value: "createdAt", label: "Newest" },
];
const ORDER_OPTIONS = [
  {
    value: "asc",
    label: "Ascending",
    icon: (
      <svg
        className="inline w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ),
  },
  {
    value: "desc",
    label: "Descending",
    icon: (
      <svg
        className="inline w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    ),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [pendingFilter, setPendingFilter] = useState({
    search: "",
    selectedBrands: [] as string[],
    selectedCategories: [] as string[],
    priceRange: DEFAULT_PRICE_RANGE as [number, number],
    sortBy: "price",
    order: "desc",
  });
  const [filter, setFilter] = useState({
    search: "",
    selectedBrands: [] as string[],
    selectedCategories: [] as string[],
    priceRange: DEFAULT_PRICE_RANGE as [number, number],
    sortBy: "price",
    order: "asc",
  });


  // Fetch categories on mount
  useEffect(() => {
    categoriesService
      .getAllCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products when filter or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: PAGE_SIZE,
          minPrice: filter.priceRange[0],
          maxPrice: filter.priceRange[1],
          sortBy: filter.sortBy,
          order: filter.order,
        };
        if (filter.search) params.search = filter.search;
        if (filter.selectedBrands.length > 0)
          params.brand = filter.selectedBrands[0];
        if (filter.selectedCategories.length > 0)
          params.category = filter.selectedCategories;
        const res = await productService.getAllProducts(params);
        setProducts(res.products || []);
        setDisplayedProducts(res.products || []);
        setTotal(res.total || 0);
      } catch {
        setProducts([]);
        setDisplayedProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filter, page]);

  // Handlers for pending filter UI
  const handlePendingChange = (key: keyof typeof pendingFilter, value: any) => {
    setPendingFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleBrandToggle = (brand: string) => {
    handlePendingChange(
      "selectedBrands",
      pendingFilter.selectedBrands.includes(brand)
        ? pendingFilter.selectedBrands.filter((b) => b !== brand)
        : [...pendingFilter.selectedBrands, brand]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    handlePendingChange(
      "selectedCategories",
      pendingFilter.selectedCategories.includes(categoryId)
        ? pendingFilter.selectedCategories.filter((c) => c !== categoryId)
        : [...pendingFilter.selectedCategories, categoryId]
    );
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    handlePendingChange("priceRange", range);
    setPage(1);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePendingChange("search", e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingFilter((prev) => ({ ...prev, sortBy: e.target.value }));
  };
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingFilter((prev) => ({ ...prev, order: e.target.value }));
  };

  const applySearch = () => {
    setFilter((prev) => ({ ...prev, search: pendingFilter.search }));
    setPage(1);
  };

  const applyFilters = () => {
    setFilter((prev) => ({
      ...prev,
      selectedBrands: pendingFilter.selectedBrands,
      selectedCategories: pendingFilter.selectedCategories,
      priceRange: pendingFilter.priceRange,
      sortBy: pendingFilter.sortBy,
      order: pendingFilter.order,
    }));
    setPage(1);
  };

  const resetAllFilters = () => {
    setPendingFilter({
      search: "",
      selectedBrands: [],
      selectedCategories: [],
      priceRange: DEFAULT_PRICE_RANGE,
      sortBy: "price",
      order: "asc",
    });
    setFilter({
      search: "",
      selectedBrands: [],
      selectedCategories: [],
      priceRange: DEFAULT_PRICE_RANGE,
      sortBy: "price",
      order: "asc",
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-lvh bg-gradient-to-br from-indigo-50 to-slate-100 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Our Products
        </h1>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={pendingFilter.search}
              onChange={handleSearchInput}
              className="w-full pl-12 pr-4 py-3 border border-indigo-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
            <button
              onClick={applySearch}
              className="ml-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-md"
            >
              Search
            </button>
          </div>
        </div>
        <div className="w-11/12 mx-auto ">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Mobile filter button */}
            <button
              className="md:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-3 rounded-lg mb-4 shadow-md"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FiFilter />
              {mobileFiltersOpen
                ? "Hide Filters"
                : "Show Filters"}
            </button>

            {/* Filters */}
            <div
              className={`w-full md:w-72 ${
                mobileFiltersOpen ? "block" : "hidden"
              } md:block`}
            >
              <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 mb-6">
                <div className="mb-8">
                  <h3 className="font-semibold text-xl mb-4 text-gray-800">
                    Brands
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className={`flex items-center cursor-pointer p-2 rounded-md hover:bg-indigo-50 transition-colors ${
                          pendingFilter.selectedBrands.includes(brand)
                            ? "bg-indigo-100 text-indigo-800"
                            : "text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={pendingFilter.selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="mr-3 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-xl mb-4 text-gray-800">
                    Categories
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <label
                        key={category._id}
                        className={`flex items-center cursor-pointer p-2 rounded-md hover:bg-indigo-50 transition-colors ${
                          pendingFilter.selectedCategories.includes(
                            category._id
                          )
                            ? "bg-indigo-100 text-indigo-800"
                            : "text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={pendingFilter.selectedCategories.includes(
                            category._id
                          )}
                          onChange={() => handleCategoryToggle(category._id)}
                          className="mr-3 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span>{category.categoryName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-xl mb-4 text-gray-800">
                    Price Range
                  </h3>
                  <Slider
                    min={DEFAULT_PRICE_RANGE[0]}
                    max={DEFAULT_PRICE_RANGE[1]}
                    step={100000}
                    value={pendingFilter.priceRange}
                    onValueChange={handlePriceRangeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm mt-3 text-gray-600">
                    <span>{formatCurrency(pendingFilter.priceRange[0])}</span>
                    <span>{formatCurrency(pendingFilter.priceRange[1])}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-xl mb-4 text-gray-800">
                    Sort By
                  </h3>
                  <div className="flex flex-col gap-3">
                    <select
                      value={pendingFilter.sortBy}
                      onChange={handleSortChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      {ORDER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            handleOrderChange({
                              target: { value: opt.value },
                            } as any)
                          }
                          className={`flex-1 border rounded-md px-3 py-2 flex items-center justify-center transition-colors
                          ${
                            pendingFilter.order === opt.value
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                          }
                        `}
                          aria-label={opt.label}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={applyFilters}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-md font-medium"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetAllFilters}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-10 text-center border border-indigo-100">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search term
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      productId={product.id || ""}
                      productName={product.productName}
                      price={product.price}
                      productImages={product.productImages}
                      brand={product.brand}
                      category={product.category}
                      productDescription={product.productDescription}
                      salePercentage={product.salePercentage}
                      stock={product.stock}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-800 font-medium">{`${page} / ${totalPages}`}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(page < totalPages ? page + 1 : page)
                  }
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
