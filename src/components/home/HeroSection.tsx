"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const heroImages = [
  {
    src: "https://juliettearmand.com.vn/wp-content/uploads/2023/04/PQ7255.jpg",
    alt: "Sữa chống nắng bí đao",
  },
  {
    src: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    alt: "Skin care products",
  },
  {
    src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80",
    alt: "Cosmetic products",
  }
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToNextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const goToPrevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="relative h-[90vh] flex flex-col md:flex-row overflow-hidden">
      {/* Left side content - Yellow background */}
      <div className="w-full md:w-1/2 bg-yellow-300 flex items-center justify-center">
        <div className="p-8 md:p-12 lg:p-16">
          <div className="max-w-md">
            <h2 className="text-xl uppercase tracking-wider mb-4">CHỐNG NẮNG PHỔ RỘNG</h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Sữa chống nắng bí đao
            </h1>
            <p className="mb-8 text-lg">
              Bảo vệ da trước tia UVA, UVB và ánh sáng nắng lượng cao nhìn thấy được. 
              Với kết cấu không trọng lượng, thấm nhanh vào da mà không để lại vết trắng 
              và mang đến cảm giác thoải mái khi sử dụng.
            </p>
            <Link 
              href="/products" 
              className="inline-block px-8 py-4 bg-black text-white font-medium text-lg rounded-md hover:bg-gray-800 transition-colors"
            >
              XEM NGAY
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right side image carousel */}
      <div className="w-full md:w-1/2 h-full relative">
        {/* Image carousel */}
        <div className="w-full h-full relative">
          {heroImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                className="object-cover"
              />
            </div>
          ))}
          
          {/* Navigation arrows */}
          <div className="absolute z-20 inset-0 flex items-center justify-between p-4">
            <button 
              onClick={goToPrevSlide}
              className="bg-white/30 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={goToNextSlide}
              className="bg-white/30 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Dots indicator */}
          <div className="absolute z-20 bottom-4 left-0 right-0 flex justify-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
