"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/manage-products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/manage-orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full w-full bg-gray-100">
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0 lg:w-16",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className={cn(
            "flex h-16 items-center px-4 border-b",
            !sidebarOpen && "lg:justify-center"
          )}>
            <h1 className={cn(
              "font-bold text-xl text-primary transition-opacity duration-300",
              !sidebarOpen && "lg:opacity-0 lg:invisible"
            )}>
              Staff Portal
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100",
                    !sidebarOpen && "lg:justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "ml-3 transition-opacity duration-300",
                    (!sidebarOpen) && "lg:hidden"
                  )}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-2 border-t border-gray-200">
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-start text-red-500 hover:text-red-700 hover:bg-red-50",
                !sidebarOpen && "lg:justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className={cn(
                "ml-3 transition-opacity duration-300",
                (!sidebarOpen) && "lg:hidden"
              )}>
                Logout
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-16"
      )}>
        <div className="px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}
