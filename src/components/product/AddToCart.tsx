'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface AddToCartProps {
  productId: string;
}

const AddToCart = ({ productId }: AddToCartProps) => {
  const { addToCart, isLoading } = useCart();

  return (
    <Button
      onClick={() => addToCart(productId)}
      disabled={isLoading}
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCart;
