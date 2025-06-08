"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X } from "lucide-react";
import CartIcon from "./CartIcon";
import { Role } from "@/constants/type";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser, loading } = useUser();
  // const { totalItems } = useCart();

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-blue-600 text-3xl">💊</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PharmaCosmetic
          </h1>
        </Link>

      {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link
            href="/home"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Products
          </Link>
          <Link
            href="/skin-analysis"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            AI Skin Analysis
          </Link>
          <Link
            href="/aboutus"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            About Us
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Shopping Cart */}
          {/* <Link
            href="/cartpage"
            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </Link> */}
          <CartIcon />

          {/* User Menu */}
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold text-gray-800">
                    {user.fullName || user.email}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    My Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/myorders" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                </Link>
                <Link href="/skin-history" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    Skin Analysis History
                  </DropdownMenuItem>
                </Link>
                {user.role === Role.STAFF && (
                  <Link href="/manage-products" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      Manage Products
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    setUser(null);
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
              >
                Products
              </Link>
              <Link
                href="/skin-analysis"
                className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
              >
                AI Skin Analysis
              </Link>
              <Link
                href="/cart"
                className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors flex items-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shopping Cart
              </Link>
              <Link
                href="/aboutus"
                className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
              >
                About Us
              </Link>
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <Link
                      href="/profile"
                      className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
                    >
                      My Profile
                    </Link>
                  </div>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
                  >
                    My Orders
                  </Link>
                  {user.role === Role.STAFF && (
                    <Link
                      href="/manage-products"
                      className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
                    >
                      Manage Products
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
