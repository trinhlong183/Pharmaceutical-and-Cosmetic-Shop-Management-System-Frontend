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

const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000];
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
    <div className="container mx-auto px-4 py-8 min-h-lvh">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      {/* Search bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={pendingFilter.search}
            onChange={handleSearchInput}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={applySearch}
            className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile filter button */}
        <button
          className="md:hidden flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
          onClick={() =>
            handlePendingChange(
              "mobileFiltersOpen",
              !pendingFilter["mobileFiltersOpen"]
            )
          }
        >
          <FiFilter />{" "}
          {pendingFilter["mobileFiltersOpen"] ? "Hide Filters" : "Show Filters"}
        </button>
        {/* Filters */}
        <div
          className={`w-full md:w-64 ${
            pendingFilter["mobileFiltersOpen"] ? "block" : "hidden"
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
                      checked={pendingFilter.selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
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
                    key={category._id}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pendingFilter.selectedCategories.includes(
                        category._id
                      )}
                      onChange={() => handleCategoryToggle(category._id)}
                      className="mr-2"
                    />
                    <span>{category.categoryName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Price Range</h3>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={pendingFilter.priceRange}
                onValueChange={handlePriceRangeChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>${pendingFilter.priceRange[0].toLocaleString()}</span>
                <span>${pendingFilter.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Sort By</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={pendingFilter.sortBy}
                  onChange={handleSortChange}
                  className="border rounded px-2 py-1"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  {ORDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        handleOrderChange({
                          target: { value: opt.value },
                        } as any)
                      }
                      className={`border rounded px-2 py-1 flex items-center transition-colors
                        ${
                          pendingFilter.order === opt.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={resetAllFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : displayedProducts.length === 0 ? (
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
                />
              ))}
            </div>
          )}
         
        </div>
        
      </div>
       {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 py-1 rounded bg-gray-100">{page}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(page < totalPages ? page + 1 : page)
                    }
                    aria-disabled={page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
    </div>
  );
}
