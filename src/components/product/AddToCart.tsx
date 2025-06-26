'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface AddToCartProps {
  productId: string;
  disabled?: boolean;
  maxQuantity?: number;
}

const AddToCart = ({ productId, disabled = false, maxQuantity = 99 }: AddToCartProps) => {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInput = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuantity) {
      setQuantity(numValue);
    }
  };

  const handleAddToCart = () => {
    addToCart(productId, quantity);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center">
          <div className="flex items-center border-2 border-gray-200 rounded-lg bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || disabled}
              className="h-10 w-10 p-0 hover:bg-gray-50 rounded-l-lg border-r border-gray-200"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityInput(e.target.value)}
              disabled={disabled}
              min={1}
              max={maxQuantity}
              className="h-10 w-16 text-center font-semibold text-gray-800 bg-gray-50 border-0 focus:ring-0 focus:border-0 rounded-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity || disabled}
              className="h-10 w-10 p-0 hover:bg-gray-50 rounded-r-lg border-l border-gray-200"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          <span className="text-sm text-gray-500 ml-3">
            {maxQuantity} available
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || disabled}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isLoading ? 'Adding...' : `Add ${quantity} to Cart`}
      </Button>
    </div>
  );
};

export default AddToCart;
