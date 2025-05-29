'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import { Product, SuitableForType } from "@/types/product";
import { toast } from 'react-hot-toast';
import { useCart } from "@/contexts/CartContext";

// Demo data - sẽ thay thế bằng API call sau
const demoProducts: Product[] = [
  {
    _id: "1",
    productName: "Vitamin C Serum",
    productDescription: "High potency vitamin C serum for bright, healthy skin",
    price: 29.99,
    stock: 50,
    category: [{ _id: "1", name: "Skincare" }],
    brand: "Beauty Science",
    productImages: ["/products/vitamin-c-1.jpg", "/products/vitamin-c-2.jpg"],
    ingredients: "Water, Ascorbic Acid, Glycerin, Propylene Glycol",
    suitableFor: SuitableForType.ALL,
    reviews: [],
    salePercentage: 10,
    expiryDate: new Date("2025-12-31")
  },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const resolvedParams = use(params);
  const product = demoProducts.find(p => p._id === resolvedParams.id);
  const { addToCart, items } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success('Added to cart successfully!', {
        duration: 2000,
        icon: '🛒',
      });
    }
  };

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isInCart = items.some(item => item.product._id === product?._id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800">{product.productName}</span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images Section */}
            <div className="md:w-1/2 p-6">
              {/* Main Image */}
              <div className="relative h-[500px] rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.productImages[selectedImageIndex]}
                  alt={product.productName}
                  fill
                  className="object-contain"
                  priority
                />
                {product.salePercentage && product.salePercentage > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full">
                    -{product.salePercentage}%
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all
                      ${selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.productName} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="md:w-1/2 p-8">
              {/* Basic Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {product.category[0].name}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
                <p className="text-gray-600 text-lg">{product.brand}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                {product.salePercentage && product.salePercentage > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-red-500">
                        ${(product.price * (1 - product.salePercentage / 100)).toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Save ${(product.price * (product.salePercentage / 100)).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{product.productDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Ingredients</h3>
                    <p className="text-gray-600">{product.ingredients}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Suitable For</h3>
                    <p className="text-gray-600">{product.suitableFor}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Expiry Date</h3>
                    <p className="text-gray-600">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Stock</h3>
                    <p className="text-gray-600">{product.stock} units</p>
                  </div>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 border-r hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                        className="w-16 text-center px-3 py-2"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 border-l hover:bg-gray-100"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-3 px-6 rounded-lg transition-colors ${
                        isInCart 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 
                        ? 'Out of Stock' 
                        : isInCart 
                          ? 'Add More to Cart' 
                          : 'Add to Cart'
                      }
                    </button>
                    {isInCart && (
                      <p className="text-green-600 text-sm text-center">
                        ✓ This item is in your cart
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}