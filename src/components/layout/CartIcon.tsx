'use client';

import { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserContext } from '@/contexts/UserContext';

const CartIcon = () => {
  const { cart: { itemCount } } = useContext(UserContext);

  return (
    <Link href="/cartpage">
      <Button variant="ghost" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartIcon;
