"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import productService from "@/api/productService";
import { Product } from "@/types/product";
import { categoriesService } from "@/api/categoriesService";
import Image from "next/image";
import { Category } from "@/types/category";

function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // Fetch category details
        const categoryData = await categoriesService.getCategoryById(
          categoryId
        );
        setCategory(categoryData);

        // Fetch products for this category
        const productsData = await productService.getAllProducts({
          category: [categoryId],
        });
        setProducts(productsData.products);
      } catch (err) {
        setError("Failed to fetch category data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="text-center mb-16">
              <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error || "This category does not exist."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {category.categoryName}
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              {category.categoryDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        {products.length > 0 ? (
          <div>
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Collection
              </h2>
              <p className="text-gray-600 text-lg">
                Discover {products.length} premium products in this category
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4"></div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-11/12 mx-auto">
              {products.map((product) => (
                <Link
                  key={product?.id}
                  href={`/products/${product?.id}`}
                  className="group h-full"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:border-blue-200 transform hover:-translate-y-2 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {product.productImages && product.productImages[0] ? (
                        <Image
                          src={product.productImages[0]}
                          alt={product.productName}
                          width={400}
                          height={400}
                          unoptimized
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl text-gray-400 mb-2">
                              📦
                            </div>
                            <p className="text-gray-500 text-sm">No Image</p>
                          </div>
                        </div>
                      )}

                      {/* Sale Badge */}
                      {product.salePercentage > 0 && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            -{product.salePercentage}%
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {product.brand}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-800 mb-3 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {product.productName}
                      </h3>

                      {/* Suitable For */}
                      <div className="mb-3 min-h-[2rem] flex items-start">
                        {product.suitableFor && (
                          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                            💫 {product.suitableFor}
                          </span>
                        )}
                      </div>

                      {/* Ingredients Preview */}
                      <div className="mb-4 flex-grow">
                        {product.ingredients && (
                          <p className="text-sm text-gray-500 line-clamp-3 min-h-[4.5rem]">
                            🌿 {product.ingredients}
                          </p>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300">
                          View Details
                        </span>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm group-hover:shadow-lg transition-shadow duration-300">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-8">🔜</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Coming Soon
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                We're curating amazing products for this category. Check back
                soon for exciting new additions!
              </p>
              <div className="mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explore All Products
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
