"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { orderService, Order } from "@/api/orderService";
import { userService, User } from "@/api/userService";
import { reviewService } from "@/api/reviewService";
import {
  Package,
  ShoppingBag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  TruckIcon,
  Box,
  XCircle,
  ArrowRight,
  Calendar,
  RefreshCw,
  Star,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import ReviewDialog from "@/components/ReviewDialog";
import ShipmentTracking from "@/components/ShipmentTracking";
import ConfirmReceiptDialog from "@/components/ConfirmReceiptDialog";
import { StatusBadge } from "@/components/order/StatusBadge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { useOrdersWithShipping } from "@/hooks/useOrderStatus";
import { shippingLogsService, ShippingLog } from "@/api/shippingLogsService";

// Extend the OrderItem interface to match actual data structure
interface ExtendedOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productDetails?: {
    productName?: string;
    price?: number;
    id?: string;
  };
  quantity: number;
  price: number;
  productName?: string;
  productImage?: string;
  subtotal?: number;
}

// Extend the Order interface to match actual data structure
interface ExtendedOrder
  extends Omit<Order, "items" | "userId" | "processedBy"> {
  _id?: string;
  userId:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
      };
  items: ExtendedOrderItem[];
  processedBy?:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
      };
  shippingAddress?: string;
  contactPhone?: string;
  itemCount?: number;
  totalQuantity?: number;
  rejectionReason?: string; // Reason for rejection
  refundReason?: string; // Reason for refund
  refundedAt?: string; // When the refund was processed
  notes?: string; // Additional notes
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processedByUsers, setProcessedByUsers] = useState<
    Record<string, User>
  >({});
  const [productReviews, setProductReviews] = useState<Record<string, any>>({});
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    productId: string | null;
    review?: any;
  }>({ open: false, productId: null });
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedOrderToConfirm, setSelectedOrderToConfirm] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useUser();

  // Use the unified status hook for managing orders with shipping
  const { getOrderStatus, isLoading: shippingLoading } = useOrdersWithShipping(orders, true);

  // Helper function to get processor name from either object or ID
  const getProcessorName = (
    processedBy:
      | string
      | { _id?: string; id?: string; name?: string; email?: string }
  ) => {
    // If processedBy is an object with name, use it directly
    if (typeof processedBy === "object" && processedBy.name) {
      return processedBy.name;
    }

    // Get the ID
    let id: string | undefined;
    if (typeof processedBy === "string") {
      id = processedBy;
    } else if (processedBy._id) {
      id = processedBy._id;
    } else if (processedBy.id) {
      id = processedBy.id;
    }

    // If we have the user information in our state
    if (id && processedByUsers[id]) {
      return processedByUsers[id].fullName;
    }

    // Fallback
    return typeof processedBy === "string"
      ? `Staff ID: ${processedBy.slice(0, 8)}...`
      : `Staff ID: ${(processedBy._id || processedBy.id || "Unknown").slice(
          0,
          8
        )}...`;
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await orderService.getCurrentUserOrders();
        // Cast data to ExtendedOrder type
        setOrders(data as unknown as ExtendedOrder[]);
      } catch (err) {
        console.error("Error loading orders:", err);
        if (
          err instanceof Error &&
          err.message.includes("Authentication token is missing")
        ) {
          setIsAuthenticated(false);
        } else {
          setError("Failed to load orders. Please try again later.");
          toast.error("Failed to load orders");
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast.error("Please login to view your orders");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch processor details when order is expanded
  useEffect(() => {
    if (!expandedOrder) return;

    const currentOrder = orders.find((order) => order.id === expandedOrder);
    if (!currentOrder || !currentOrder.processedBy) return;

    // Extract processedBy ID
    let processedById: string | undefined;

    if (typeof currentOrder.processedBy === "string") {
      processedById = currentOrder.processedBy;
    } else if (currentOrder.processedBy._id) {
      processedById = currentOrder.processedBy._id;
    } else if (currentOrder.processedBy.id) {
      processedById = currentOrder.processedBy.id;
    }

    // If we have an ID and we haven't fetched this user yet
    if (processedById && !processedByUsers[processedById]) {
      // Set a loading state for this user
      setProcessedByUsers((prev) => ({
        ...prev,
        [processedById!]: {
          _id: processedById!,
          fullName: "Loading...",
          email: "",
        } as User,
      }));

      // Fetch user details
      userService
        .getUserById(processedById)
        .then((userData) => {
          setProcessedByUsers((prev) => ({
            ...prev,
            [processedById!]: userData,
          }));
        })
        .catch((err) => {
          console.error(`Failed to fetch user ${processedById}:`, err);
          // Set an error state for this user
          setProcessedByUsers((prev) => ({
            ...prev,
            [processedById!]: {
              _id: processedById!,
              fullName: `User ${processedById?.slice(0, 8)}...`,
              email: "",
            } as User,
          }));
        });
    }
  }, [expandedOrder, orders, processedByUsers]);

  // Lấy review của user cho từng sản phẩm khi mở chi tiết đơn hàng đã giao
  useEffect(() => {
    fetchReviews();
  }, [expandedOrder, orders]);

  const fetchReviews = async () => {
    if (!expandedOrder) return;

    const order = orders.find((o) => o.id === expandedOrder);
    if (!order || order.status.toLowerCase() !== "delivered") return;

    const userId = user?.id;

    for (const item of order.items) {
      if (!item.productId || !userId) continue;
      if (!productReviews[item.productId]) {
        try {
          const res = await reviewService.getAllReviews({
            productId: item.productId,
            userId,
          });
          // Handle both direct array response and nested data response
          const reviewsArray = Array.isArray(res) ? res : res?.data || [];
          const myReview = reviewsArray.length > 0 ? reviewsArray[0] : null;
          setProductReviews((prev) => ({
            ...prev,
            [item.productId]: myReview,
          }));
        } catch (error) {
          console.error(
            `Failed to fetch review for product ${item.productId}:`,
            error
          );
          setProductReviews((prev) => ({
            ...prev,
            [item.productId]: null,
          }));
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Function to open confirmation dialog
  const openConfirmReceiptDialog = (orderId: string) => {
    setSelectedOrderToConfirm(orderId);
    setReceiptDialogOpen(true);
  };
  
  // Function to handle order receipt confirmation
  const confirmReceipt = async () => {
    if (!selectedOrderToConfirm) return;
    
    try {
      setConfirmingReceipt(selectedOrderToConfirm);
      await orderService.updateOrderStatus(selectedOrderToConfirm, "received");
      
      // Update local state
      setOrders(orders.map(order => 
        (order.id === selectedOrderToConfirm || order._id === selectedOrderToConfirm) 
          ? {...order, status: "received"} 
          : order
      ));
      
      toast.success("Thank you for confirming your order receipt!");
      setReceiptDialogOpen(false);
    } catch (error) {
      console.error("Failed to confirm order receipt:", error);
      toast.error("Failed to confirm receipt. Please try again.");
    } finally {
      setConfirmingReceipt(null);
    }
  };

  // Filter orders by unified status for better customer experience
  const getFilteredOrdersByUnifiedStatus = (targetDisplayStatus: string) => {
    return orders.filter(order => {
      const { unifiedStatus } = getOrderStatus(order);
      return unifiedStatus.displayStatus === targetDisplayStatus;
    });
  };

  // Customer-friendly grouped orders
  const pendingOrders = orders.filter(order => order.status.toLowerCase() === "pending");
  const processingOrders = getFilteredOrdersByUnifiedStatus("shipping"); // All shipping statuses
  const approvedOrders = orders.filter(order => order.status.toLowerCase() === "approved");
  const shippingOrders = orders.filter(order => 
    ["shipped", "shipping", "processing", "in_transit"].includes(order.status.toLowerCase())
  );
  const inTransitOrders = orders.filter(order => 
    order.status.toLowerCase() === "in_transit" || order.status.toLowerCase() === "in transit"
  );
  const deliveredOrders = getFilteredOrdersByUnifiedStatus("delivered"); // Delivered and received
  const receivedOrders = orders.filter(order => order.status.toLowerCase() === "received");
  const returnedOrders = orders.filter(order => order.status.toLowerCase() === "returned");
  const refundedOrders = orders.filter(order => order.status.toLowerCase() === "refunded");
  const cancelledOrders = orders.filter(order =>
    ["cancelled", "canceled"].includes(order.status.toLowerCase())
  );
  const rejectedOrders = orders.filter(order => order.status.toLowerCase() === "rejected");

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          My Orders
        </h1>
        <p className="text-gray-600 mb-6">
          Track and manage all your orders in one place
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/products">
            <Button variant="secondary" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Package className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="mt-6 text-lg text-gray-600">
            Loading your orders...
          </span>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <div className="text-xl font-medium text-gray-900 mb-2">
            Sorry, something went wrong
          </div>
          <div className="text-gray-500 mb-6 max-w-md mx-auto">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Orders Yet
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't placed any orders yet. Start shopping to see
            your orders here!
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-6 h-auto text-lg">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {" "}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex flex-wrap gap-2 mb-6">
              <TabsTrigger value="all" className="flex-grow">
                All ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-yellow-700 flex-grow">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="text-blue-700 flex-grow">
                Processing ({processingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-blue-700 flex-grow">
                Approved ({approvedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="shipping" className="text-purple-700 flex-grow">
                Shipping ({shippingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="intransit" className="text-indigo-700 flex-grow">
                In Transit ({inTransitOrders.length})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-green-700 flex-grow">
                Delivered ({deliveredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="received" className="text-emerald-700 flex-grow">
                Received ({receivedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="returned" className="text-amber-700 flex-grow">
                Returned ({returnedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-red-700 flex-grow">
                Rejected ({rejectedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-gray-700 flex-grow">
                Cancelled ({cancelledOrders.length})
              </TabsTrigger>
              <TabsTrigger value="refunded" className="text-emerald-700 flex-grow">
                Refunded ({refundedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <OrderList orders={orders} />
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingOrders.length > 0 ? (
                <OrderList orders={pendingOrders} />
              ) : (
                <EmptyState message="No pending orders at the moment" />
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              {approvedOrders.length > 0 ? (
                <OrderList orders={approvedOrders} />
              ) : (
                <EmptyState message="No approved orders at the moment" />
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejectedOrders.length > 0 ? (
                <OrderList orders={rejectedOrders} />
              ) : (
                <EmptyState message="No rejected orders" />
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-6">
              {cancelledOrders.length > 0 ? (
                <OrderList orders={cancelledOrders} />
              ) : (
                <EmptyState message="No cancelled orders" />
              )}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-6">
              {deliveredOrders.length > 0 ? (
                <OrderList orders={deliveredOrders} />
              ) : (
                <EmptyState message="No delivered orders yet" />
              )}
            </TabsContent>

            <TabsContent value="processing" className="space-y-6">
              {processingOrders.length > 0 ? (
                <OrderList orders={processingOrders} />
              ) : (
                <EmptyState message="No orders currently being processed" />
              )}
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              {shippingOrders.length > 0 ? (
                <OrderList orders={shippingOrders} />
              ) : (
                <EmptyState message="No orders currently being shipped" />
              )}
            </TabsContent>

            <TabsContent value="intransit" className="space-y-6">
              {inTransitOrders.length > 0 ? (
                <OrderList orders={inTransitOrders} />
              ) : (
                <EmptyState message="No orders currently in transit" />
              )}
            </TabsContent>
            
            <TabsContent value="received" className="space-y-6">
              {receivedOrders.length > 0 ? (
                <OrderList orders={receivedOrders} />
              ) : (
                <EmptyState message="No received orders" />
              )}
            </TabsContent>

            <TabsContent value="returned" className="space-y-6">
              {returnedOrders.length > 0 ? (
                <OrderList orders={returnedOrders} />
              ) : (
                <EmptyState message="No returned orders" />
              )}
            </TabsContent>
            
            <TabsContent value="refunded" className="space-y-6">
              {refundedOrders.length > 0 ? (
                <OrderList orders={refundedOrders} />
              ) : (
                <EmptyState message="No refunded orders" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
      {/* Move ReviewDialog here - outside the order expansion area */}
      <ReviewDialog
        open={reviewDialog.open}
        review={reviewDialog.review}
        onOpenChange={(open) => setReviewDialog((prev) => ({ ...prev, open }))}
        onSubmit={async (data) => {
          if (!reviewDialog.productId) return;

          try {
            if (reviewDialog.review) {
              await reviewService.updateReview(
                reviewDialog.review._id || reviewDialog.review.id,
                {
                  productId: reviewDialog.productId,
                  rating: data.rating,
                  content: data.content,
                  userId: user?.id,
                }
              );
              toast.success("Review updated!");
            } else {
              await reviewService.createReview({
                productId: reviewDialog.productId,
                rating: data.rating,
                content: data.content,
                userId: user?.id,
              });
              toast.success("Review submitted!");
            }

            // Reload review with proper error handling
            try {
              const res = await reviewService.getAllReviews({
                productId: reviewDialog.productId,
                userId: user?.id,
              });

              // Handle both direct array response and nested data response
              const reviewsArray = Array.isArray(res) ? res : res?.data || [];
              const myReview = reviewsArray.length > 0 ? reviewsArray[0] : null;

              setProductReviews((prev) => ({
                ...prev,
                [reviewDialog.productId!]: myReview,
              }));
            } catch (fetchError) {
              console.error("Failed to fetch updated review:", fetchError);
              // Force a re-fetch of all reviews for the expanded order
              setTimeout(() => {
                fetchReviews();
              }, 500);
            }

            setReviewDialog({ open: false, productId: null });
          } catch (err) {
            console.error("Review operation failed:", err);
            toast.error("Failed to submit review");
          }
        }}
        onDelete={async () => {
          if (!reviewDialog.productId || !reviewDialog.review) return;
          try {
            await reviewService.deleteReview(
              reviewDialog.review._id || reviewDialog.review.id
            );
            setProductReviews((prev) => ({
              ...prev,
              [reviewDialog.productId!]: null,
            }));
            toast.success("Review deleted!");
            setReviewDialog({ open: false, productId: null });
          } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error("Failed to delete review");
          }
        }}
      />

      {/* Confirm Receipt Dialog */}
      <ConfirmReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        onConfirm={confirmReceipt}
        isLoading={!!confirmingReceipt}
      />
    </div>
  );

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
        <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">{message}</p>
      </div>
    );
  }

  function OrderList({ orders }: { orders: ExtendedOrder[] }) {
    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={`overflow-hidden border hover:border-gray-200 transition-all duration-300 hover:shadow-md ${
              order.status.toLowerCase() === "refunded"
                ? "border-emerald-200"
                : order.status.toLowerCase() === "rejected"
                ? "border-red-200"
                : "border-gray-100"
            }`}
          >
            {order.status.toLowerCase() === "pending" && (
              <div className="bg-yellow-50 px-6 py-3 flex items-center gap-3 border-b border-yellow-100">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    This order is awaiting confirmation. We'll process it
                    shortly.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Submitted on: {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            )}
            {order.status.toLowerCase() === "refunded" && (
              <div className="bg-emerald-50 px-6 py-3 flex items-center gap-3 border-b border-emerald-100">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    This order has been refunded. Your payment has been
                    returned.
                  </p>
                  {order.refundedAt && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Refunded on: {formatDate(order.refundedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const { unifiedStatus, shippingLog } = getOrderStatus(order);
                  return (
                    <>
                      <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center">
                        <span className="text-xl">{unifiedStatus.icon}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          Order #{order.id.slice(-6)}
                          <StatusBadge 
                            orderStatus={order.status} 
                            shippingLog={shippingLog}
                            isCustomerView={true}
                            variant="customer"
                            className="ml-2"
                          />
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="font-medium">
                            {order.items.length} items
                          </div>
                          {/* Show progress indicator */}
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                style={{ width: `${(unifiedStatus.stage / 7) * 100}%` }}
                              />
                            </div>
                            <span>{Math.round((unifiedStatus.stage / 7) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>
                      Details <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Details <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {expandedOrder === order.id && (
              <CardContent className="p-0">
                <div className="p-6 border-t border-gray-100 space-y-6">
                  {/* Order Timeline Section */}
                  {(() => {
                    const { shippingLog } = getOrderStatus(order);
                    return (
                      <OrderTimeline
                        orderStatus={order.status}
                        shippingLog={shippingLog}
                        createdAt={order.createdAt}
                        isCustomerView={true}
                      />
                    );
                  })()}

                  {/* Shipment Tracking for applicable orders */}
                  {['approved', 'processing', 'shipped', 'shipping', 'in_transit', 'delivered'].includes(order.status.toLowerCase()) && (
                    <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                      <h3 className="font-medium flex items-center gap-2">
                        <TruckIcon className="h-4 w-4" />
                        Shipment Tracking
                      </h3>
                      {/* Extract and validate orderId safely before passing it to the component */}
                      {(() => {
                        const orderId = order.id || order._id || '';
                        if (orderId && typeof orderId === 'string' && orderId.trim() !== '') {
                          try {
                            return <ShipmentTracking orderId={orderId} />;
                          } catch (error) {
                            console.error('Error rendering ShipmentTracking:', error);
                            return (
                              <div className="text-red-600 bg-red-50 p-4 rounded-md text-sm">
                                Unable to load tracking information: {error instanceof Error ? error.message : 'Unknown error'}
                              </div>
                            );
                          }
                        } else {
                          return (
                            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-md text-sm">
                              Unable to load tracking information: Missing or invalid order ID
                            </div>
                          );
                        }
                      })()}
                      
                      
                      {/* Confirm Receipt button - check unified status */}
                      {(() => {
                        const { unifiedStatus } = getOrderStatus(order);
                        return unifiedStatus.displayStatus === "delivered" && order.status.toLowerCase() === "delivered" && (
                          <div className="mt-4 bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-800 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Order Delivered
                                </h4>
                                <p className="text-sm text-green-700 mt-1">
                                  Please confirm that you've received your order in good condition.
                                </p>
                              </div>
                              <Button 
                                onClick={() => openConfirmReceiptDialog(order.id || order._id || '')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Receipt
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  {/* Order Items Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Order Items
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative">
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName || "Product"}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400 m-auto" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                Product:{" "}
                                {item.productDetails?.productName ||
                                  item.productName}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Unit Price:
                              </div>
                              <div>{formatCurrency(item.price)}</div>
                              <div className="font-semibold mt-1">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              {/* Đánh giá sản phẩm nếu đã giao - check unified status */}
                              {(() => {
                                const { unifiedStatus } = getOrderStatus(order);
                                return unifiedStatus.displayStatus === "delivered" && (
                                  <div className="mt-4 flex flex-col items-end">
                                    {!productReviews[item.productId] ? (
                                      // Nếu chưa review, hiển thị nút tạo review như cũ
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() =>
                                          setReviewDialog({
                                            open: true,
                                            productId: item.productId,
                                            review: undefined,
                                          })
                                        }
                                      >
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        Review
                                      </Button>
                                    ) : (
                                      <div className="group relative w-full flex flex-col items-end">
                                        <div className="mt-1 text-xs text-gray-600 text-left w-full flex items-center justify-end gap-2">
                                          <span className="flex items-center gap-1">
                                            {Array.from(
                                              {
                                                length:
                                                  productReviews[item.productId]
                                                    ?.rating || 0,
                                              },
                                              (_, i) => (
                                                <Star
                                                  key={i}
                                                  className="h-3 w-3 text-yellow-400 fill-yellow-400"
                                                />
                                              )
                                            )}
                                          </span>
                                          <span>
                                            {
                                              productReviews[item.productId]
                                                ?.content
                                            }
                                          </span>
                                          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button
                                              type="button"
                                              className="p-1 rounded hover:bg-gray-100"
                                              title="Edit review"
                                              onClick={() =>
                                                setReviewDialog({
                                                  open: true,
                                                  productId: item.productId,
                                                  review:
                                                    productReviews[
                                                      item.productId
                                                    ],
                                                })
                                              }
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zM17.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                                  fill="#f59e42"
                                                />
                                              </svg>
                                            </button>
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>{" "}
                  {/* Pending Information - Show only if order is pending */}
                  {order.status.toLowerCase() === "pending" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Order Status
                      </h3>
                      <div className="bg-yellow-50 rounded-lg p-4 text-yellow-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Awaiting Confirmation
                          </Badge>
                        </div>

                        <p className="text-sm mb-3">
                          Your order has been received and is currently being
                          reviewed. We'll notify you once it's confirmed and
                          begins processing.
                        </p>

                        <div className="mt-3 text-xs text-yellow-700 flex items-center gap-1">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z"
                              fill="#ca8a04"
                            />
                          </svg>
                          <span>
                            Orders are typically confirmed within 24 hours
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z"
                              fill="#2563EB"
                            />
                          </svg>
                          <span className="font-medium">
                            Need to modify your order?
                          </span>
                        </div>
                        <p>
                          You can still modify or cancel your order while it's
                          pending. Contact our support team for assistance.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Rejection Information - Show only if order is rejected */}
                  {order.status.toLowerCase() === "rejected" &&
                    order.rejectionReason && (
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Rejection Information
                        </h3>
                        <div className="bg-red-50 rounded-lg p-4 text-red-800">
                          <div className="font-medium mb-1">
                            Rejection Reason:
                          </div>
                          <p className="text-sm">{order.rejectionReason}</p>
                          {order.processedBy && (
                            <div className="text-xs text-red-600 mt-2">
                              Processed by:{" "}
                              {getProcessorName(order.processedBy)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  {/* Refund Information - Show only if order is refunded */}
                  {order.status.toLowerCase() === "refunded" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-emerald-500" />
                        Refund Information
                      </h3>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-emerald-800">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            Payment Refunded
                          </Badge>
                          {order.refundedAt && (
                            <div className="text-xs text-emerald-700">
                              Refunded on: {formatDate(order.refundedAt)}
                            </div>
                          )}
                        </div>

                        {order.refundReason && (
                          <>
                            <div className="font-medium mb-1">
                              Refund Reason:
                            </div>
                            <p className="text-sm mb-3">{order.refundReason}</p>
                          </>
                        )}

                        {order.rejectionReason && (
                          <>
                            <div className="font-medium mb-1">
                              Original Rejection Reason:
                            </div>
                            <p className="text-sm">{order.rejectionReason}</p>
                          </>
                        )}

                        {order.notes && (
                          <>
                            <div className="font-medium mb-1 mt-3">
                              Additional Notes:
                            </div>
                            <p className="text-sm">{order.notes}</p>
                          </>
                        )}

                        {order.processedBy && (
                          <div className="text-xs text-emerald-600 mt-3 pt-3 border-t border-emerald-100">
                            Processed by: {getProcessorName(order.processedBy)}
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z"
                              fill="#2563EB"
                            />
                          </svg>
                          <span className="font-medium">
                            Refund Information
                          </span>
                        </div>
                        <p>
                          Your payment has been successfully refunded. Please
                          allow 3-5 business days for the refund to appear in
                          your account.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Shipping:</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 font-semibold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 -mx-6 -mb-6 p-6 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">
                        Need help with this order?
                      </div>
                      <div className="text-sm text-gray-500">
                        Contact our support team
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Contact Support <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  }
}
