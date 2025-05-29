'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <Image 
                src="/empty-cart.png" 
                alt="Empty Cart" 
                width={200} 
                height={200} 
                className="mx-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({totalItems} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-md p-4 flex items-start gap-4"
              >
                {/* Product Image */}
                <Link href={`/products/${item.product._id}`} className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product.productImages[0]}
                    alt={item.product.productName}
                    fill
                    className="object-cover rounded-md"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {item.product.productName}
                      </Link>
                      <p className="text-gray-600 text-sm">{item.product.brand}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-4 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.product.salePercentage ? (
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-red-500">
                            ${((item.product.price * (1 - item.product.salePercentage / 100)) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400 line-through">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                {/* Promo Code Input */}
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-xl text-gray-900">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Including VAT</p>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Implement checkout logic
                  console.log('Proceeding to checkout...');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}