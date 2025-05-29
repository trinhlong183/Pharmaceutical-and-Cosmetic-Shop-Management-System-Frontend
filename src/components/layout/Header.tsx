"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-3xl">💊</span>
          <h1 className="text-xl font-bold text-gray-800">PharmaCosmetic</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
            Products
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
            Orders
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
            Customers
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
            Reports
          </a>
        </nav>

        {/* User Menu */}
        <div className="flex items-center">
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <Link
            href="/login"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <span>Sign In</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="ml-4 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-600 hover:text-blue-600 py-2">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 py-2">
                Products
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 py-2">
                Orders
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 py-2">
                Customers
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 py-2">
                Reports
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
