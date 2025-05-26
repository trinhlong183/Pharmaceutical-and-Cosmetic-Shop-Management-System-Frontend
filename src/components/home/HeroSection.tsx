import Image from "next/image";
import React from "react";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white overflow-hidden relative">
      {/* Abstract shapes for background */}
      <div className="text-red-600 text-4xl">helo em</div>
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-60 h-60 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center relative z-10">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 opacity-0 animate-fade-in-left">
            Manage Your <span className="text-blue-200">Pharmaceutical</span> &{" "}
            <span className="text-blue-200">Cosmetic</span> Shop Effortlessly
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-lg opacity-0 animate-fade-in-left [animation-delay:200ms]">
            An all-in-one solution for inventory management, sales tracking, and
            customer relationship management.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 opacity-0 animate-fade-in-left [animation-delay:400ms]">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-lg transition-all hover:scale-105">
              Get Started
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-all hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-10 opacity-0 animate-fade-in-right">
          <div className="bg-white/90 p-3 rounded-xl shadow-2xl backdrop-blur-sm transform hover:scale-[1.02] transition-transform">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              {/* <Image
                src="https://placehold.co/1200x800/e2e8f0/1e40af?text=Dashboard+Preview"
                alt="System Dashboard"
                fill
                className="rounded object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              /> */}
            </div>

            {/* Dashboard stats indicators */}
            <div className="flex justify-between mt-3 px-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-600">Sales +24%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs text-gray-600">Inventory 98%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs text-gray-600">Orders 152</span>
              </div>
            </div>
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
  );
}
