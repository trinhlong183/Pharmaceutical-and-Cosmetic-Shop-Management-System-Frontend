'use client';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="top-right" />
    </CartProvider>
  );
}