"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { productService } from "@/api/productService";
import HeroSection from "@/components/home/HeroSection";
import { Truck, ShieldCheck, Clock, CreditCard, Star } from "lucide-react";

export default function CustomerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get the 5 newest products by sorting by createdAt in descending order
        const response = await productService.getAllProducts({
          limit: 5,
          sort: "-createdAt", // Sort by newest first
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
      quote: "I've been shopping here for years. The product range and quality is exceptional!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Skincare Enthusiast",
      image: "/images/testimonials/michael.jpg",
      quote: "Their cosmetics collection is amazing. I always find what I need here.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Beauty Blogger",
      image: "/images/testimonials/sarah.jpg",
      quote: "As someone who reviews products professionally, I can say this shop has premium quality items.",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Benefits Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Truck className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <ShieldCheck className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">100% secure payment</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-500">Dedicated support</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <CreditCard className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Easy Returns</h3>
                <p className="text-sm text-gray-500">30 day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">
              New Arrivals
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              View All Products
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
            // Loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[...Array(5)].map((_, index) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
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
                        -{product.salePercentage}% OFF
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
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold text-lg">
                            ${product.price.toFixed(2)}
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">
                No products available at the moment
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">Summer Special Sale</h2>
              <p className="text-blue-100 mb-4">
                Get up to 40% off on selected products
              </p>
              <Link
                href="/promotions/summer-sale"
                className="inline-block bg-white text-blue-700 px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition"
              >
                Shop Now
              </Link>
            </div>
            <div className="w-full md:w-auto">
              {/* Placeholder for promotional image */}
              <div className="bg-blue-500 bg-opacity-50 h-40 w-full md:w-80 rounded-lg flex items-center justify-center">
                <span className="font-bold text-2xl">40% OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 tracking-tight text-gray-800 text-center">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                    {/* Placeholder for testimonial image */}
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-gray-400">{testimonial.name[0]}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 tracking-tight text-gray-800 text-center">
            Featured Brands
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="bg-gray-50 p-4 rounded-lg flex items-center justify-center h-24"
              >
                {/* Placeholder for brand logo */}
                <span className="font-medium text-gray-700">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <h2 className="text-2xl font-bold mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 mb-6">
              Stay updated with our latest products and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
