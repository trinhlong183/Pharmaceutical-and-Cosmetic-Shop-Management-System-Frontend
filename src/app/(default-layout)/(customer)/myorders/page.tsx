"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { userService, User } from "@/api/userService";
import { orderService, Order as ApiOrder } from "@/api/orderService";
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
import ShipmentTracking from "@/components/ShipmentTracking";
import OrderShippingTracker from "@/components/OrderShippingTracker";
import ConfirmReceiptDialog from "@/components/ConfirmReceiptDialog";
import { StatusBadge } from "@/components/order/StatusBadge";
import { shippingLogsService, ShippingLog, ShippingStatus } from "@/api/shippingLogsService";
import ReviewDialog from "@/components/reviewDialog";

// Interface for Order Item based on shipping log API response
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  productImage?: string;
  brand?: string;
  description?: string;
  category?: string[];
}

// Interface for Order from orderService API
interface Order {
  id: string;
  _id: string;
  userId: any;
  transactionId: any;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  rejectionReason?: string;
  refundReason?: string;
  processedBy?: string;
  notes?: string;
}

// Interface for Order based on shipping log API response
interface OrderFromShippingLog {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for Customer based on shipping log API response
interface CustomerInfo {
  id: string;
  email: string;
  phone: string;
  address: string;
}

// Interface for Transaction based on shipping log API response
interface TransactionInfo {
  id: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

// Extended Shipping Log interface based on API response
interface ExtendedShippingLog {
  id: string;
  status: string; // "Processing", "Shipped", "Delivered", etc.
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  productSummary: string;
  itemCount: number;
  totalQuantity: number;
  order: OrderFromShippingLog;
  customer: CustomerInfo;
  transaction: TransactionInfo;
  items: OrderItem[];
  // Additional optional fields
  trackingNumber?: string;
  carrier?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export default function MyOrdersPage() {
  const [shippingLogs, setShippingLogs] = useState<ShippingLog[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
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

  // Function to refresh shipping logs data
  const refreshShippingLogs = async () => {
    try {
      console.log("Refreshing shipping logs...");
      const data = await shippingLogsService.getAll();
      console.log("Shipping logs data:", data);
      
      // Filter shipping logs for current user (assuming customer info is available)
      const userShippingLogs = data.filter((log: ShippingLog) => 
        log.customer?.email === user?.email
      );
      
      setShippingLogs(userShippingLogs);
    } catch (error) {
      console.error("Error refreshing shipping logs:", error);
      toast.error("Failed to refresh shipping data");
    }
  };

  // Function to load user orders
  const loadUserOrders = async () => {
    try {
      console.log("Loading user orders...");
      const userOrders = await orderService.getCurrentUserOrders();
      console.log("User orders:", userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading user orders:", error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        
        // Load both orders and shipping logs in parallel
        const [userOrders, shippingLogsData] = await Promise.all([
          orderService.getCurrentUserOrders(),
          shippingLogsService.getAll()
        ]);
        
        console.log("User orders:", userOrders);
        console.log("Raw shipping logs data:", shippingLogsData);
        
        // Set orders
        setOrders(userOrders);
        
        // Filter shipping logs for current user based on customer email
        const userShippingLogs = shippingLogsData.filter((log: ShippingLog) => 
          log.customer?.email === user?.email
        );
        
        console.log("Filtered shipping logs for user:", userShippingLogs);
        setShippingLogs(userShippingLogs);
      } catch (err) {
        console.error("Error loading data:", err);
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

    // Only load if user is available
    if (user?.email) {
      loadData();
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast.error("Please login to view your orders");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Lấy review của user cho từng sản phẩm khi mở chi tiết đơn hàng đã giao
  useEffect(() => {
    fetchReviews();
  }, [expandedOrder, shippingLogs]);

  const fetchReviews = async () => {
    if (!expandedOrder) return;

    const shippingLog = shippingLogs.find((log) => log.id === expandedOrder);
    if (!shippingLog || !['delivered', 'received'].includes(shippingLog.status?.toLowerCase() || '')) return;

    const userId = user?.id;

    for (const item of shippingLog.items || []) {
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
            [item.productId!]: myReview,
          }));
        } catch (error) {
          console.error(
            `Failed to fetch review for product ${item.productId}:`,
            error
          );
          setProductReviews((prev) => ({
            ...prev,
            [item.productId!]: null,
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

  // Function to refresh all shipping logs
  const refreshAllShippingLogs = async () => {
    try {
      setLoading(true);
      
      // Load both orders and shipping logs in parallel
      const [userOrders, shippingLogsData] = await Promise.all([
        orderService.getCurrentUserOrders(),
        shippingLogsService.getAll()
      ]);
      
      console.log("Refreshed user orders:", userOrders);
      console.log("Refreshed shipping logs data:", shippingLogsData);
      
      // Set orders
      setOrders(userOrders);
      
      // Filter shipping logs for current user based on customer email
      const userShippingLogs = shippingLogsData.filter((log: ShippingLog) => 
        log.customer?.email === user?.email
      );
      
      console.log("Refreshed filtered shipping logs for user:", userShippingLogs);
      setShippingLogs(userShippingLogs);
      
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (shippingLogId: string) => {
    setExpandedOrder(expandedOrder === shippingLogId ? null : shippingLogId);
  };

  // Function to open confirmation dialog
  const openConfirmReceiptDialog = (shippingLogId: string) => {
    setSelectedOrderToConfirm(shippingLogId);
    setReceiptDialogOpen(true);
  };
  
  // Function to handle order receipt confirmation
  const confirmReceipt = async () => {
    if (!selectedOrderToConfirm) return;
    
    try {
      setConfirmingReceipt(selectedOrderToConfirm);
      
      // Find the shipping log and update its status to "received"
      const shippingLogToUpdate = shippingLogs.find(log => log.id === selectedOrderToConfirm);
      if (!shippingLogToUpdate) {
        throw new Error("Shipping log not found");
      }

      // Call API to update shipping log status to "Received"
      await shippingLogsService.updateStatus(selectedOrderToConfirm, {
        status: ShippingStatus.RECEIVED,
        notes: "Order receipt confirmed by customer",
        actualDelivery: new Date().toISOString()
      });

      // Update local state to reflect the change
      setShippingLogs(logs => logs.map(log => 
        log.id === selectedOrderToConfirm 
          ? {...log, status: ShippingStatus.RECEIVED} 
          : log
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

  // Filter shipping logs by status
  const pendingLogs = shippingLogs.filter(log => log.order?.status?.toLowerCase() === "pending");
  const approvedLogs = shippingLogs.filter(log => log.order?.status?.toLowerCase() === "approved");
  const deliveredLogs = shippingLogs.filter(log => log.status?.toLowerCase() === "delivered");
  const receivedLogs = shippingLogs.filter(log => log.status?.toLowerCase() === "received");
  const refundedLogs = shippingLogs.filter(log => log.order?.status?.toLowerCase() === "refunded");
  const rejectedLogs = shippingLogs.filter(log => log.order?.status?.toLowerCase() === "rejected");

  // Get orders from orders API by status
  const pendingOrders = orders.filter(order => order.status?.toLowerCase() === "pending");
  const rejectedOrders = orders.filter(order => order.status?.toLowerCase() === "rejected");
  const refundedOrders = orders.filter(order => order.status?.toLowerCase() === "refunded");

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
      ) : shippingLogs.length === 0 ? (
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
                All ({shippingLogs.length + pendingOrders.length + rejectedOrders.length + refundedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-yellow-700 flex-grow">
                Pending ({pendingLogs.length + pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-blue-700 flex-grow">
                Approved ({approvedLogs.length})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-green-700 flex-grow">
                Delivered ({deliveredLogs.length})
              </TabsTrigger>
              <TabsTrigger value="received" className="text-emerald-700 flex-grow">
                Received ({receivedLogs.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-red-700 flex-grow">
                Rejected ({rejectedLogs.length + rejectedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="refunded" className="text-emerald-700 flex-grow">
                Refunded ({refundedLogs.length + refundedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="space-y-6">
                {pendingOrders.length > 0 && <PendingOrdersList orders={pendingOrders} />}
                {rejectedOrders.length > 0 && <RejectedOrdersList orders={rejectedOrders} />}
                {refundedOrders.length > 0 && <RefundedOrdersList orders={refundedOrders} />}
                <ShippingLogList shippingLogs={shippingLogs} />
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingLogs.length > 0 || pendingOrders.length > 0 ? (
                <div className="space-y-6">
                  {pendingOrders.length > 0 && <PendingOrdersList orders={pendingOrders} />}
                  <ShippingLogList shippingLogs={pendingLogs} />
                </div>
              ) : (
                <EmptyState message="No pending orders at the moment" />
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              {approvedLogs.length > 0 ? (
                <ShippingLogList shippingLogs={approvedLogs} />
              ) : (
                <EmptyState message="No approved orders at the moment" />
              )}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-6">
              {deliveredLogs.length > 0 ? (
                <ShippingLogList shippingLogs={deliveredLogs} />
              ) : (
                <EmptyState message="No delivered orders yet" />
              )}
            </TabsContent>

            <TabsContent value="received" className="space-y-6">
              {receivedLogs.length > 0 ? (
                <ShippingLogList shippingLogs={receivedLogs} />
              ) : (
                <EmptyState message="No received orders yet" />
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejectedLogs.length > 0 || rejectedOrders.length > 0 ? (
                <div className="space-y-6">
                  {rejectedOrders.length > 0 && <RejectedOrdersList orders={rejectedOrders} />}
                  <ShippingLogList shippingLogs={rejectedLogs} />
                </div>
              ) : (
                <EmptyState message="No rejected orders" />
              )}
            </TabsContent>
            
            <TabsContent value="refunded" className="space-y-6">
              {refundedLogs.length > 0 || refundedOrders.length > 0 ? (
                <div className="space-y-6">
                  {refundedOrders.length > 0 && <RefundedOrdersList orders={refundedOrders} />}
                  <ShippingLogList shippingLogs={refundedLogs} />
                </div>
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

  function PendingOrdersList({ orders }: { orders: ApiOrder[] }) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Orders (Awaiting Processing)</h3>
        {orders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden border hover:border-gray-200 transition-all duration-300 hover:shadow-md border-yellow-200"
          >
            <div className="bg-yellow-50 px-6 py-3 flex items-center gap-3 border-b border-yellow-100">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  This order is awaiting confirmation. We'll process it shortly.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Submitted on: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-yellow-50 items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{order.id.slice(-6)}
                    <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="font-medium">
                      {order.items?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(order.totalAmount || 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
        <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">{message}</p>
      </div>
    );
  }

  function ShippingLogList({ shippingLogs }: { shippingLogs: ShippingLog[] }) {
    return (
      <div className="space-y-6">
        {shippingLogs.map((shippingLog) => (
          <Card
            key={shippingLog.id}
            className={`overflow-hidden border hover:border-gray-200 transition-all duration-300 hover:shadow-md ${
              shippingLog.order?.status?.toLowerCase() === "refunded"
                ? "border-emerald-200"
                : shippingLog.order?.status?.toLowerCase() === "rejected"
                ? "border-red-200"
                : "border-gray-100"
            }`}
          >
            {shippingLog.order?.status?.toLowerCase() === "pending" && (
              <div className="bg-yellow-50 px-6 py-3 flex items-center gap-3 border-b border-yellow-100">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    This order is awaiting confirmation. We'll process it
                    shortly.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Submitted on: {formatDate(shippingLog.order?.createdAt || shippingLog.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>
            )}
            {shippingLog.order?.status?.toLowerCase() === "refunded" && (
              <div className="bg-emerald-50 px-6 py-3 flex items-center gap-3 border-b border-emerald-100">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    This order has been refunded. Your payment has been
                    returned.
                  </p>
                </div>
              </div>
            )}
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center">
                  <span className="text-xl">
                    {shippingLog.status?.toLowerCase() === 'received' ? '✅' :
                     shippingLog.status?.toLowerCase() === 'delivered' ? '📦' :
                     shippingLog.status?.toLowerCase() === 'intransit' ? '🚛' :
                     shippingLog.status?.toLowerCase() === 'shipped' ? '🚚' :
                     shippingLog.status?.toLowerCase() === 'processing' ? '📦' : '⏳'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{shippingLog.order?.id?.slice(-6) || shippingLog.id?.slice(-6)}
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        shippingLog.status?.toLowerCase() === 'received'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : shippingLog.status?.toLowerCase() === 'delivered' 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : shippingLog.status?.toLowerCase() === 'intransit'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : shippingLog.status?.toLowerCase() === 'shipped'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : shippingLog.status?.toLowerCase() === 'processing'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {shippingLog.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(shippingLog.order?.createdAt || shippingLog.createdAt || new Date().toISOString())}
                    </div>
                    <div className="font-medium">
                      {shippingLog.itemCount || shippingLog.items?.length || 0} items
                    </div>
                    {/* Show tracking number if available */}
                    {shippingLog.trackingNumber && (
                      <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                        <Package className="h-3 w-3" />
                        <span className="font-mono">{shippingLog.trackingNumber}</span>
                      </div>
                    )}
                    {/* Show progress indicator based on status */}
                    <div className="flex items-center gap-1 text-xs">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                            style={{ 
                              width: `${
                                shippingLog.status?.toLowerCase() === 'received' ? 100 :
                                shippingLog.status?.toLowerCase() === 'delivered' ? 85 :
                                shippingLog.status?.toLowerCase() === 'shipped' ? 75 :
                                shippingLog.status?.toLowerCase() === 'intransit' ? 60 :
                                shippingLog.status?.toLowerCase() === 'processing' ? 40 :
                                shippingLog.order?.status?.toLowerCase() === 'approved' ? 20 :
                                shippingLog.order?.status?.toLowerCase() === 'pending' ? 10 : 0
                              }%` 
                            }}
                          />
                        </div>
                        <span>
                          {shippingLog.status?.toLowerCase() === 'received' ? 100 :
                           shippingLog.status?.toLowerCase() === 'delivered' ? 85 :
                           shippingLog.status?.toLowerCase() === 'shipped' ? 75 :
                           shippingLog.status?.toLowerCase() === 'intransit' ? 60 :
                           shippingLog.status?.toLowerCase() === 'processing' ? 40 :
                           shippingLog.order?.status?.toLowerCase() === 'approved' ? 20 :
                           shippingLog.order?.status?.toLowerCase() === 'pending' ? 10 : 0}%
                        </span>
                      </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(shippingLog.totalAmount || 0)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleOrderExpand(shippingLog.id!)}
                >
                  {expandedOrder === shippingLog.id ? (
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

            {expandedOrder === shippingLog.id && (
              <CardContent className="p-0">
                <div className="p-6 border-t border-gray-100 space-y-6">
                  {/* Custom Timeline Section - Simple version without OrderTimeline component */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Order Progress
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">Current Status:</span>
                        <Badge className={`${
                          shippingLog.status?.toLowerCase() === 'delivered' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : shippingLog.status?.toLowerCase() === 'intransit'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : shippingLog.status?.toLowerCase() === 'shipped'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : shippingLog.status?.toLowerCase() === 'processing'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {shippingLog.status}
                        </Badge>
                      </div>
                      {shippingLog.updatedAt && (
                        <p className="text-sm text-blue-700">
                          Last updated: {formatDate(shippingLog.updatedAt)}
                        </p>
                      )}
                      {shippingLog.currentLocation && (
                        <p className="text-sm text-blue-700 mt-1">
                          Current location: {shippingLog.currentLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Tracker */}
                  {(['processing', 'shipped', 'intransit', 'delivered', 'received'].includes(shippingLog.status?.toLowerCase() || '')) && (
                    <div className="space-y-4 mb-6">
                      <OrderShippingTracker 
                        shippingLog={shippingLog} 
                        loading={false}
                        onRefresh={refreshShippingLogs}
                      />
                      
                      {/* Show received confirmation for received orders */}
                      {shippingLog.status?.toLowerCase() === 'received' && (
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <div>
                              <h4 className="font-medium text-emerald-800">
                                Order Received
                              </h4>
                              <p className="text-sm text-emerald-700 mt-1">
                                Thank you for confirming receipt of your order!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Confirm Receipt button for delivered orders */}
                      {shippingLog.status?.toLowerCase() === 'delivered' && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
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
                              onClick={() => openConfirmReceiptDialog(shippingLog.id!)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={!!confirmingReceipt}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {confirmingReceipt === shippingLog.id ? 'Confirming...' : 'Confirm Receipt'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Order Items Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Order Items
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {(shippingLog.items || []).map((item, idx) => (
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
                                Product: {item.productName}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Unit Price:
                              </div>
                              <div>{formatCurrency(item.price || 0)}</div>
                              <div className="font-semibold mt-1">
                                {formatCurrency((item.price || 0) * (item.quantity || 0))}
                              </div>
                              {/* Review section for delivered and received items */}
                              {['delivered', 'received'].includes(shippingLog.status?.toLowerCase() || '') && (
                                <div className="mt-4 flex flex-col items-end">
                                  {!productReviews[item.productId!] ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() =>
                                        setReviewDialog({
                                          open: true,
                                          productId: item.productId!,
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
                                              length: productReviews[item.productId!]?.rating || 0,
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
                                          {productReviews[item.productId!]?.content}
                                        </span>
                                        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                          <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-100"
                                            title="Edit review"
                                            onClick={() =>
                                              setReviewDialog({
                                                open: true,
                                                productId: item.productId!,
                                                review: productReviews[item.productId!],
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
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>{formatCurrency(shippingLog.totalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Shipping:</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 font-semibold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(shippingLog.totalAmount || 0)}</span>
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

  function RejectedOrdersList({ orders }: { orders: ApiOrder[] }) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rejected Orders</h3>
        {orders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden border hover:border-gray-200 transition-all duration-300 hover:shadow-md border-red-200"
          >
            <div className="bg-red-50 px-6 py-3 flex items-center gap-3 border-b border-red-100">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  This order has been rejected.
                </p>
                {order.rejectionReason && (
                  <p className="text-xs text-red-700 mt-1">
                    Reason: {order.rejectionReason}
                  </p>
                )}
                <p className="text-xs text-red-700 mt-1">
                  Rejected on: {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-red-50 items-center justify-center">
                  <span className="text-xl">❌</span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{order.id.slice(-6)}
                    <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">
                      Rejected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="font-medium">
                      {order.items?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(order.totalAmount || 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  function RefundedOrdersList({ orders }: { orders: ApiOrder[] }) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Refunded Orders</h3>
        {orders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden border hover:border-gray-200 transition-all duration-300 hover:shadow-md border-emerald-200"
          >
            <div className="bg-emerald-50 px-6 py-3 flex items-center gap-3 border-b border-emerald-100">
              <RefreshCw className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm text-emerald-800 font-medium">
                  This order has been refunded. Your payment has been returned.
                </p>
                {order.refundReason && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Reason: {order.refundReason}
                  </p>
                )}
                <p className="text-xs text-emerald-700 mt-1">
                  Refunded on: {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-emerald-50 items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{order.id.slice(-6)}
                    <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-200">
                      Refunded
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="font-medium">
                      {order.items?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Refunded Amount:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(order.totalAmount || 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
}