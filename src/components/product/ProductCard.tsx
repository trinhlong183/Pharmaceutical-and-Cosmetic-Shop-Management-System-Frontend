import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  productId: string;
  productName: string;
  price: number;
  productImages: string[];
  brand: string;
  category: Category[];
  productDescription?: string;
  salePercentage?: number;
  stock?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  price,
  productImages,
  brand,
  category,
  productDescription = "",
  salePercentage = 0,
  stock,
}) => {
  const { addToCart } = useCart();

  const finalPrice =
    salePercentage && salePercentage > 0
      ? price * (1 - salePercentage / 100)
      : price;

  const formatVND = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-indigo-50 group">
      {/* Image & Badges */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Link href={`/products/${productId}`} className="block w-full h-full">
          {productImages && productImages.length > 0 ? (
            <Image
              src={productImages[0]}
              alt={productName}
              fill
              unoptimized
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M16 12h.01M12 16h.01"
                />
              </svg>
            </div>
          )}
        </Link>
        {/* Badges */}
        {salePercentage > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow z-10">
            -{salePercentage}% OFF
          </div>
        )}
        {typeof stock === "number" && stock < 10 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow z-10">
            Low Stock
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
            {brand}
          </span>
          <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium ml-2">
            {category && category.length > 0
              ? typeof category[0] === "string"
                ? category[0]
                : category[0]?.categoryName || "Uncategorized"
              : "Uncategorized"}
          </span>
        </div>
        {/* Product Name */}
        <Link href={`/products/${productId}`}>
          <h3 className="font-bold text-lg text-gray-900 truncate mb-1 group-hover:text-indigo-700 transition-colors">
            {productName}
          </h3>
        </Link>
        {/* Description */}
        {productDescription && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {productDescription}
          </p>
        )}
        {/* Price & Actions */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100 gap-2">
          <div>
            {salePercentage > 0 ? (
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  {formatVND(finalPrice)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatVND(price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {formatVND(price)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/products/${productId}`} className="flex-1">
              <button className="w-18 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-1 rounded-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 text-xs font-medium shadow-sm">
                View Details
              </button>
            </Link>
            <button
              type="button"
              className="flex items-center text-black p-1 rounded-md hover:bg-gray-100 transition-all duration-300 text-sm font-medium shadow-sm"
              title="Add to cart"
              onClick={() => addToCart(productId)}
            >
              <FiShoppingCart className="mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
