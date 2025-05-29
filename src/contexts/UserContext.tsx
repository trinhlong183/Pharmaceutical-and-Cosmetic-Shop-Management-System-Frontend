"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import authApiRequest from "@/api/auth";
import { cartService } from "@/api/cartService";

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  cart: {
    itemCount: number;
    updateCartCount: () => Promise<void>;
  };
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  cart: {
    itemCount: 0,
    updateCartCount: async () => {},
  },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCartItemCount(0);
        return;
      }
      const response = await cartService.getMyCart();
      if (response?.success && response?.data?.items) {
        setCartItemCount(response.data.items.length);
      } else {
        setCartItemCount(0);
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        setCartItemCount(0);
        localStorage.removeItem('accessToken');
      }
      console.error("Failed to update cart count:", error);
    }
  };

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (accessToken) {
      authApiRequest
        .myProfile()
        .then((res) => setUser(res?.payload || null))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      updateCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const value = {
    user,
    setUser,
    loading,
    cart: {
      itemCount: cartItemCount,
      updateCartCount,
    },
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
