"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { productService } from "@/api/productService";
import HeroSection from "@/components/home/HeroSection";
import {
  Truck,
  ShieldCheck,
  Clock,
  CreditCard,
  Star,
  Sparkles,
  Heart,
  Eye,
  ShoppingBag,
  Award,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CustomerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get the 5 newest products
        const response = await productService.getAllProducts({
          limit: 5,
        });

        if (!response || !response.products) {
          throw new Error("Failed to fetch products");
        }

        // Set the products array from the response
        setProducts(response.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Featured brands data
  const brands = [
    { name: "L'Oréal", logo: "/images/brands/loreal.png" },
    { name: "Neutrogena", logo: "/images/brands/neutrogena.png" },
    { name: "Estée Lauder", logo: "/images/brands/esteelauder.png" },
    { name: "Cetaphil", logo: "/images/brands/cetaphil.png" },
    { name: "La Roche-Posay", logo: "/images/brands/laroche.png" },
    { name: "Bioderma", logo: "/images/brands/bioderma.png" },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Emma Thompson",
      role: "Regular Customer",
      image: "/images/testimonials/emma.jpg",
      quote:
        "I've been shopping here for years. The product range and quality is exceptional!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Skincare Enthusiast",
      image: "/images/testimonials/michael.jpg",
      quote:
        "Their cosmetics collection is amazing. I always find what I need here.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Beauty Blogger",
      image: "/images/testimonials/sarah.jpg",
      quote:
        "As someone who reviews products professionally, I can say this shop has premium quality items.",
      rating: 4,
    },
  ];

  // Trending categories data
  const trendingCategories = [
    {
      name: "Skincare",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      count: "250+ Products",
    },
    {
      name: "Makeup",
      icon: Heart,
      color: "from-purple-500 to-indigo-500",
      count: "180+ Products",
    },
    {
      name: "Fragrance",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      count: "120+ Products",
    },
    {
      name: "Hair Care",
      icon: Star,
      color: "from-green-500 to-emerald-500",
      count: "90+ Products",
    },
  ];

  // Statistics data
  const stats = [
    { number: "1K+", label: "Happy Customers", icon: Users },
    { number: "500+", label: "Premium Products", icon: Award },
    { number: "98%", label: "Satisfaction Rate", icon: TrendingUp },
    { number: "24/7", label: "Support Available", icon: Clock },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero Section */}
      <HeroSection />
      {/* Benefits Section - Enhanced */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Why Shop With Us?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders over $50",
                color: "blue",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "100% secure payment",
                color: "yellow",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Dedicated support",
                color: "purple",
              },
              {
                icon: CreditCard,
                title: "Easy Returns",
                desc: "30 day return policy",
                color: "pink",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br from-${benefit.color}-400 to-${benefit.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 "></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-600">Fresh products just for you</p>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Products
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {product.productImages &&
                      product.productImages.length > 0 ? (
                        <Image
                          src={product.productImages[0]}
                          alt={product.productName}
                          fill
                          unoptimized
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Eye className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badges */}
                      {(product.salePercentage ?? 0) > 0 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                          -{product.salePercentage}% OFF
                        </div>
                      )}
                      {product.stock < 10 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                          Low Stock
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900 truncate flex-1 mr-2">
                          {product.productName}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          {product.brand}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          {(product.salePercentage ?? 0) > 0 ? (
                            <div className="space-y-1">
                              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                {formatCurrency(product.price * (1 - (product.salePercentage ?? 0) / 100))}
                              </span>
                              <div className="text-sm text-gray-400 line-through">
                                {formatCurrency(product.price)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl">
                No products available at the moment
              </p>
              <p className="text-gray-400 mt-2">
                Check back soon for new arrivals!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section - New */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Trusted Brands
            </h2>
            <p className="text-gray-600 text-lg">
              We partner with the world's leading beauty and pharmaceutical
              brands
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="group bg-gray-50 hover:bg-white p-6 rounded-2xl flex items-center justify-center h-28 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 hover:border-gray-200"
              >
                <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 text-center">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
