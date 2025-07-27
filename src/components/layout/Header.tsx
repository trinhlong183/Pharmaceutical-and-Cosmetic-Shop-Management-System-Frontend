"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import CartIcon from "./CartIcon";
import { Role } from "@/constants/type";
import { categoriesService } from "@/api/categoriesService";

interface Category {
  _id: string;
  categoryName: string;
  categoryDescription: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { user, setUser, loading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getAllCategories();
        setCategories(data as any);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".categories-dropdown")) {
        setIsCategoriesOpen(false);
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCategoriesOpen]);

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
            className={`font-medium transition-colors ${
              pathname === "/home" || pathname === "/"
                ? "text-blue-600 font-bold"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`font-medium transition-colors ${
              pathname === "/products"
                ? "text-blue-600 font-bold"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Products
          </Link>

          {/* Categories Dropdown */}
          <div className="relative categories-dropdown">
            <button
              className={`font-medium transition-colors flex items-center space-x-1 ${
                pathname.startsWith("/categories")
                  ? "text-blue-600 font-bold"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoriesOpen && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white border border-gray-300 rounded-xl shadow-2xl z-50">
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/categories/${category._id}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex flex-col h-10 p-3  hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group bg-white  hover:shadow-md"
                      >
                        <div className="font-semibold text-gray-700 group-hover:text-blue-600 text-sm line-clamp-2 flex-grow flex items-center justify-center text-center leading-tight">
                          {category.categoryName}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/aboutus"
            className={`font-medium transition-colors ${
              pathname === "/aboutus"
                ? "text-blue-600 font-bold"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <CartIcon />
          {/* User Menu */}
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.photoUrl} />
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
                  <Link href="/manage-orders" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      Manage
                    </DropdownMenuItem>
                  </Link>
                )}
                {user.role === Role.ADMIN && (
                  <Link href="/dashboard" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      Dashboard
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
                className={`py-2 font-medium transition-colors ${
                  pathname === "/" || pathname === "/home"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`py-2 font-medium transition-colors ${
                  pathname === "/products"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Products
              </Link>
              <Link
                href="/mobile-app"
                className={`py-2 font-medium transition-colors flex items-center space-x-2 ${
                  pathname === "/mobile-app"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-lg">📱</span>
                <span>Mobile App</span>
              </Link>
              <Link
                href="/categories"
                className={`py-2 font-medium transition-colors flex items-center space-x-2 ${
                  pathname.startsWith("/categories")
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-lg">📦</span>
                <span>Categories</span>
              </Link>

              <Link
                href="/cart"
                className={`py-2 font-medium transition-colors flex items-center ${
                  pathname === "/cart"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shopping Cart
              </Link>
              <Link
                href="/aboutus"
                className={`py-2 font-medium transition-colors ${
                  pathname === "/aboutus"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
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
                      href="/manage-orders"
                      className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
                    >
                      Manage Orders
                    </Link>
                  )}
                  {user.role === Role.ADMIN && (
                    <Link
                      href="/dashboard"
                      className="text-gray-600 hover:text-blue-600 py-2 font-medium transition-colors"
                    >
                      Dashboard
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
