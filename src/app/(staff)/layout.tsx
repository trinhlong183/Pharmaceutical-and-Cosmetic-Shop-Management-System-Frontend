"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, setUser } = useUser();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Staff Portal</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/dashboardstaff"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/manage-products"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link
            href="/manage-orders"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <ShoppingCart size={20} />
            <span>Orders</span>
          </Link>
          <Link
            href="/customers"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Staff Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Welcome, Staff</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user?.fullName ? user?.fullName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold text-gray-800">
                    {user?.fullName || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    Home
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    My Profile
                  </DropdownMenuItem>
                </Link>

                <Link href="/skin-history" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    Skin Analysis History
                  </DropdownMenuItem>
                </Link>

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
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
