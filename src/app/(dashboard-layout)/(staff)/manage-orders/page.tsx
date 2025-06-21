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
import { Loader2 } from "lucide-react";

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
  productId: string | { id?: string; _id?: string; [key: string]: any };
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

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orders = await orderService.getAllOrders();
      console.log("Orders received:", orders);
      setOrders(orders || []);
      
      // Fetch user information for each order
      await fetchUserInfo(orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
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
  // Modified getUserName function to handle nested user data
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
  };  const handleStatusChange = async (orderId: string | undefined, newStatus: string) => {
    if (!orderId) return;
    
    // Nếu trạng thái mới là "rejected", hiển thị dialog yêu cầu lý do
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
    const statusColors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      refunded: "bg-emerald-500",
      shipping: "bg-blue-500",
      delivered: "bg-purple-500",
      canceled: "bg-gray-500",
    };

    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status}
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
  // Function definitions for handleRejectOrder and handleRefundOrder using orderService
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

  const handleRefundOrder = async (orderId: string, data: { refundReason?: string; note?: string }) => {
    if (!orderId) return;
    
    try {
      setProcessingOrderId(orderId);
      
      // Use orderService to refund the order
      await orderService.refundOrder(orderId, {
        refundReason: data.refundReason,
        note: data.note
      });
      
      toast.success("Order refunded successfully");
      // Refresh orders list
      fetchOrders();
      
      // Close dialog first after successful operation
      setOpenRefundDialog(false);
    } catch (error) {
      toast.error("Failed to refund order");
      console.error("Error refunding order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="container mx-auto py-10">      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders from this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => {
                      const orderId = order.id || order._id || "";
                      return (
                        <tr key={orderId} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{orderId}</td>
                          <td className="p-4 align-middle">{getUserName(order.userId)}</td>
                          <td className="p-4 align-middle">{formatDate(order.createdAt)}</td>
                          <td className="p-4 align-middle">{formatPrice(order.totalAmount)}</td>
                          <td className="p-4 align-middle">{getStatusBadge(order.status)}</td>
                          <td className="p-4 align-middle space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => orderId && handleViewDetail(orderId)}
                            >
                              View Details
                            </Button>
                              {/* Nút Reject đã được loại bỏ và thay thế bằng dialog khi chọn status rejected */}
                            
                            {order.status === 'rejected' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setOpenRefundDialog(true);
                                  setProcessingOrderId(orderId);
                                }}
                                disabled={processingOrderId === orderId}
                              >
                                Refund
                              </Button>
                            )}
                            
                            <Select
                              disabled={statusUpdating}
                              defaultValue={order.status}
                              onValueChange={(value) => handleStatusChange(orderId, value)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStatuses(order.status).map((status) => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <td colSpan={6} className="p-4 align-middle text-center">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p>Order ID: {detailOrder.id || detailOrder._id}</p>
                  <p>Date: {formatDate(detailOrder.createdAt)}</p>
                  <p>Status: {getStatusBadge(detailOrder.status)}</p>
                  <p>Total: {formatPrice(detailOrder.totalAmount)}</p>
                  {detailOrder.shippingAddress && (
                    <p>Shipping Address: {detailOrder.shippingAddress}</p>
                  )}
                  {detailOrder.contactPhone && (
                    <p>Contact Phone: {detailOrder.contactPhone}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>Name: {getUserName(detailOrder.userId)}</p>
                  {typeof detailOrder.userId === "object" ? (
                    <>
                      <p>Email: {detailOrder.userId.email || "N/A"}</p>
                      <p>Phone: {detailOrder.userId.phone || "N/A"}</p>
                      <p>Address: {detailOrder.userId.address || "N/A"}</p>
                    </>
                  ) : users[detailOrder.userId] ? (
                    <>
                      <p>Email: {users[detailOrder.userId].email || "N/A"}</p>
                      <p>Phone: {users[detailOrder.userId].phone || "N/A"}</p>
                      <p>Address: {users[detailOrder.userId].address || "N/A"}</p>
                    </>
                  ) : (
                    <p>User ID: {detailOrder.userId || "N/A"}</p>
                  )}
                </div>
              </div>

              {/* Transaction Information */}
              {detailOrder.transactionId && (
                <div>
                  <h3 className="font-semibold mb-2">Transaction Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p>Transaction ID: {
                      typeof detailOrder.transactionId === 'object' 
                        ? detailOrder.transactionId._id || detailOrder.transactionId.id 
                        : detailOrder.transactionId
                    }</p>
                    {typeof detailOrder.transactionId === 'object' && (
                      <>
                        <p>Order ID: {detailOrder.transactionId.orderId}</p>
                        <p>Payment Method: {detailOrder.transactionId.paymentMethod || 'N/A'}</p>
                        <p>Payment Status: {detailOrder.transactionId.status}</p>
                        {detailOrder.transactionId.paymentDetails && detailOrder.transactionId.paymentDetails.bankCode && (
                          <p>Bank: {detailOrder.transactionId.paymentDetails.bankCode}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {detailOrder.items && detailOrder.items.length > 0 ? (
                        detailOrder.items.map((item, index) => (
                          <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <td className="p-4 align-middle">
                              {typeof item.productId === "object"
                                ? item.productId._id || item.productId.id
                                : item.productId}
                            </td>
                            <td className="p-4 align-middle">{formatPrice(item.price)}</td>
                            <td className="p-4 align-middle">{item.quantity}</td>
                            <td className="p-4 align-middle">
                              {formatPrice(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td colSpan={4} className="p-4 align-middle text-center">
                            No items in this order or items not available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDetails(false)}>
              Close
            </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>        {/* Reject Order Dialog */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="rejectionReason"
                className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
                rows={3}
                placeholder="Enter the reason for rejection"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Note (optional)
              </label>
              <textarea
                name="note"
                className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
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
      </Dialog>{/* Refund Order Dialog */}
      <Dialog 
        open={openRefundDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Only allow closing if we're not processing
            if (!processingOrderId) {
              setOpenRefundDialog(false);
            }
          } else {
            setOpenRefundDialog(open);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Order</DialogTitle>
            <DialogDescription>
              Provide a reason and optional note for refunding this order
            </DialogDescription>
          </DialogHeader>

          {processingOrderId ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const refundReason = formData.get('refundReason') as string;
                const note = formData.get('note') as string;
                
                if (processingOrderId) {
                  handleRefundOrder(processingOrderId, {
                    refundReason: refundReason || undefined,
                    note: note || undefined
                  });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Refund Reason (optional)
                </label>
                <textarea
                  name="refundReason"
                  className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
                  rows={3}
                  placeholder="Enter the reason for refund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note (optional)
                </label>
                <textarea
                  name="note"
                  className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
                  rows={2}
                  placeholder="Enter an optional note"
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenRefundDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  Refund Order
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
