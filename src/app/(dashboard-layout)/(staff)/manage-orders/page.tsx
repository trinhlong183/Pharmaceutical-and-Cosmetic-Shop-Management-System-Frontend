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

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
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

  const fetchUserInfo = async (orders) => {
    try {
      const userIds = new Set();
      
      // Collect unique user IDs
      orders.forEach(order => {
        const userId = typeof order.userId === 'object' ? 
          (order.userId._id || order.userId.id) : order.userId;
        
        if (userId) userIds.add(userId);
      });
      
      // Fetch user data for each unique user ID
      const userMap = {};
      
      for (const userId of userIds) {
        try {
          const userData = await userService.getUserById(userId);
          userMap[userId] = userData;
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
  const getUserName = (userId) => {
    if (!userId) return "N/A";
    
    // If userId is an object with user information directly
    if (typeof userId === 'object') {
      return userId.name || userId.email || "N/A";
    }
    
    // Look up the user in our users map
    const user = users[userId];
    return user ? (user.name || user.email) : userId;
  };

  const handleViewDetail = async (orderId) => {
    try {
      const order = await orderService.getOrderById(orderId);
      console.log("Order details:", order);
      
      // If the user info isn't already loaded, load it
      const userId = typeof order.userId === 'object' ? 
        (order.userId._id || order.userId.id) : order.userId;
        
      if (userId && !users[userId]) {
        try {
          const userData = await userService.getUserById(userId);
          setUsers(prev => ({...prev, [userId]: userData}));
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
        }
      }
      
      setDetailOrder(order);
      setOpenDetails(true);
    } catch (error) {
      toast.error("Failed to get order details");
      console.error(error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      // Call the updateOrderStatus method from orderService
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        (order.id === orderId || order._id === orderId) 
          ? {...order, status: newStatus} 
          : order
      ));
      
      // Update the order details dialog if open
      if (detailOrder && (detailOrder.id === orderId || detailOrder._id === orderId)) {
        setDetailOrder({ ...detailOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating status:", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };

    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => {
                    const orderId = order.id || order._id;
                    return (
                      <TableRow key={orderId}>
                        <TableCell>{orderId}</TableCell>
                        <TableCell>{getUserName(order.userId)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(orderId)}
                          >
                            View Details
                          </Button>
                          <Select
                            disabled={statusUpdating}
                            defaultValue={order.status}
                            onValueChange={(value) => handleStatusChange(orderId, value)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">pending</SelectItem>
                              <SelectItem value="approved">approved</SelectItem>
                              <SelectItem value="rejected">rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
              )}

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailOrder.items && detailOrder.items.length > 0 ? (
                      detailOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {typeof item.productId === "object"
                              ? item.productId._id || item.productId.id
                              : item.productId}
                          </TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No items in this order or items not available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
      </Dialog>
    </div>
  );
};

export default ManageOrdersPage;
