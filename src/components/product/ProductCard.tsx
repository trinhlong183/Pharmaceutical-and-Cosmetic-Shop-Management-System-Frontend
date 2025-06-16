import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";

interface ProductCardProps {
  productId: string;
  productName: string;
  price: number;
  productImages: string[];
  brand: string;
  category: Category[];
  productDescription?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  price,
  productImages,
  brand,
  category,
  productDescription = "",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group border border-indigo-50">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={productImages[0] || "/placeholder-product.jpg"}
          alt={productName || "Product Image"}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
          {category && category.length > 0 ? (
            category.map((cat) => (
              <span
                key={cat._id}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full px-2.5 py-1 text-xs font-medium shadow-sm"
              >
                {cat.categoryName}
              </span>
            ))
          ) : (
            <span className="bg-gray-200 text-gray-700 rounded-full px-2.5 py-1 text-xs font-medium">
              No Category
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-sm font-medium text-indigo-600 mb-1">{brand}</span>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-800 group-hover:text-indigo-700 transition-colors">
          {productName}
        </h3>
        {productDescription && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {productDescription}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          <span className="font-bold text-xl text-gray-800">
            ${price.toFixed(2)}
          </span>
          <Link href={`/products/${productId}`}>
            <span className="sr-only">View details for {productName}</span>
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-sm">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
