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
      <section className="relative min-h-[80vh] bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute animate-float top-20 left-20 w-32 h-32 rounded-full bg-pink-100/40 blur-xl"></div>
          <div className="absolute animate-float-delayed top-40 right-20 w-40 h-40 rounded-full bg-blue-100/40 blur-xl"></div>
          <div className="absolute animate-float-slow bottom-20 left-1/3 w-36 h-36 rounded-full bg-purple-100/40 blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Beauty & Health
              <span className="block mt-2">In One Place</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Discover our premium selection of pharmaceutical and cosmetic products. 
              Your journey to wellness and beauty starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg transition-all hover:shadow-pink-200 hover:scale-105"
              >
                Shop Now
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </Link>
              <Link
                href="/categories"
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">Certified Products</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                </svg>
                <span className="text-sm text-gray-600">Free Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
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
