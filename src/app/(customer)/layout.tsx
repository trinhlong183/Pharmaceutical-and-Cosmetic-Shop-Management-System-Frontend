"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
    {/* Header */}      
    <Header />
      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
