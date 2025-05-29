"use client";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "react-hot-toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <UserProvider>
        {children}
        <Toaster position="top-right" />
      </UserProvider>
    </CartProvider>
  );
}
