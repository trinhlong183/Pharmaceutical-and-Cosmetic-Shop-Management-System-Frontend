'use client';
import { useCart } from '@/contexts/CartContext';

export default function CartDevTools() {
  const { items, clearCart, totalItems, totalPrice } = useCart();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Cart Debug Info</h3>
      <div className="text-sm space-y-1">
        <p>Total Items: {totalItems}</p>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
        <p>Items in Cart: {items.length}</p>
      </div>
      <button
        onClick={clearCart}
        className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded text-sm"
      >
        Clear Cart
      </button>
      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
        {JSON.stringify(items, null, 2)}
      </pre>
    </div>
  );
}