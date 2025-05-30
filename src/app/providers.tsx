"use client";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "react-hot-toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <UserProvider>
        {children}
        <Toaster position="top-right" />
      </UserProvider>
  );
}
