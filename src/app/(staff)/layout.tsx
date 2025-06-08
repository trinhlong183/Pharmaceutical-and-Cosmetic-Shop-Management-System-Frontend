"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
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
            href="/products"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link
            href="/orders"
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
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Staff Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Welcome, Staff</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
