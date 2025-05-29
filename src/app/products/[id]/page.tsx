'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Product } from "@/types/product";
import { toast } from 'react-hot-toast';
import { useCart } from "@/contexts/CartContext";
import { productService } from "@/api/productService";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addToCart, items } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productService.getProductById(resolvedParams.id);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    
    try {
      setAdding(true);
      await addToCart(product, quantity);
      toast.success('Added to cart successfully!', {
        duration: 2000,
        icon: '🛒',
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const isInCart = items.some(item => item.product.id === product?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
          <span className="text-gray-800">{product?.productName}</span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images Section */}
            <div className="md:w-1/2 p-6">
              {/* Main Image */}
              <div className="relative h-[500px] rounded-lg overflow-hidden mb-4">
                {product?.productImages?.[selectedImageIndex] && (
                  <Image
                    src={product.productImages[selectedImageIndex]}
                    alt={product.productName}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
                {product?.salePercentage > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full">
                    -{product.salePercentage}%
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product?.productImages?.map((image, index) => (
                  <button
                    key={`image-${index}`}
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
                  {product?.category.map((cat, index) => (
                    <span 
                      key={`category-${index}`}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product?.productName}</h1>
                <p className="text-gray-600 text-lg">{product?.brand}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                {product.salePercentage > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-red-500">
                        ${((product.price * (100 - product.salePercentage)) / 100).toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Save ${((product.price * product.salePercentage) / 100).toFixed(2)}
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
                      disabled={!product?.stock || adding}
                      className={`w-full py-3 px-6 rounded-lg transition-colors ${
                        adding ? 'bg-gray-400' :
                        product?.stock === 0 ? 'bg-gray-400' :
                        'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {adding ? 'Adding...' :
                       product?.stock === 0 ? 'Out of Stock' :
                       'Add to Cart'}
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