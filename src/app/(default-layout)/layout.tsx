"use client";
import { ReactNode, useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react"; // Thêm icon chat
import Chatbox from "@/components/chatbox/Chatbox";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const [chatboxOpen, setChatboxOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="flex-grow">
        {children}
        {/* Enhanced Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4">
          {/* Main Shopping Button */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <Link
              href="/products"
              className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 transform hover:scale-110 group flex items-center justify-center"
            >
              <ShoppingBag className="h-6 w-6 group-hover:animate-bounce" />
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                !
              </span>
            </Link>
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Shop Now
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>
        {/* Chat box */}
        <div className="fixed bottom-24 right-6 z-50 flex flex-col space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <button
              type="button"
              className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 transform hover:scale-110 group flex items-center justify-center"
              aria-label="Chat with us"
              onClick={() => setChatboxOpen(true)}
            >
              <MessageCircle className="h-6 w-6 group-hover:animate-bounce" />
            </button>
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Chat with us
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-emerald-700"></div>
            </div>
          </div>
        </div>
        {/* Chatbox Modal */}
        {chatboxOpen && (
          <Chatbox open={chatboxOpen} onClose={() => setChatboxOpen(false)} />
        )}
      </main>

      <Footer />
    </>
  );
}
