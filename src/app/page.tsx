"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { productService } from "@/api/productService";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
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
          <h2 className="text-3xl font-bold text-center mb-8">Our Products</h2>

          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            // Products grid
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-64">
                    {product.productImages &&
                    product.productImages.length > 0 ? (
                      <Image
                        src={product.productImages[0]}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}
                    {product.salePercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                        -{product.salePercentage}%
                      </div>
                    )}
                    {product.stock < 10 && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {product.productName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {product.brand}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.salePercentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">
                              $
                              {(
                                product.price *
                                (1 - product.salePercentage / 100)
                              ).toFixed(2)}
                            </span>
                            <span className="text-gray-400 line-through text-sm">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>{" "}
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
