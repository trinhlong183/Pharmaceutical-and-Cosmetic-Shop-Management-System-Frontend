"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import authApiRequest from "@/api/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = () => {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (accessToken) {
        authApiRequest
          .myProfile()
          .then((res) => {
            setUser(res?.payload || null);
          })
          .catch(() => setUser(null));
      } else {
        setUser(null);
      }
    };

    fetchUser();

    // Lắng nghe event userChanged để cập nhật user khi login/logout
    window.addEventListener("userChanged", fetchUser);

    return () => {
      window.removeEventListener("userChanged", fetchUser);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-blue-600 text-3xl">💊</span>
          <h1 className="text-xl font-bold text-gray-800">PharmaCosmetic</h1>
        </Link>

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
          {/* Nếu đã đăng nhập, hiển thị avatar, nếu chưa thì hiển thị nút Sign In */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 mr-3">
                  <Avatar>
                    {/* Nếu có thể, bạn có thể truyền AvatarImage src={user.avatarUrl} */}
                    <AvatarFallback>
                      {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="font-semibold">
                    {user.fullName || user.email}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem >My Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("userEmail");
                    window.dispatchEvent(new Event("userChanged")); // Phát event khi logout
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <span>Sign In</span>
            </Link>
          )}

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
