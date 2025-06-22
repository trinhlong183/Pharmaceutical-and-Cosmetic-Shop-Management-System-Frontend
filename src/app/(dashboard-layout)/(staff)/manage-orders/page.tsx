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
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/api/orderService";
import { userService } from "@/api/userService";
import { toast } from "react-hot-toast";
import { Loader2, Search, Filter, RefreshCw, Eye, Package2, Truck, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Define interfaces for our data structures
interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Transaction {
  id?: string;
  _id?: string;
  orderId?: string;
  status?: string;
  paymentMethod?: string;
  paymentDetails?: {
    bankCode?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface OrderItem {
  productId: string | { id?: string; _id?: string; name?: string; [key: string]: any };
  price: number;
  quantity: number;
  [key: string]: any;
}

interface Order {
  id?: string;
  _id?: string;
  userId: string | User;
  items?: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  transactionId?: string | Transaction;
  shippingAddress?: string;
  contactPhone?: string;
  rejectionReason?: string;
  refundReason?: string;
  processedBy?: string;
  notes?: string;
  [key: string]: any;
}

// Update the constants to include status color and icon information for better visualization
const StatusConfig = {
  pending: { 
    bg: "bg-yellow-100 text-yellow-800", 
    icon: <Package2 className="h-3 w-3 mr-1" />,
    description: "Waiting for approval"
  },
  approved: { 
    bg: "bg-blue-100 text-blue-800", 
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    description: "Order has been approved"
  },
  rejected: { 
    bg: "bg-red-100 text-red-800", 
    icon: <XCircle className="h-3 w-3 mr-1" />,
    description: "Order has been rejected"
  },
  refunded: { 
    bg: "bg-emerald-100 text-emerald-800", 
    icon: <RefreshCw className="h-3 w-3 mr-1" />,
    description: "Payment has been refunded"
  },
  shipping: { 
    bg: "bg-indigo-100 text-indigo-800", 
    icon: <Truck className="h-3 w-3 mr-1" />,
    description: "Order is being shipped"
  },
  delivered: { 
    bg: "bg-green-100 text-green-800", 
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    description: "Order has been delivered"
  },
  canceled: { 
    bg: "bg-gray-100 text-gray-800", 
    icon: <XCircle className="h-3 w-3 mr-1" />,
    description: "Order has been canceled"
  },
};

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Add state for validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Add state for current refund form data
  const [refundFormData, setRefundFormData] = useState({
    refundReason: '',
    note: ''
  });

  // Add state to track if a refund operation is in progress
  const [isRefunding, setIsRefunding] = useState(false);

  const router = useRouter();

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
      setOrders(orders || []);
      setFilteredOrders(orders || []);
      
      // Fetch user information for each order
      await fetchUserInfo(orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
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
      filtered = filtered.filter(order => order.status === status);
    }
    
    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();      filtered = filtered.filter(order => {
        const orderId = order.id || order._id || "";
        const customerName = getUserName(order.userId)?.toLowerCase() || "";
        
        return orderId.toLowerCase().includes(searchLower) || 
               customerName.includes(searchLower);
      });
    }
    
    setFilteredOrders(filtered);
  };

  const fetchUserInfo = async (orders: Order[]) => {
    try {
      const userIds = new Set<string>();
      
      // Collect unique user IDs
      orders.forEach(order => {
        let userId: string | undefined;
        
        if (typeof order.userId === 'object') {
          userId = (order.userId as User)._id || (order.userId as User).id;
        } else {
          userId = order.userId as string;
        }
        
        if (userId) userIds.add(userId);
      });
      
      // Fetch user data for each unique user ID
      const userMap: Record<string, User> = {};
      
      for (const userId of userIds) {
        try {
          const userData = await userService.getUserById(userId);
          userMap[userId] = userData as User;
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
        }
      }
      
      setUsers(userMap);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Get user name from userId
  const getUserName = (userId: string | User | undefined) => {
    if (!userId) return "N/A";
    
    // If userId is an object with user information directly
    if (typeof userId === 'object') {
      return (userId as User).name || (userId as User).email || "N/A";
    }
    
    // Look up the user in our users map
    const user = users[userId];
    return user ? (user.name || user.email) : userId;
  };

  const handleViewDetail = async (orderId: string) => {
    try {
      const order = await orderService.getOrderById(orderId);
      console.log("Order details:", order);
      
      // If the user info isn't already loaded, load it
      let userId: string | undefined;
      
      if (typeof order.userId === 'object') {
        userId = (order.userId as User)._id || (order.userId as User).id;
      } else {
        userId = order.userId as string;
      }
        
      if (userId && !users[userId]) {
        try {
          const userData = await userService.getUserById(userId);
          setUsers(prev => ({...prev, [userId as string]: userData as User}));
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
        }
      }
      
      setDetailOrder(order as Order);
      setOpenDetails(true);
    } catch (error) {
      toast.error("Failed to get order details");
      console.error(error);
    }
  };  

  const handleStatusChange = async (orderId: string | undefined, newStatus: string) => {
    if (!orderId) return;
    
    // If new status is "rejected", show dialog requesting reason
    if (newStatus === "rejected") {
      setProcessingOrderId(orderId);
      setOpenRejectDialog(true);
      return;
    }
    
    setStatusUpdating(true);
    try {
      // Call the updateOrderStatus method from orderService
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        ((order.id && order.id === orderId) || (order._id && order._id === orderId))
          ? {...order, status: newStatus} 
          : order
      ));
      
      // Update the order details dialog if open
      if (detailOrder && 
          ((detailOrder.id && detailOrder.id === orderId) || 
           (detailOrder._id && detailOrder._id === orderId))) {
        setDetailOrder({ ...detailOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating status:", error);
    } finally {
      setStatusUpdating(false);
    }
  };
  const getStatusBadge = (status: string) => {
    const config = StatusConfig[status as keyof typeof StatusConfig] || 
      { bg: "bg-gray-100 text-gray-800", icon: null, description: "Unknown status" };

    return (
      <Badge 
        variant="outline" 
        className={`${config.bg} flex items-center`}
        title={config.description}
      >
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };
  
  // Function to get available status options based on current status
  const getAvailableStatuses = (currentStatus: string): string[] => {
    switch(currentStatus) {
      case 'pending':
        return ['pending', 'approved', 'rejected', 'shipping', 'canceled'];
      case 'approved':
        return ['approved', 'shipping', 'canceled']; // Can't go back to pending
      case 'rejected':
        return ['rejected', 'refunded']; // Can only be refunded after rejection
      case 'refunded':
        return ['refunded']; // Final state
      case 'shipping':
        return ['shipping', 'delivered', 'canceled']; 
      case 'delivered':
        return ['delivered']; // Final state
      case 'canceled':
        return ['canceled']; // Final state
      default:
        return ['pending', 'approved', 'rejected', 'shipping', 'canceled'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Function to handle order rejection
  const handleRejectOrder = async (orderId: string, data: { rejectionReason: string; note?: string }) => {
    if (!orderId) return;
    
    try {
      setProcessingOrderId(orderId);
      
      // Use orderService to reject the order
      await orderService.rejectOrder(orderId, {
        rejectionReason: data.rejectionReason,
        note: data.note
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
  const handleRefundOrder = async (orderId: string, data: { refundReason?: string; note?: string }) => {
    if (!orderId) return;
    
    try {
      setProcessingOrderId(orderId);
      setIsRefunding(true);
      setValidationError(null);
      
      // Validate that the order is in rejected state before attempting refund
      const orderToRefund = orders.find(order => 
        (order.id === orderId || order._id === orderId)
      );
      
      if (orderToRefund && orderToRefund.status !== 'rejected') {
        setValidationError("Order can only be refunded if it was previously rejected");
        return;
      }
      
      // Use orderService to refund the order
      const refundedOrder = await orderService.refundOrder(orderId, {
        refundReason: data.refundReason,
        note: data.note
      });
      
      toast.success("Order has been refunded successfully");
      
      // Update orders in state to reflect the change
      setOrders(orders.map(order => 
        ((order.id && order.id === orderId) || (order._id && order._id === orderId))
          ? {...order, status: 'refunded', refundReason: data.refundReason} 
          : order
      ));
      
      // If the order detail dialog is open and showing this order, update it
      if (detailOrder && 
          ((detailOrder.id && detailOrder.id === orderId) || 
           (detailOrder._id && detailOrder._id === orderId))) {
        setDetailOrder({ 
          ...detailOrder, 
          status: 'refunded',
          refundReason: data.refundReason || detailOrder.refundReason
        });
      }
      
      // Close refund dialog
      setOpenRefundDialog(false);
      
      // Clear refund form data
      setRefundFormData({
        refundReason: '',
        note: ''
      });
      
    } catch (error: any) {
      // Handle specific error types based on API documentation
      if (error.message && error.message.includes('409')) {
        toast.error("Order can only be refunded if it was previously rejected");
        setValidationError("Order can only be refunded if it was previously rejected");
      } else if (error.message && error.message.includes('401')) {
        toast.error("Your session has expired. Please login again");
      } else if (error.message && error.message.includes('403')) {
        toast.error("You don't have permission to perform this action");
      } else if (error.message && error.message.includes('404')) {
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
  const getProductName = (productId: string | { id?: string; _id?: string; name?: string }) => {
    if (!productId) return "Unknown Product";
    
    if (typeof productId === 'object' && productId.name) {
      return productId.name;
    }
    
    return typeof productId === 'object' 
      ? (productId._id || productId.id || "Unknown Product") 
      : productId;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
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
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
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
                              <TableCell className="font-medium">{orderId.slice(0, 8)}...</TableCell>
                              <TableCell>{getUserName(order.userId)}</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right font-medium">{formatPrice(order.totalAmount)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => orderId && handleViewDetail(orderId)}
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
                                          refundReason: '',
                                          note: ''
                                        });
                                        
                                        // Reset any validation errors
                                        setValidationError(null);
                                      }}
                                      disabled={processingOrderId === orderId || isRefunding}
                                      className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      Refund
                                    </Button>
                                  )}
                                  
                                  <Select
                                    disabled={statusUpdating}
                                    defaultValue={order.status}
                                    onValueChange={(value) => handleStatusChange(orderId, value)}
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailableStatuses(order.status).map((status) => (
                                        <SelectItem key={status} value={status}>
                                          <div className="flex items-center">
                                            <span className="capitalize">{status}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
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

      {/* Order Details Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {detailOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{detailOrder.id || detailOrder._id}</p>
                </div>
                <div>{getStatusBadge(detailOrder.status)}</div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-[100px_1fr]">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{getUserName(detailOrder.userId)}</span>
                    </div>
                    {typeof detailOrder.userId === "object" ? (
                      <>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{detailOrder.userId.email || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{detailOrder.userId.phone || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Address:</span>
                          <span>{detailOrder.userId.address || "N/A"}</span>
                        </div>
                      </>
                    ) : users[detailOrder.userId] ? (
                      <>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{users[detailOrder.userId].email || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{users[detailOrder.userId].phone || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="text-muted-foreground">Address:</span>
                          <span>{users[detailOrder.userId].address || "N/A"}</span>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">User ID:</span>
                        <span>{detailOrder.userId || "N/A"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_1fr]">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{formatDate(detailOrder.createdAt)}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr]">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">{formatPrice(detailOrder.totalAmount)}</span>
                    </div>
                    {detailOrder.shippingAddress && (
                      <div className="grid grid-cols-[120px_1fr]">
                        <span className="text-muted-foreground">Shipping Address:</span>
                        <span>{detailOrder.shippingAddress}</span>
                      </div>
                    )}
                    {detailOrder.contactPhone && (
                      <div className="grid grid-cols-[120px_1fr]">
                        <span className="text-muted-foreground">Contact Phone:</span>
                        <span>{detailOrder.contactPhone}</span>
                      </div>
                    )}
                    {detailOrder.notes && (
                      <div className="grid grid-cols-[120px_1fr]">
                        <span className="text-muted-foreground">Notes:</span>
                        <span>{detailOrder.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Information */}
              {detailOrder.transactionId && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Transaction Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-[150px_1fr]">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span>
                        {typeof detailOrder.transactionId === 'object' 
                          ? detailOrder.transactionId._id || detailOrder.transactionId.id 
                          : detailOrder.transactionId}
                      </span>
                    </div>
                    
                    {typeof detailOrder.transactionId === 'object' && (
                      <>
                        <div className="grid grid-cols-[150px_1fr]">
                          <span className="text-muted-foreground">Order ID:</span>
                          <span>{detailOrder.transactionId.orderId}</span>
                        </div>
                        <div className="grid grid-cols-[150px_1fr]">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span>{detailOrder.transactionId.paymentMethod || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[150px_1fr]">
                          <span className="text-muted-foreground">Payment Status:</span>
                          <Badge variant="outline" className="w-fit font-normal">
                            {detailOrder.transactionId.status}
                          </Badge>
                        </div>
                        {detailOrder.transactionId.paymentDetails && detailOrder.transactionId.paymentDetails.bankCode && (
                          <div className="grid grid-cols-[150px_1fr]">
                            <span className="text-muted-foreground">Bank:</span>
                            <span>{detailOrder.transactionId.paymentDetails.bankCode}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}              
              
              {/* Order Items Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {detailOrder.items && detailOrder.items.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {getProductName(item.productId)}
                            </TableCell>
                            <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                          <TableCell className="text-right font-bold">{formatPrice(detailOrder.totalAmount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No items available for this order
                    </div>
                  )}
                </CardContent>
              </Card>
                {/* Rejection and Refund Information */}
              {(detailOrder.rejectionReason || detailOrder.refundReason) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {detailOrder.rejectionReason && (
                    <Card className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-red-600 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Rejection Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Reason for Rejection</p>
                          <p className="text-sm">{detailOrder.rejectionReason}</p>
                        </div>
                        
                        {detailOrder.processedBy && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Processed By</p>
                            <p className="text-sm">{detailOrder.processedBy}</p>
                          </div>
                        )}
                        
                        {!detailOrder.refundReason && detailOrder.status === 'rejected' && (
                          <div className="mt-2 pt-2 border-t border-red-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setOpenRefundDialog(true);
                                setProcessingOrderId(detailOrder.id || detailOrder._id || null);
                                setRefundFormData({
                                  refundReason: '',
                                  note: ''
                                });
                                setValidationError(null);
                              }}
                              disabled={isRefunding}
                            >
                              Process Refund
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {detailOrder.refundReason && (
                    <Card className="border-emerald-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-emerald-600 flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Refund Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Reason for Refund</p>
                          <p className="text-sm">{detailOrder.refundReason}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="flex items-center gap-1">
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Refunded
                            </Badge>
                          </p>
                        </div>
                        
                        {detailOrder.notes && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Notes</p>
                            <p className="text-sm whitespace-pre-wrap">{detailOrder.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setOpenDetails(false)}>
              Close
            </Button>
            
            <div className="flex items-center gap-2">              {detailOrder && detailOrder.status === 'rejected' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setOpenRefundDialog(true);
                    setProcessingOrderId(detailOrder.id || detailOrder._id || null);
                    // Reset the refund form data
                    setRefundFormData({
                      refundReason: '',
                      note: ''
                    });
                    // Reset any validation errors
                    setValidationError(null);
                  }}
                  disabled={statusUpdating || isRefunding}
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Process Refund
                </Button>
              )}
              
              {detailOrder && (
                <Select
                  disabled={statusUpdating}
                  defaultValue={detailOrder.status}
                  onValueChange={(value) =>
                    handleStatusChange(detailOrder.id || detailOrder._id, value)
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses(detailOrder.status).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              const rejectionReason = formData.get('rejectionReason') as string;
              const note = formData.get('note') as string;
              
              if (rejectionReason && processingOrderId) {
                handleRejectOrder(processingOrderId, {
                  rejectionReason,
                  note: note || undefined
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
              <Button
                type="submit"
              >
                Reject Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>      {/* Refund Order Dialog */}
      <Dialog 
        open={openRefundDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Only allow closing if we're not processing
            if (!isRefunding) {
              setOpenRefundDialog(false);
              setValidationError(null);
              setRefundFormData({
                refundReason: '',
                note: ''
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
              Provide a reason and optional note for refunding this rejected order
            </DialogDescription>
          </DialogHeader>

          {isRefunding ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing refund request...</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z" fill="#92400E"/>
                  </svg>
                  Important Information
                </h3>
                <p className="text-xs text-amber-800">
                  This action will refund the payment for a rejected order. According to system rules, only orders with "rejected" status can be refunded.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Refund Reason (optional)
                </label>
                <textarea
                  value={refundFormData.refundReason}
                  onChange={(e) => setRefundFormData({...refundFormData, refundReason: e.target.value})}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  placeholder="Enter the reason for refund"
                />
                <p className="text-xs text-muted-foreground">
                  Explain why the payment is being refunded. This will be visible to the customer.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Administrative Note (optional)
                </label>
                <textarea
                  value={refundFormData.note}
                  onChange={(e) => setRefundFormData({...refundFormData, note: e.target.value})}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={2}
                  placeholder="Enter an optional internal note"
                />
                <p className="text-xs text-muted-foreground">
                  Internal note for administrative purposes. Not visible to customers.
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
                      refundReason: '',
                      note: ''
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
