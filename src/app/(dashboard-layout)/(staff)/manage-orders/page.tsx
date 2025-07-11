"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  Eye,
  RefreshCw,
  Loader2,
  Package2,
  CheckCircle2,
  TruckIcon,
  XCircle,
} from "lucide-react";
import { orderService } from "@/api/orderService";
import { userService } from "@/api/userService";
import { shippingLogsService, ShippingLog } from "@/api/shippingLogsService";
import {
  getUnifiedStatus,
  getAvailableStatusTransitions,
  formatStatusForDisplay,
  hasShippingInfo,
  StatusConfigurations,
} from "@/utils/statusUtils";

// Define interfaces for our data structures - Updated to match new API response
interface User {
  _id: string;
  email: string;
  phone: string;
  address: string;
  name?: string;
  fullName?: string;
  [key: string]: any;
}

interface Transaction {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentDetails: {
    userId: string;
    cartId: string;
    ipAddr: string;
    selectedProductIds: string[];
    bankCode: string;
    cardType: string;
    transactionNo: string;
    payDate: string;
    responseCode: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OrderItem {
  productId:
    | string
    | { id?: string; _id?: string; name?: string; [key: string]: any };
  price: number;
  quantity: number;
  [key: string]: any;
}

// Updated Order interface to match the new API response structure
interface Order {
  _id: string;
  id: string;
  userId: User; // Now always populated as an object
  transactionId: Transaction; // Now always populated as an object
  status: string;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  items?: OrderItem[];
  rejectionReason?: string;
  refundReason?: string;
  processedBy?: string;
  notes?: string;
  [key: string]: any;
}

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [shippingLogs, setShippingLogs] = useState<Record<string, ShippingLog>>({});
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailShippingLog, setDetailShippingLog] = useState<ShippingLog | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add state for validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Add state for current refund form data
  const [refundFormData, setRefundFormData] = useState({
    refundReason: "",
    note: "",
  });

  // Add state to track if a refund operation is in progress
  const [isRefunding, setIsRefunding] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders(activeTab, searchTerm);
    }
  }, [orders, activeTab, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orders = await orderService.getAllOrders();
      console.log("Orders received:", orders);
      
      // Cast to our local Order type since the API returns populated objects
      const typedOrders = orders as unknown as Order[];
      setOrders(typedOrders);
      setFilteredOrders(typedOrders);

      // Since user data is now populated in the API response, we don't need to fetch it separately
      // Only fetch shipping logs for each order
      await fetchShippingLogs(typedOrders);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingLogs = async (orders: Order[]) => {
    try {
      const shippingLogsMap: Record<string, ShippingLog> = {};

      // Fetch shipping logs for each order
      for (const order of orders) {
        const orderId = order.id || order._id;
        if (orderId) {
          try {
            const logs = await shippingLogsService.getByOrderId(orderId);
            if (logs && logs.length > 0) {
              // Use the most recent shipping log
              shippingLogsMap[orderId] = logs[logs.length - 1];
            }
          } catch (error) {
            console.log(`No shipping log found for order ${orderId}`);
            // This is expected for orders without shipping logs
          }
        }
      }

      setShippingLogs(shippingLogsMap);
    } catch (error) {
      console.error("Error fetching shipping logs:", error);
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filterOrders = (status: string, search: string) => {
    let filtered = [...orders];

    // Filter by status tab
    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status);
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderId = order.id || order._id || "";
        const customerName = getUserName(order.userId)?.toLowerCase() || "";

        return (
          orderId.toLowerCase().includes(searchLower) ||
          customerName.includes(searchLower)
        );
      });
    }

    setFilteredOrders(filtered);
  };

  // Get user name from userId - Updated for new API response structure
  const getUserName = (userId: User) => {
    if (!userId) return "N/A";
    
    // Since userId is now always a populated User object
    return userId.name || userId.fullName || userId.email || "N/A";
  };

  const handleViewDetail = async (orderId: string) => {
    try {
      const order = await orderService.getOrderById(orderId);
      console.log("Order details:", order);

      // Since user data is now populated in the API response, we don't need to fetch it separately

      // Get shipping log for detailed view
      let shippingLog = shippingLogs[orderId];
      if (!shippingLog) {
        try {
          const logs = await shippingLogsService.getByOrderId(orderId);
          if (logs && logs.length > 0) {
            shippingLog = logs[logs.length - 1];
            setShippingLogs(prev => ({
              ...prev,
              [orderId]: shippingLog
            }));
          }
        } catch (error) {
          console.log(`No shipping log found for order ${orderId}`);
        }
      }

      setDetailOrder(order as unknown as Order);
      setDetailShippingLog(shippingLog || null);
      setOpenDetails(true);
    } catch (error) {
      toast.error("Failed to get order details");
      console.error(error);
    }
  };

  const handleStatusChange = async (
    orderId: string | undefined,
    newStatus: string
  ) => {
    if (!orderId) return;
    
    // Find current order
    const currentOrder = orders.find(order => 
      (order.id === orderId || order._id === orderId)
    );
    
    if (!currentOrder) {
      toast.error("Order not found");
      return;
    }

    // If new status is "rejected", show dialog requesting reason
    if (newStatus === "rejected") {
      setProcessingOrderId(orderId);
      setOpenRejectDialog(true);
      return;
    }

    setStatusUpdating(true);
    try {
      // Always use updateOrderStatus API for all status changes
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      
      // If status is changed to "approved", automatically create shipping log
      if (newStatus === "approved") {
        try {
          const shippingLog = await shippingLogsService.createFromApprovedOrder(orderId);
          console.log("Shipping log created automatically:", shippingLog);
          
          // Update shipping logs state
          setShippingLogs(prev => ({
            ...prev,
            [orderId]: shippingLog
          }));
          
          toast.success("Order approved and shipping log created successfully!");
        } catch (shippingError) {
          console.error("Failed to create shipping log:", shippingError);
          toast.warning("Order approved but failed to create shipping log. You may need to create it manually.");
        }
      }
      
      // Update local orders state
      setOrders(
        orders.map((order) =>
          (order.id && order.id === orderId) ||
          (order._id && order._id === orderId)
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update the order details dialog if open
      if (
        detailOrder &&
        ((detailOrder.id && detailOrder.id === orderId) ||
          (detailOrder._id && detailOrder._id === orderId))
      ) {
        setDetailOrder({ ...detailOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating status:", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  // New unified status badge function
  const getStatusBadge = (orderId: string, orderStatus: string) => {
    // Simplified to only show order status directly
    const statusConfig = StatusConfigurations[orderStatus.toLowerCase()] || {
      displayText: orderStatus,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      icon: '📋',
      description: `Order status: ${orderStatus}`
    };
    
    return (
      <Badge
        variant="outline"
        className={`${statusConfig.bgColor} ${statusConfig.color} flex items-center`}
        title={statusConfig.description}
      >
        <span className="mr-1">{statusConfig.icon}</span>
        <span>{statusConfig.displayText}</span>
      </Badge>
    );
  };
  
  // Function to get available status options - Simplified to only allow 3 status changes
  const getAvailableStatuses = (orderId: string, currentStatus: string): string[] => {
    // Only allow these 3 status transitions for staff
    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return ['pending', 'approved', 'rejected'];
      case 'approved':
        return ['approved', 'rejected'];
      case 'rejected':
        return ['rejected'];
      case 'refunded':
        return ['refunded'];
      case 'delivered':
        return ['delivered'];
      default:
        return [currentStatus]; // Keep current status if not recognized
    }
  };

  const formatDate = (dateString: string) => {
    // Use consistent formatting to avoid hydration mismatch
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatDateOnly = (dateString: string) => {
    // Format only date part to avoid hydration mismatch
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Function to handle order rejection
  const handleRejectOrder = async (
    orderId: string,
    data: { rejectionReason: string; note?: string }
  ) => {
    if (!orderId) return;

    try {
      setProcessingOrderId(orderId);

      // Use orderService to reject the order
      await orderService.rejectOrder(orderId, {
        rejectionReason: data.rejectionReason,
        note: data.note,
      });

      toast.success("Order rejected successfully");
      // Refresh orders list
      fetchOrders();

      // Close dialog first after successful operation
      setOpenRejectDialog(false);
    } catch (error) {
      toast.error("Failed to reject order");
      console.error("Error rejecting order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };
  // Function to handle order refund based on API documentation
  const handleRefundOrder = async (
    orderId: string,
    data: { refundReason?: string; note?: string }
  ) => {
    if (!orderId) return;

    try {
      setProcessingOrderId(orderId);
      setIsRefunding(true);
      setValidationError(null);

      // Validate that the order is in rejected state before attempting refund
      const orderToRefund = orders.find(
        (order) => order.id === orderId || order._id === orderId
      );

      if (orderToRefund && orderToRefund.status !== "rejected") {
        setValidationError(
          "Order can only be refunded if it was previously rejected"
        );
        return;
      }

      // Use orderService to refund the order
      const refundedOrder = await orderService.refundOrder(orderId, {
        refundReason: data.refundReason,
        note: data.note,
      });

      toast.success("Order has been refunded successfully");

      // Update orders in state to reflect the change
      setOrders(
        orders.map((order) =>
          (order.id && order.id === orderId) ||
          (order._id && order._id === orderId)
            ? { ...order, status: "refunded", refundReason: data.refundReason }
            : order
        )
      );

      // If the order detail dialog is open and showing this order, update it
      if (
        detailOrder &&
        ((detailOrder.id && detailOrder.id === orderId) ||
          (detailOrder._id && detailOrder._id === orderId))
      ) {
        setDetailOrder({
          ...detailOrder,
          status: "refunded",
          refundReason: data.refundReason || detailOrder.refundReason,
        });
      }

      // Close refund dialog
      setOpenRefundDialog(false);

      // Clear refund form data
      setRefundFormData({
        refundReason: "",
        note: "",
      });
    } catch (error: any) {
      // Handle specific error types based on API documentation
      if (error.message && error.message.includes("409")) {
        toast.error("Order can only be refunded if it was previously rejected");
        setValidationError(
          "Order can only be refunded if it was previously rejected"
        );
      } else if (error.message && error.message.includes("401")) {
        toast.error("Your session has expired. Please login again");
      } else if (error.message && error.message.includes("403")) {
        toast.error("You don't have permission to perform this action");
      } else if (error.message && error.message.includes("404")) {
        toast.error("Order not found");
      } else {
        toast.error("Failed to refund order");
      }
      console.error("Error refunding order:", error);
    } finally {
      setProcessingOrderId(null);
      setIsRefunding(false);
    }
  };

  // Function to get product name (can be expanded if you store products)
  const getProductName = (
    productId: string | { id?: string; _id?: string; name?: string }
  ) => {
    if (!productId) return "Unknown Product";

    if (typeof productId === "object" && productId.name) {
      return productId.name;
    }

    return typeof productId === "object"
      ? productId._id || productId.id || "Unknown Product"
      : productId;
  };

  return (
    <div className="container mx-auto py-6 space-y-6" suppressHydrationWarning>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage customer orders from this dashboard
          </p>
        </div>
        <Button
          onClick={refreshOrders}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      
      {/* Workflow Diagram */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package2 className="h-4 w-4" /> Simplified Order Processing Workflow
          </CardTitle>
          <CardDescription>
            Staff can manage 3 status changes: Pending → Approved/Rejected. Orders track 5 statuses total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mt-2">
            {/* Progress line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
            
            {/* Workflow steps */}
            <div className="relative flex justify-between">
              {/* Step 1: Pending */}
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center">
                  <Package2 className="h-5 w-5 text-yellow-700" />
                </div>
                <span className="text-xs font-medium mt-1">Pending</span>
                <span className="text-xs text-muted-foreground">New Order</span>
              </div>
              
              {/* Step 2: Approved */}
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-xs font-medium mt-1">Approved</span>
                <span className="text-xs text-muted-foreground">Ready for shipping</span>
              </div>
              
              {/* Step 3: Delivered */}
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                </div>
                <span className="text-xs font-medium mt-1">Delivered</span>
                <span className="text-xs text-muted-foreground">Order completed</span>
              </div>
            </div>
          </div>
          
          {/* Rejection workflow */}
          <div className="mt-6 border-t pt-4">
            <div className="text-xs font-medium mb-2">Alternative Flows:</div>
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
              <span className="text-xs">→</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Refunded</Badge>
              <span className="text-xs text-muted-foreground ml-2">Orders can be refunded after rejection</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders && filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const orderId = order.id || order._id || "";
                          return (
                            <TableRow key={orderId}>
                              <TableCell className="font-medium">
                                {orderId.slice(0, 8)}...
                              </TableCell>
                              <TableCell>{getUserName(order.userId)}</TableCell>
                              <TableCell suppressHydrationWarning>
                                {isMounted
                                  ? formatDateOnly(order.createdAt)
                                  : ""}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatPrice(order.totalAmount)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(orderId, order.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      orderId && handleViewDetail(orderId)
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Details
                                  </Button>
                                  
                                  {order.status === 'rejected' && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => {
                                        setOpenRefundDialog(true);
                                        setProcessingOrderId(orderId);

                                        // Reset the refund form data
                                        setRefundFormData({
                                          refundReason: "",
                                          note: "",
                                        });

                                        // Reset any validation errors
                                        setValidationError(null);
                                      }}
                                      disabled={
                                        processingOrderId === orderId ||
                                        isRefunding
                                      }
                                      className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      Refund
                                    </Button>
                                  )}

                                  <Select
                                    disabled={statusUpdating}
                                    defaultValue={order.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(orderId, value)
                                    }
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailableStatuses(orderId, order.status).map(
                                        (status) => (
                                          <SelectItem
                                            key={status}
                                            value={status}
                                          >
                                            <div className="flex items-center">
                                              <span className="capitalize">
                                                {status}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No orders found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      {/* Order Details Dialog - Redesigned */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-[98vw] w-full max-h-[95vh] overflow-hidden flex flex-col px-[40px]">
          <DialogHeader className="flex-shrink-0 pb-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-primary">
                  Order Details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Order #
                  {detailOrder?.id?.slice(0, 8) ||
                    detailOrder?._id?.slice(0, 8)}{" "}
                  - Complete information
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                {detailOrder && getStatusBadge(
                  detailOrder.id || detailOrder._id || '', 
                  detailOrder.status
                )}
              </div>
            </div>
          </DialogHeader>

          {detailOrder && (
            <div className="flex-1 overflow-y-auto pt-4">
              {/* Order Overview Card */}
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-center">
                    <div className="min-w-0">
                      <div className="text-lg md:text-xl font-bold text-primary truncate">
                        {detailOrder.id?.slice(0, 8) ||
                          detailOrder._id?.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Order ID
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg md:text-xl font-bold text-green-600 truncate">
                        {formatPrice(detailOrder.totalAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Total Amount
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-semibold truncate">
                        {formatDate(detailOrder.createdAt).split(" ")[0]}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Order Date
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-semibold">
                        {detailOrder.items?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Items
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-semibold truncate">
                        {detailShippingLog ? 'Has Shipping' : 'Order Only'}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Status Type
                      </div>
                    </div>
                  </div>

                  {/* Additional info row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center mt-4 pt-4 border-t border-gray-200">
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-semibold truncate">
                        {getUserName(detailOrder.userId)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Customer
                      </div>
                    </div>
                    {detailOrder.transactionId && (
                      <div className="min-w-0">
                        <div className="text-sm md:text-base font-semibold truncate">
                          {typeof detailOrder.transactionId === "object"
                            ? detailOrder.transactionId.paymentMethod || "N/A"
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium mt-1">
                          Payment
                        </div>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-semibold truncate">
                        {formatDate(detailOrder.createdAt).split(" ")[1]}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Time
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Row 1: Customer Information */}
                <Card className="w-full">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">👤</span>
                      </div>
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Name:
                        </span>
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {getUserName(detailOrder.userId)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Email:
                        </span>
                        <span className="text-blue-600 hover:underline text-sm truncate">
                          {detailOrder.userId.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Phone:
                        </span>
                        <span className="font-mono text-sm truncate">
                          {detailOrder.userId.phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Address:
                        </span>
                        <span className="text-sm truncate">
                          {detailOrder.userId.address || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Customer ID:
                        </span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate">
                          {detailOrder.userId._id?.slice(0, 8) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Row 2: Shipping & Contact Information */}
                <Card className="w-full">
                  <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-green-900 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🚚</span>
                      </div>
                      Shipping & Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium text-xs">
                          Created Date:
                        </span>
                        <span className="font-semibold text-sm truncate">
                          {formatDate(detailOrder.createdAt)}
                        </span>
                      </div>
                      {detailOrder.shippingAddress && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">
                            Shipping Address:
                          </span>
                          <span className="text-sm truncate">
                            {detailOrder.shippingAddress}
                          </span>
                        </div>
                      )}
                      {detailOrder.contactPhone && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">
                            Contact Phone:
                          </span>
                          <span className="font-mono text-sm truncate">
                            {detailOrder.contactPhone}
                          </span>
                        </div>
                      )}
                      {detailOrder.notes && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">Notes:</span>
                          <span className="text-sm truncate">{detailOrder.notes}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Row 3: Transaction Information */}
                {detailOrder.transactionId && (
                  <Card className="w-full">
                    <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                      <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">💳</span>
                        </div>
                        Transaction Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">
                            Transaction ID:
                          </span>
                          <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded truncate">
                            {detailOrder.transactionId._id?.slice(0, 8) || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">
                            Payment Method:
                          </span>
                          <span className="font-semibold uppercase text-sm truncate">
                            {detailOrder.transactionId.paymentMethod || "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-muted-foreground font-medium text-xs">
                            Status:
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold w-fit ${
                              detailOrder.transactionId.status === "success"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : detailOrder.transactionId.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {detailOrder.transactionId.status}
                          </Badge>
                        </div>
                        {detailOrder.transactionId.paymentDetails?.bankCode && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Bank Code:
                            </span>
                            <span className="font-semibold text-blue-700 text-sm bg-blue-50 px-2 py-1 rounded border border-blue-200 truncate">
                              {detailOrder.transactionId.paymentDetails.bankCode}
                            </span>
                          </div>
                        )}
                        {detailOrder.transactionId.paymentDetails?.transactionNo && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Transaction No:
                            </span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate">
                              {detailOrder.transactionId.paymentDetails.transactionNo}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Row 4: Order Items */}
                <Card className="w-full">
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-purple-900 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">📦</span>
                      </div>
                      Order Items
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {detailOrder.items?.length || 0} items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {detailOrder.items && detailOrder.items.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto border-t">
                        <Table>
                          <TableHeader className="bg-gray-50 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="font-semibold text-gray-700 text-xs">
                                Product
                              </TableHead>
                              <TableHead className="text-right font-semibold text-gray-700 text-xs">
                                Price
                              </TableHead>
                              <TableHead className="text-center font-semibold text-gray-700 text-xs">
                                Qty
                              </TableHead>
                              <TableHead className="text-right font-semibold text-gray-700 text-xs">
                                Total
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailOrder.items.map((item, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="py-2">
                                  <div className="font-medium text-gray-900 text-xs">
                                    {getProductName(
                                      item.productDetails.productName
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-2">
                                  <span className="font-semibold text-blue-600 text-xs">
                                    {formatPrice(item.price)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <Badge
                                    variant="outline"
                                    className="font-bold text-xs px-2 py-0"
                                  >
                                    {item.quantity}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right py-2">
                                  <span className="font-bold text-green-600 text-xs">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <tfoot className="bg-gradient-to-r from-primary/10 to-primary/5 sticky bottom-0">
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-right font-bold text-sm py-3"
                              >
                                Total Amount:
                              </TableCell>
                              <TableCell className="text-right py-3">
                                <span className="font-bold text-lg text-primary">
                                  {formatPrice(detailOrder.totalAmount)}
                                </span>
                              </TableCell>
                            </TableRow>
                          </tfoot>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-gray-500 text-sm">
                          No items available
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Row 5: Rejection/Refund Information */}
                {(detailOrder.rejectionReason || detailOrder.refundReason) && (
                  <Card className="w-full border-orange-200">
                    <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                      <CardTitle className="text-base font-semibold text-orange-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⚠️</span>
                        </div>
                        {detailOrder.refundReason
                          ? "Refund Information"
                          : "Rejection Information"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {detailOrder.rejectionReason && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Rejection Reason:
                            </span>
                            <div className="text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200 text-sm break-words">
                              {detailOrder.rejectionReason}
                            </div>
                          </div>
                        )}
                        {detailOrder.refundReason && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Refund Reason:
                            </span>
                            <div className="text-orange-700 bg-orange-50 px-3 py-2 rounded border border-orange-200 text-sm break-words">
                              {detailOrder.refundReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Information Card */}
                {detailShippingLog && (
                  <Card className="w-full">
                    <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                      <CardTitle className="text-base font-semibold text-orange-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🚚</span>
                        </div>
                        Shipping Information
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {getUnifiedStatus(detailOrder.status, detailShippingLog).displayText}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {detailShippingLog.trackingNumber && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Tracking Number:
                            </span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded truncate">
                              {detailShippingLog.trackingNumber}
                            </span>
                          </div>
                        )}
                        
                        {detailShippingLog.carrier && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Carrier:
                            </span>
                            <span className="font-semibold text-sm truncate">
                              {detailShippingLog.carrier}
                            </span>
                          </div>
                        )}

                        {detailShippingLog.currentLocation && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Current Location:
                            </span>
                            <span className="text-sm truncate">
                              {detailShippingLog.currentLocation}
                            </span>
                          </div>
                        )}

                        {detailShippingLog.estimatedDelivery && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Estimated Delivery:
                            </span>
                            <span className="text-sm font-medium truncate">
                              {formatDate(detailShippingLog.estimatedDelivery)}
                            </span>
                          </div>
                        )}

                        {detailShippingLog.actualDelivery && (
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-muted-foreground font-medium text-xs">
                              Actual Delivery:
                            </span>
                            <span className="text-sm font-medium text-green-600 truncate">
                              {formatDate(detailShippingLog.actualDelivery)}
                            </span>
                          </div>
                        )}

                        {detailShippingLog.notes && (
                          <div className="flex flex-col gap-1 min-w-0 col-span-2">
                            <span className="text-muted-foreground font-medium text-xs">
                              Shipping Notes:
                            </span>
                            <span className="text-sm bg-blue-50 p-2 rounded border">
                              {detailShippingLog.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <Button
                variant="outline"
                onClick={() => setOpenDetails(false)}
                className="px-6 py-2 font-semibold w-full sm:w-auto"
              >
                Close
              </Button>

              {detailOrder && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Select
                    disabled={statusUpdating}
                    defaultValue={detailOrder.status}
                    onValueChange={(value) =>
                      handleStatusChange(
                        detailOrder.id || detailOrder._id,
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 font-semibold">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStatuses(
                        detailOrder.id || detailOrder._id || '',
                        detailOrder.status
                      ).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-medium">
                                {status}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={refreshOrders}
                    variant="default"
                    className="px-6 py-2 font-semibold w-full sm:w-auto"
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reject Order Dialog */}
      <Dialog
        open={openRejectDialog}
        onOpenChange={(open) => {
          if (!open) {
            // Only allow closing if we're not processing
            if (!processingOrderId) {
              setOpenRejectDialog(false);
            }
          } else {
            setOpenRejectDialog(open);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Provide a reason and optional note for rejecting this order
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const rejectionReason = formData.get("rejectionReason") as string;
              const note = formData.get("note") as string;

              if (rejectionReason && processingOrderId) {
                handleRejectOrder(processingOrderId, {
                  rejectionReason,
                  note: note || undefined,
                });
              } else {
                toast.error("Rejection reason is required");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="rejectionReason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                placeholder="Enter the reason for rejection"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Note (optional)
              </label>
              <textarea
                name="note"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={2}
                placeholder="Enter an optional note"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenRejectDialog(false);
                  setProcessingOrderId(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Reject Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>{" "}
      {/* Refund Order Dialog */}
      <Dialog
        open={openRefundDialog}
        onOpenChange={(open) => {
          if (!open) {
            // Only allow closing if we're not processing
            if (!isRefunding) {
              setOpenRefundDialog(false);
              setValidationError(null);
              setRefundFormData({
                refundReason: "",
                note: "",
              });
            }
          } else {
            setOpenRefundDialog(open);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              Refund Order
            </DialogTitle>
            <DialogDescription>
              Provide a reason and optional note for refunding this rejected
              order
            </DialogDescription>
          </DialogHeader>

          {isRefunding ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing refund request...
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (processingOrderId) {
                  handleRefundOrder(processingOrderId, refundFormData);
                }
              }}
              className="space-y-4"
            >
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                  <p>{validationError}</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z"
                      fill="#92400E"
                    />
                  </svg>
                  Important Information
                </h3>
                <p className="text-xs text-amber-800">
                  This action will refund the payment for a rejected order.
                  According to system rules, only orders with "rejected" status
                  can be refunded.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Refund Reason (optional)
                </label>
                <textarea
                  value={refundFormData.refundReason}
                  onChange={(e) =>
                    setRefundFormData({
                      ...refundFormData,
                      refundReason: e.target.value,
                    })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  placeholder="Enter the reason for refund"
                />
                <p className="text-xs text-muted-foreground">
                  Explain why the payment is being refunded. This will be
                  visible to the customer.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Administrative Note (optional)
                </label>
                <textarea
                  value={refundFormData.note}
                  onChange={(e) =>
                    setRefundFormData({
                      ...refundFormData,
                      note: e.target.value,
                    })
                  }
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={2}
                  placeholder="Enter an optional internal note"
                />
                <p className="text-xs text-muted-foreground">
                  Internal note for administrative purposes. Not visible to
                  customers.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenRefundDialog(false);
                    setValidationError(null);
                    setRefundFormData({
                      refundReason: "",
                      note: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Process Refund
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOrdersPage;
