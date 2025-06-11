'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Product } from "@/types/product";
import { toast } from 'react-hot-toast';
import { productService } from "@/api/productService";
import { categoriesService } from "@/api/categoriesService";
import { useRouter } from 'next/navigation';
import AddToCart from '@/components/product/AddToCart';
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        const productData = await productService.getProductById(resolvedParams.id);
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        setProduct(productData);
        
        // If product has categories, fetch their details
        if (productData.category && productData.category.length > 0) {
          try {
            // Create a map to store category data
            const categoriesMap: Record<string, Category> = {};
            
            // Fetch each category
            for (const categoryId of productData.category) {
              if (typeof categoryId === 'string') {
                const categoryData = await categoriesService.getCategoryById(categoryId);
                if (categoryData) {
                  categoriesMap[categoryId] = categoryData;
                }
              }
            }
            
            setCategories(categoriesMap);
          } catch (error) {
            console.error('Error fetching categories:', error);
            // Continue showing the product even if categories can't be loaded
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [resolvedParams.id, router]);

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
          <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  // Format price to VND
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calculate sale price if there's a discount
  const calculateSalePrice = (originalPrice: number, salePercentage: number | null) => {
    if (!salePercentage) return originalPrice;
    return originalPrice * (100 - salePercentage) / 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-gray-600 hover:text-blue-600">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.productName}</span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images Section */}
            <div className="md:w-1/2 p-6">
              {/* Main Image */}
              <div className="relative h-[500px] rounded-lg overflow-hidden mb-4">
                {product.productImages && product.productImages.length > 0 ? (
                  <Image
                    src={product.productImages[selectedImageIndex]}
                    alt={product.productName}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                {product.salePercentage && product.salePercentage > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white">
                    -{product.salePercentage}%
                  </Badge>
                )}
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.productImages && product.productImages.length > 0 ? (
                  product.productImages.map((image, index) => (
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
                  ))
                ) : (
                  <div className="col-span-4 text-center py-4 text-gray-500">
                    No product images available
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="md:w-1/2 p-8">
              {/* Basic Info */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Show categories if available */}
                  {product.category && product.category.map((categoryId, index) => (
                    <Badge 
                      key={`category-${index}`}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                    >
                      {categories[categoryId as string]?.categoryName || 'Category'}
                    </Badge>
                  ))}
                  
                  {/* Stock status */}
                  <Badge 
                    variant="outline" 
                    className={`${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                    }`}
                  >
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
                <p className="text-gray-600 text-lg">Brand: {product.brand}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                {product.salePercentage ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-red-500">
                        {formatVND(calculateSalePrice(product.price, product.salePercentage))}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {formatVND(product.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Save: {formatVND(product.price * (product.salePercentage / 100))}
                    </p>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatVND(product.price)}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Product Description</h2>
                  <p className="text-gray-600">{product.productDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Ingredients</h3>
                    <p className="text-gray-600 text-sm mt-1">{product.ingredients}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Suitable For</h3>
                    <p className="text-gray-600 text-sm mt-1">{product.suitableFor}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Expiry Date</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(product.expiryDate).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Reviews</h3>
                    <div className="flex items-center text-sm mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (product.averageRating || 0) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">
                        {product.averageRating ? `${product.averageRating.toFixed(1)}/5` : 'No reviews yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="mt-8">
                <AddToCart productId={product.id || product._id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}