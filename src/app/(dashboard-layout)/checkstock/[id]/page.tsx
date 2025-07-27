"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import productService from "@/api/productService";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  Info,
  Tag,
  Building2,
} from "lucide-react";
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";

type Batch = {
  itemId: string;
  batchNumber: string;
  stock: number;
  expiryDate: string;
  price: number;
  daysUntilExpiry: number;
  inventoryLogInfo: {
    _id: string;
    action: string;
    createdAt: string;
  };
};

function formatVND(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}

const CheckStock = () => {
  const params = useParams();
  const productId = params?.id as string;
  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    // Gọi song song cả hai API
    Promise.all([
      productService.getProductBatchById(productId),
      productService.getProductById(productId),
    ]).then(([batchData, productData]) => {
      setBatches(batchData.batches || []);
      setTotalStock(batchData.totalStock || 0);
      setProduct(productData || null);
      setLoading(false);
    });
  }, [productId]);

  return (
    <RoleRoute allowedRoles={[Role.STAFF, Role.ADMIN]}>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">
              Loading product details...
            </span>
          </div>
        ) : (
          <>
            {/* Product Details Card */}
            {product && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-2xl text-blue-900">
                    Product Information
                  </CardTitle>
                </CardHeader>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Package className="h-4 w-4 mr-2" />
                  Total Stock: {totalStock}
                </Badge>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Images */}
                    <div className="lg:col-span-1">
                      <div className="space-y-4">
                        {/* Main Image Display */}
                        {product.productImages &&
                        product.productImages.length > 0 ? (
                          <div className="relative h-64 w-full rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={product.productImages[selectedImageIndex]}
                              alt={product.productName}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        {/* Thumbnail Grid - Clickable */}
                        {product.productImages &&
                          product.productImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                              {product.productImages.map((image, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedImageIndex(index)}
                                  className={`relative h-16 w-full rounded-lg overflow-hidden transition-all ${
                                    selectedImageIndex === index
                                      ? "ring-2 ring-blue-500 ring-offset-2"
                                      : "border border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  <Image
                                    src={image}
                                    alt={`${product.productName} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {product.productName}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            ID: {""}
                            {product.id || product._id}
                          </Badge>
                          <Badge variant="outline">
                            <Building2 className="h-3 w-3 mr-1" />
                            Brand: {product.brand}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      {product.productDescription && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Description
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {product.productDescription}
                          </p>
                        </div>
                      )}

                      {/* Product Specs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              Price
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatVND(product.price)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              Weight
                            </span>
                            <span className="text-sm text-gray-900">
                              {product.weight
                                ? `${product.weight}g`
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {product.expiryDate && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">
                                Default Expiry
                              </span>
                              <span className="text-sm text-gray-900">
                                {new Date(
                                  product.expiryDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {product.suitableFor && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">
                                Suitable For
                              </span>
                              <span className="text-sm text-gray-900">
                                {product.suitableFor}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              Sale
                            </span>
                            <Badge className="bg-red-100 text-red-700">
                              {product.salePercentage}% OFF
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {product.ingredients && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.ingredients && (
                            <div className="bg-amber-50 rounded-lg p-4">
                              <h4 className="font-semibold text-amber-900 mb-2">
                                Ingredients
                              </h4>
                              <p className="text-amber-800 text-sm">
                                {product.ingredients}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Batch Management Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl text-green-900 flex items-center">
                  <Package className="h-6 w-6 mr-3" />
                  Batch Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {batches.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 mb-2">
                      No batches found
                    </p>
                    <p className="text-gray-400">
                      This product has no inventory batches yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Batch Number
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Import Price
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Expiry Date
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Imported
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {batches.map((batch, index) => {
                          const isExpiringSoon = batch.daysUntilExpiry <= 30;
                          const isExpired = batch.daysUntilExpiry <= 0;
                          const isLowStock = batch.stock <= 5;

                          return (
                            <tr
                              key={batch.itemId}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 font-mono">
                                      {batch.batchNumber}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {batch.itemId.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge
                                  className={`${
                                    isLowStock
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {batch.stock} units
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatVND(batch.price)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="text-sm text-gray-900 mb-1">
                                    {new Date(
                                      batch.expiryDate
                                    ).toLocaleDateString()}
                                  </div>
                                  <Badge
                                    className={`text-xs ${
                                      isExpired
                                        ? "bg-red-100 text-red-800"
                                        : batch.daysUntilExpiry <= 7
                                        ? "bg-red-100 text-red-700"
                                        : batch.daysUntilExpiry <= 30
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {batch.daysUntilExpiry} days
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  {isExpired && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Expired
                                    </Badge>
                                  )}
                                  {!isExpired && isExpiringSoon && (
                                    <Badge className="bg-amber-100 text-amber-800 text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Expiring Soon
                                    </Badge>
                                  )}
                                  {isLowStock && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                      Low Stock
                                    </Badge>
                                  )}
                                  {!isExpired &&
                                    !isExpiringSoon &&
                                    !isLowStock && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Good
                                      </Badge>
                                    )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm text-gray-900">
                                  {new Date(
                                    batch.inventoryLogInfo.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    batch.inventoryLogInfo.createdAt
                                  ).toLocaleTimeString()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Batches
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {batches.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Expiring Soon
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {
                          batches.filter(
                            (b) =>
                              b.daysUntilExpiry <= 30 && b.daysUntilExpiry > 0
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Expired
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {batches.filter((b) => b.daysUntilExpiry <= 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatVND(
                          batches.reduce(
                            (sum, batch) => sum + batch.stock * batch.price,
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </RoleRoute>
  );
};

export default CheckStock;
