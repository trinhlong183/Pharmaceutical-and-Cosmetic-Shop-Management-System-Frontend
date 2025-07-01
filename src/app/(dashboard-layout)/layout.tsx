"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FolderKanban,
  Layers2,
  Truck,
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

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "admin" | "staff";
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, setUser } = useUser();

  // Menu items chung cho cả staff và admin
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Products",
      path: "/manage-products",
      icon: <Package size={20} />,
    },
    {
      label: "Orders",
      path: "/manage-orders",
      icon: <ShoppingCart size={20} />,
    },
    {
      label: "Inventory",
      path: user?.role === "admin" ? "/inventory-request" : "/manage-inventory",
      icon: <FolderKanban size={20} />,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: <Users size={20} />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  // Nếu là admin thì thêm menu quản lý danh mục
  if (user?.role === "admin") {
    menuItems.splice(3, 0, {
      label: "Categories",
      path: "/manage-categories",
      icon: <Layers2 size={20} />,
    });
    menuItems.splice(4, 0, {
      label: "Transactions",
      path: "/transaction-admin",
      icon: <ShoppingCart size={20} />,
    });
    menuItems.splice(5, 0, {
      label: "Shipping",
      path: "/shipping",
      icon: <Truck size={20} />,
    });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">
            {user?.role === "admin" ? "Admin Portal" : "Staff Portal"}
          </h1>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Welcome, {user?.role === "admin" ? "Admin" : "Staff"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.photoUrl} />
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
