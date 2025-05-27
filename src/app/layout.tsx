import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CartIcon from "@/components/CartIcon";
import CartDevTools from "@/components/CartDevTools";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

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
      >
        <Providers>
          <Header />
          <nav className="fixed top-4 right-4 z-50">
            <CartIcon />
          </nav>
          {children}
          <Toaster position="top-right" />
          <CartDevTools />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
