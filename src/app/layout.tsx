import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
// import CartIcon from "@/components/CartIcon";
import { Toaster } from "react-hot-toast";
import { AppProviders } from "./providers";
import { Toaster as Sonner } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pharmaceutical & Cosmetic Management System",
  description:
    "Complete management solution for pharmaceutical and cosmetic shops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AppProviders>
          {/* <Header /> */}
          {children}
          <Toaster />
          <Sonner />
          <Toaster position="top-right" />
          {/* <Footer /> */}
        </AppProviders>
      </body>
    </html>
  );
}
