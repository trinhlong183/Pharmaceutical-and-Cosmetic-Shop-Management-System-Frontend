'use client';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href="/cartpage" className="relative">
      <FiShoppingCart size={24} className="text-gray-700" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
          {totalItems}
        </span>
      )}
    </Link>
  );
}