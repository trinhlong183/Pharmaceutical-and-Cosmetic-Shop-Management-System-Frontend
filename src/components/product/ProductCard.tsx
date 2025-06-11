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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={productImages[0] || "/placeholder-product.jpg"}
          alt={productName || "Product Image"}
          // width={500}
          // height={500}
          fill
          unoptimized
          className="object-cover hover:scale-105 transition-transform duration-300"
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
          {category && category.length > 0 ? (
            category.map((cat) => (
              <span
                key={cat._id}
                className="bg-primary text-white rounded-full px-2 py-1 text-xs"
              >
                {cat.categoryName}
              </span>
            ))
          ) : (
            <span className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs">
              No Category
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-sm text-gray-500 mb-1">{brand}</span>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {productName}
        </h3>
        {productDescription && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {productDescription}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-bold text-xl">${price}</span>
          <Link
            href={`/products/${productId}`}
            className="text-primary hover:underline"
          >
            <span className="sr-only">View details for {productName}</span>
            <button className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
