"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, SuitableForType } from "@/types/product";
import { useEffect, useState } from "react";
import { productService } from "@/api/productService";


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        if (!response) {
          throw new Error('Failed to fetch products');
        }
        setProducts(response);
      } catch (error) {
        console.error('Error fetching products:', error);
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
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-60 h-60 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Pharmaceutical & Cosmetic Shop{" "}
                <span className="text-blue-200">Management</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                An all-in-one solution for inventory management, sales tracking,
                and customer relationship management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-lg transition-all hover:scale-105 inline-block text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-all hover:scale-105 inline-block text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-white/90 p-3 rounded-xl shadow-2xl relative z-10 transform hover:scale-[1.02] transition-transform">
                <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            fill="#ffffff"
            preserveAspectRatio="none"
          >
            <path d="M0,96L48,80C96,64,192,32,288,32C384,32,480,64,576,74.7C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Products</h2>
          
          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
                    {product.productImages && product.productImages.length > 0 ? (
                      <Image
                        src={product.productImages[0]}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image available</span>
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
                      <h3 className="text-lg font-semibold text-gray-800">{product.productName}</h3>
                      <span className="text-sm text-gray-500">{product.brand}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.salePercentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">
                              ${(product.price * (1 - product.salePercentage / 100)).toFixed(2)}
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
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.category && product.category.length > 0 
                          ? product.category[0] 
                          : 'Uncategorized'}
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
