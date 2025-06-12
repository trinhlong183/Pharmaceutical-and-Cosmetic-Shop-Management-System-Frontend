"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { productService } from "@/api/productService";
import HeroSection from "@/components/home/HeroSection";

export default function CustomerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        if (!response) {
          throw new Error("Failed to fetch products");
        }
        setProducts(response);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 tracking-tight text-gray-800">
            Top Products
          </h2>

          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            // Products grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group border border-gray-100"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {product.productImages &&
                    product.productImages.length > 0 ? (
                      <Image
                        src={product.productImages[0]}
                        alt={product.productName}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">
                          No image available
                        </span>
                      </div>
                    )}
                    {product.salePercentage > 0 && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                        -{product.salePercentage}%
                      </span>
                    )}
                    {product.stock < 10 && (
                      <span className="absolute top-3 left-3 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base font-semibold text-gray-800 truncate">
                        {product.productName}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium ml-2 truncate">
                        {product.brand}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        {product.salePercentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold text-lg">
                              $
                              {(
                                product.price *
                                (1 - product.salePercentage / 100)
                              ).toFixed(2)}
                            </span>
                            <span className="text-gray-400 line-through text-sm">
                              {product.price.toFixed(2)}vnd
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold text-lg">
                            {product.price.toFixed(2)}vnd
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium ml-2 truncate">
                        {product.category && product.category.length > 0
                          ? typeof product.category[0] === "string"
                            ? product.category[0]
                            : product.category[0]?.categoryName ||
                              "Uncategorized"
                          : "Uncategorized"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // No products state
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
