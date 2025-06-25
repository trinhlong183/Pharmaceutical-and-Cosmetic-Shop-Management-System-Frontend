"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { productService } from "@/api/productService";
import { categoriesService } from "@/api/categoriesService";
import { reviewService } from "@/api/reviewService";
import { useRouter } from "next/navigation";
import AddToCart from "@/components/product/AddToCart";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import {
  ChevronRight,
  Star,
  Truck,
  Calendar,
  ShieldCheck,
  Package2,
  HeartIcon,
  Share2,
  ShoppingCart,
  Check,
  AlertCircle,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import ReviewDialog from "@/components/reviewDialog";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { user } = useUser();

  // Fetch reviews for the product
  const fetchReviews = async (productId: string) => {
    if (!productId) return;

    setReviewsLoading(true);
    try {
      // Get all reviews for the product
      const allReviews = await reviewService.getAllReviews({
        productId,
        userId: "",
      });

      let userSpecificReview = null;
      let otherReviews = allReviews || [];

      // If user is logged in, check for their specific review
      if (user?.id) {
        try {
          const userReviewData = await reviewService.getAllReviews({
            productId,
            userId: user.id,
          });

          if (userReviewData && userReviewData.length > 0) {
            userSpecificReview = userReviewData[0];
            // Remove user's review from other reviews to avoid duplication
            otherReviews = allReviews.filter(
              (review: any) => review.userId !== user.id
            );
          }
        } catch (error) {
          console.log("No user review found");
        }
      }

      setUserReview(userSpecificReview);
      setReviews(otherReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        const productData = await productService.getProductById(
          resolvedParams.id
        );

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        // Fetch reviews for this product
        await fetchReviews(productData.id || productData._id);

        // If product has categories, fetch their details
        if (productData.category && productData.category.length > 0) {
          try {
            // Create a map to store category data
            const categoriesMap: Record<string, Category> = {};

            // Fetch each category
            for (const categoryId of productData.category) {
              if (typeof categoryId === "string") {
                const categoryData = await categoriesService.getCategoryById(
                  categoryId
                );
                if (categoryData) {
                  categoriesMap[categoryId] = categoryData;
                }
              }
            }

            setCategories(categoriesMap);
          } catch (error) {
            console.error("Error fetching categories:", error);
            // Continue showing the product even if categories can't be loaded
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [resolvedParams.id, router, user?.id]);

  // Format price to VND
  const formatVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate sale price if there's a discount
  const calculateSalePrice = (
    originalPrice: number,
    salePercentage: number | null
  ) => {
    if (!salePercentage) return originalPrice;
    return (originalPrice * (100 - salePercentage)) / 100;
  };

  // Handle review submission (create or update)
  const handleReviewSubmit = async (data: {
    rating: number;
    content: string;
  }) => {
    if (!user?.id || !product) return;

    try {
      const reviewData = {
        productId: product.id,
        rating: data.rating,
        content: data.content,
        userId: user.id,
      };

      if (userReview) {
        // Update existing review
        await reviewService.updateReview(
          userReview._id || userReview.id,
          reviewData
        );
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        const response = await reviewService.createReview(reviewData);
        console.log("Review created response:", response);
        if (response.errorCode === 400) {
          toast.error(response.message);
          return;
        }
        toast.success("Review submitted successfully!");
      }

      // Refresh reviews
      await fetchReviews(product.id);
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  // Handle review deletion
  const handleReviewDelete = async () => {
    if (!userReview || !product) return;

    try {
      await reviewService.deleteReview(userReview._id || userReview.id);
      toast.success("Review deleted successfully!");

      // Refresh reviews
      await fetchReviews(product.id || product._id);
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <ShoppingCart className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="mt-6 text-lg text-gray-600">
          Loading product details...
        </span>
        <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-md max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the product you're looking for.
          </p>
          <Link href="/products">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render individual review
  const renderReview = (review: any, isUserReview = false) => (
    <div
      key={review._id || review.id}
      className={`p-4 rounded-lg border ${
        isUserReview ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
      }`}
    >
      {isUserReview && (
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-blue-100 text-blue-700 text-xs">
            Your Review
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReviewDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-auto p-1"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {review.userName?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">
              {review.userName || "Anonymous"}
            </p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 text-sm">{review.content}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link
            href="/products"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-[180px] sm:max-w-xs">
            {product.productName}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-0">
            {/* Product Images Section */}
            <div className="lg:col-span-2 p-4 md:p-6 lg:border-r border-gray-100">
              <div className="sticky top-8">
                {/* Main Image */}
                <div className="relative h-[400px] sm:h-[500px] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.productImages && product.productImages.length > 0 ? (
                    <Image
                      src={product.productImages[selectedImageIndex]}
                      alt={product.productName}
                      fill
                      className="object-contain"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  {product.salePercentage && product.salePercentage > 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">
                      {product.salePercentage}% OFF
                    </div>
                  )}

                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">
                      Only {product.stock} left
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.productImages && product.productImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.productImages.map((image, index) => (
                      <button
                        key={`image-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 rounded-lg overflow-hidden transition-all ${
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

                {/* Action buttons - visibile on mobile only */}
                <div className="flex items-center space-x-2 mt-4 md:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <HeartIcon
                      className={`h-5 w-5 mr-1.5 ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-5 w-5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="lg:col-span-3 p-4 md:p-8">
              <div>
                {/* Categories & Brand */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Show categories */}
                  {product.category &&
                    product.category.map((categoryId, index) => (
                      <Badge
                        key={`category-${index}`}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {categories[categoryId as string]?.categoryName ||
                          "Category"}
                      </Badge>
                    ))}

                  {/* Brand badge */}
                  <Badge variant="outline" className="border-gray-200">
                    {product.brand}
                  </Badge>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.productName}
                </h1>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (product.averageRating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.averageRating
                      ? `${product.averageRating.toFixed(1)} (${
                          product.reviewCount || 0
                        } reviews)`
                      : "No reviews yet"}
                  </span>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  {product.salePercentage && product.salePercentage > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatVND(
                            calculateSalePrice(
                              product.price,
                              product.salePercentage
                            )
                          )}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {formatVND(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                          You save{" "}
                          {formatVND(
                            product.price * (product.salePercentage / 100)
                          )}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {formatVND(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock status */}
                <div className="mb-6">
                  <div className="flex items-center">
                    {product.stock > 0 ? (
                      <>
                        <Check className="h-5 w-5 text-green-500 mr-1.5" />
                        <span className="text-green-700 font-medium">
                          In Stock
                        </span>
                        <span className="ml-1 text-gray-600">
                          ({product.stock} available)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500 mr-1.5" />
                        <span className="text-red-700 font-medium">
                          Out of Stock
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Add to Cart and Action Buttons */}
                <div className="flex flex-col gap-4 mb-8">
                  <AddToCart
                    productId={product.id || product._id}
                    disabled={product.stock <= 0}
                  />

                  {/* Desktop action buttons */}
                  <div className="hidden md:flex items-center space-x-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <HeartIcon
                        className={`h-5 w-5 ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      {isFavorite ? "Saved to Wishlist" : "Add to Wishlist"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Delivery & Returns Info */}
                <div className="space-y-4 bg-blue-50 rounded-xl p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Free delivery
                      </p>
                      <p className="text-sm text-gray-600">
                        For orders above $50
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Returns
                      </p>
                      <p className="text-sm text-gray-600">
                        30 day return policy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Secure Payment
                      </p>
                      <p className="text-sm text-gray-600">
                        SSL encrypted checkout
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Details Tabs */}
                <div>
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="reviews">
                        Reviews{" "}
                        {product.reviewCount ? `(${product.reviewCount})` : ""}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="description"
                      className="p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="text-gray-700 prose max-w-none">
                        <p>{product.productDescription}</p>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="details"
                      className="p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="space-y-4">
                        {product.ingredients && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                              Ingredients
                            </h3>
                            <p className="text-gray-600">
                              {product.ingredients}
                            </p>
                          </div>
                        )}

                        {product.suitableFor && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                              Suitable For
                            </h3>
                            <p className="text-gray-600">
                              {product.suitableFor}
                            </p>
                          </div>
                        )}

                        {product.usage && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                              Usage Instructions
                            </h3>
                            <p className="text-gray-600">{product.usage}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                              Weight
                            </h3>
                            <p className="text-gray-600">
                              {product.weight
                                ? `${product.weight}g`
                                : "Not specified"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-medium text-gray-700">
                              Expiry Date
                            </h3>
                            <p className="text-gray-600">
                              {product.expiryDate
                                ? new Date(
                                    product.expiryDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="reviews"
                      className="p-4 bg-gray-50 rounded-xl"
                    >
                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">
                            Loading reviews...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Overall Rating Summary */}
                          <div className="flex items-center">
                            <span className="text-3xl font-bold mr-2">
                              {product.averageRating?.toFixed(1) || "0.0"}
                            </span>
                            <div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= (product.averageRating || 0)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-500">
                                {(userReview ? 1 : 0) + reviews.length} reviews
                              </p>
                            </div>
                          </div>

                          <Separator />

                          {/* Reviews List */}
                          {userReview || reviews.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {/* User's review first (if exists) */}
                              {userReview && renderReview(userReview, true)}

                              {/* Other reviews */}
                              {reviews.map((review) => renderReview(review))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500 mb-4">
                                No reviews yet
                              </p>
                              {user && (
                                <Button
                                  variant="outline"
                                  onClick={() => setReviewDialogOpen(true)}
                                >
                                  Be the first to review
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Add/Edit Review Button for logged in users */}
                          {user && (
                            <div className="pt-4 border-t">
                              <Button
                                className="w-full"
                                onClick={() => setReviewDialogOpen(true)}
                              >
                                {userReview
                                  ? "Edit Your Review"
                                  : "Write a Review"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Dialog */}
        <ReviewDialog
          open={reviewDialogOpen}
          review={userReview}
          onOpenChange={setReviewDialogOpen}
          onSubmit={handleReviewSubmit}
          onDelete={handleReviewDelete}
        />
      </div>
    </div>
  );
}
