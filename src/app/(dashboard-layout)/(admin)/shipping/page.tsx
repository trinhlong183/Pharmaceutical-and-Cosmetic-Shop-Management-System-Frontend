"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  shippingLogsService,
  ShippingLog,
  ShippingStatus,
} from "@/api/shippingLogsService";
import { orderService } from "@/api/orderService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import {
  Package,
  Truck,
  CalendarClock,
  MapPin,
  User,
  Phone,
  Clipboard,
  TruckIcon,
  PackageOpen,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import { useUser } from "@/contexts/UserContext";

export default function ShippingAdminPage() {
  const { user, loading: userLoading } = useUser();
  const [shippingLogs, setShippingLogs] = useState<ShippingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentShipping, setCurrentShipping] = useState<ShippingLog | null>(
    null
  );
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderItemsDialogOpen, setOrderItemsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ShippingStatus>(
    ShippingStatus.PENDING
  );
  const [statusNote, setStatusNote] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadShippingLogs();
  }, []);

  // Define status progression order
  const statusProgression = [
    ShippingStatus.PENDING,
    ShippingStatus.PROCESSING,
    ShippingStatus.SHIPPED,
    ShippingStatus.IN_TRANSIT,
    ShippingStatus.DELIVERED,
    ShippingStatus.RECEIVED,
  ];

  // Define terminal statuses (can't progress further)
  const terminalStatuses = [
    ShippingStatus.DELIVERED,
    ShippingStatus.RECEIVED,
    ShippingStatus.CANCELLED,
    ShippingStatus.RETURNED,
  ];

  // Get allowed statuses based on user role and current status
  const getAllowedStatuses = (currentStatus?: ShippingStatus): ShippingStatus[] => {
    const allStatuses = Object.values(ShippingStatus);
    
    // If user is not loaded yet, return empty array
    if (!user) return [];
    
    // Admin can change to any status
    if (user.role === Role.ADMIN) {
      return allStatuses;
    }

    // Staff can only progress forward or mark as cancelled/returned
    if (user.role === Role.STAFF) {
      if (!currentStatus) {
        return allStatuses; // If no current status, allow any
      }

      const currentIndex = statusProgression.indexOf(currentStatus);
      const allowedStatuses: ShippingStatus[] = [];

      // If current status is in main progression
      if (currentIndex !== -1) {
        // Only allow next statuses in progression (không cho phép giữ nguyên status hiện tại)
        for (let i = currentIndex + 1; i < statusProgression.length; i++) {
          allowedStatuses.push(statusProgression[i]);
        }
        
        // Always allow cancelled and returned from any status in progression
        allowedStatuses.push(ShippingStatus.CANCELLED, ShippingStatus.RETURNED);
      } else if (currentStatus === ShippingStatus.CANCELLED || currentStatus === ShippingStatus.RETURNED) {
        // If already cancelled or returned, no further changes allowed for staff
        // Staff cannot change from terminal states
        return [];
      } else {
        // If current status is not in main progression, allow cancelled and returned
        allowedStatuses.push(ShippingStatus.CANCELLED, ShippingStatus.RETURNED);
      }

      return [...new Set(allowedStatuses)]; // Remove duplicates
    }

    // Default: no status changes allowed
    return [];
  };

  // Check if status change is allowed
  const isStatusChangeAllowed = (fromStatus?: ShippingStatus, toStatus?: ShippingStatus): boolean => {
    if (!toStatus) return false;
    
    const allowedStatuses = getAllowedStatuses(fromStatus);
    return allowedStatuses.includes(toStatus);
  };

  const loadShippingLogs = async () => {
    try {
      setLoading(true);
      const data = await shippingLogsService.getAll();
      console.log("Shipping logs loaded:", data); // Log data for debugging
      setShippingLogs(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load shipping logs", error);
      toast.error("Failed to load shipping data");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentShipping) return;

    // Validate status transition based on user role
    if (!isStatusChangeAllowed(currentShipping.status as ShippingStatus, newStatus)) {
      toast.error(
        user?.role === Role.STAFF 
          ? "Staff can only move forward in status progression or mark as cancelled/returned"
          : "Status change not allowed"
      );
      return;
    }

    try {
      setLoadingAction(true);

      // Get the correct ID for the shipping log
      let shippingId = "";

      if (currentShipping.id) {
        shippingId = currentShipping.id;
      } else if (currentShipping._id) {
        shippingId = currentShipping._id;
      } else {
        throw new Error("Không thể tìm thấy ID của đơn hàng");
      }

      console.log(
        `Updating shipping log ${shippingId} to status: ${newStatus}`
      );

      // Prepare update data
      const updateData = {
        status: newStatus,
        notes: statusNote,
        currentLocation: currentLocation,
        ...(newStatus === ShippingStatus.DELIVERED && {
          actualDelivery: new Date().toISOString(),
        }),
      };

      // Call API to update status
      const updatedShipping = await shippingLogsService.updateStatus(
        shippingId,
        updateData
      );

      console.log("Updated shipping:", updatedShipping);

      // Show success message
      toast.success(`Đã cập nhật trạng thái thành ${newStatus}`);

      // Close dialog and reload data
      setStatusDialogOpen(false);
      loadShippingLogs();

      // Special handling for delivered status - notify user
      if (newStatus === ShippingStatus.DELIVERED) {
        toast.success(
          "Đơn hàng đã được đánh dấu là đã giao. Khách hàng sẽ nhận được thông báo."
        );
      }
    } catch (error) {
      console.error("Failed to update shipping status", error);

      // Handle different error types
      if (error instanceof Error) {
        toast.error(`Không thể cập nhật trạng thái: ${error.message}`);
      } else {
        toast.error("Không thể cập nhật trạng thái vận chuyển");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200"; // Default for null/undefined

    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "in_transit":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "received":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "returned":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filterShippingLogs = () => {
    return shippingLogs
      .filter((log) => {
        if (selectedStatus === "all") return true;
        return (
          (log.status || "").toLowerCase() === selectedStatus.toLowerCase()
        );
      })
      .filter((log) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();

        // Extract order ID from nested order object (new API format)
        let orderIdStr = "";
        if (log.order && log.order.id) {
          orderIdStr = log.order.id;
        }

        // Search through all relevant fields
        return (
          // Order ID
          (orderIdStr
            ? orderIdStr.toLowerCase().includes(searchLower)
            : false) ||
          // Shipping info
          (log.trackingNumber
            ? log.trackingNumber.toLowerCase().includes(searchLower)
            : false) ||
          // Customer info (new API format)
          (log.customer?.email
            ? log.customer.email.toLowerCase().includes(searchLower)
            : false) ||
          (log.customer?.phone
            ? log.customer.phone.toLowerCase().includes(searchLower)
            : false) ||
          (log.customer?.address
            ? log.customer.address.toLowerCase().includes(searchLower)
            : false) ||
          // Order info (new API format)
          (log.order?.shippingAddress
            ? log.order.shippingAddress.toLowerCase().includes(searchLower)
            : false) ||
          (log.order?.contactPhone
            ? log.order.contactPhone.toLowerCase().includes(searchLower)
            : false) ||
          // Product summary
          (log.productSummary && typeof log.productSummary === "string"
            ? log.productSummary.toLowerCase().includes(searchLower)
            : false)
        );
      })
      .sort((a, b) => {
        // Sort by creation date, newest first
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      });
  };

  // Extract order ID from different formats
  const extractOrderId = (orderIdValue: string | any | undefined): string => {
    if (!orderIdValue) return "";

    // Debug the type of orderIdValue
    console.log(`Extracting OrderID from:`, {
      type: typeof orderIdValue,
      value: orderIdValue,
    });

    // Handle string format directly
    if (typeof orderIdValue === "string") {
      return orderIdValue;
    }

    // Handle object format (either direct orderId object or from .order field)
    if (typeof orderIdValue === "object" && orderIdValue) {
      const orderIdObj = orderIdValue as Record<string, any>;

      // Try direct ID fields
      const directId =
        orderIdObj.id ||
        orderIdObj._id ||
        orderIdObj.orderId ||
        orderIdObj.orderID;
      if (directId) {
        return directId;
      }

      // If we have an order object nested inside, use that
      if (orderIdObj.order && typeof orderIdObj.order === "object") {
        return orderIdObj.order.id || orderIdObj.order._id || "";
      }
    }

    return "";
  };

  // View order details page
  const viewOrderDetails = (orderId: string | undefined) => {
    // Validate order ID
    if (!orderId || orderId.trim() === "") {
      toast.error("Order ID is missing or invalid");
      return;
    }

    // Log for debugging
    console.log("Viewing order details for:", orderId);

    // Navigate to the order details page
    try {
      router.push(`/manage-orders/${orderId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to open order details");
    }
  };

  // Load order items - now uses items from shipping log directly
  const loadOrderItems = async (
    orderId: string | undefined,
    shippingLog?: ShippingLog
  ) => {
    if (!orderId) {
      toast.error("Order ID is missing");
      return;
    }

    setLoadingOrderItems(true);
    try {
      // Use items directly from shipping log (new API format)
      if (
        shippingLog &&
        shippingLog.items &&
        Array.isArray(shippingLog.items) &&
        shippingLog.items.length > 0
      ) {
        console.log("Using items from shipping log:", shippingLog.items);
        setOrderItems(shippingLog.items);
        setLoadingOrderItems(false);
        return;
      }

      // Fallback: try to fetch from API if items not available in shipping log
      const data = await shippingLogsService.getOrderItems(orderId);
      console.log("Order items loaded from API:", data);

      if (data && data.items) {
        setOrderItems(data.items);
      } else {
        console.warn("No items found in API response");
        setOrderItems([]);
        toast.error("No items found for this order");
      }
    } catch (error) {
      console.error("Failed to load order items", error);
      toast.error("Failed to load order items");
      setOrderItems([]);
    } finally {
      setLoadingOrderItems(false);
    }
  };

  // Delete shipping log
  const handleDeleteShipping = async () => {
    if (!currentShipping) return;

    try {
      setLoadingAction(true);

      // Get the correct ID
      const shippingId = currentShipping.id || currentShipping._id;
      if (!shippingId) {
        throw new Error("Shipping ID not found");
      }

      await shippingLogsService.delete(shippingId);

      toast.success("Shipping log deleted successfully");
      setDeleteDialogOpen(false);
      loadShippingLogs(); // Reload the list
    } catch (error) {
      console.error("Failed to delete shipping log", error);

      // Handle different error types
      if (error instanceof Error) {
        toast.error(`Delete failed: ${error.message}`);
      } else {
        toast.error("Failed to delete shipping log");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <RoleRoute allowedRoles={[Role.ADMIN, Role.STAFF]}>
      {userLoading ? (
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading user information...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Shipping Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all orders in the shipping process
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {user?.role === Role.ADMIN ? "Admin Access" : "Staff Access"}
                </span>
                {user?.role === Role.STAFF && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Forward-only
                  </span>
                )}
              </div>
              <Button onClick={loadShippingLogs} className="flex gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Pending</CardTitle>
              <CardDescription>Awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {
                  shippingLogs.filter(
                    (log) => (log.status || "").toLowerCase() === "pending"
                  ).length
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">In Transit</CardTitle>
              <CardDescription>Currently shipping</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {
                  shippingLogs.filter((log) =>
                    ["shipped", "in_transit"].includes(
                      (log.status || "").toLowerCase()
                    )
                  ).length
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Delivered</CardTitle>
              <CardDescription>Successfully delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {
                  shippingLogs.filter((log) =>
                    ["delivered", "received"].includes(
                      (log.status || "").toLowerCase()
                    )
                  ).length
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Issues</CardTitle>
              <CardDescription>Delays & problems</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {
                  shippingLogs.filter((log) =>
                    ["returned", "cancelled"].includes(
                      (log.status || "").toLowerCase()
                    )
                  ).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by order ID, tracking number, or recipient..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/4">
              <Button
                variant="outline"
                className="w-full"
                onClick={loadShippingLogs}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading shipping data...</p>
            </div>
          ) : filterShippingLogs().length === 0 ? (
            <div className="text-center py-12">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">
                No shipping logs found
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || selectedStatus !== "all"
                  ? "Try changing your search filters"
                  : "There are no shipping records in the system yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterShippingLogs().map((log) => (
                    <TableRow key={log.id || log._id}>
                      <TableCell className="font-medium">
                        {(() => {
                          // Get order ID from nested order object (new API format)
                          if (log.order && log.order.id) {
                            const orderId = log.order.id;
                            return orderId.length > 8
                              ? `${orderId.substring(0, 8)}...`
                              : orderId;
                          }

                          // Fallback to orderId field if it exists
                          if (log.orderId) {
                            if (typeof log.orderId === "string") {
                              return log.orderId.length > 8
                                ? `${log.orderId.substring(0, 8)}...`
                                : log.orderId;
                            }
                          }

                          return "N/A";
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(log.status)}`}>
                          {log.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {(() => {
                              // Get recipient name from customer object (new API format)
                              if (log.customer) {
                                return log.customer.email || "Unknown Customer";
                              }

                              // Fallback to recipientName if exists
                              if (log.recipientName) {
                                return log.recipientName;
                              }

                              return "Unknown";
                            })()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(() => {
                              // Get phone from customer object (new API format)
                              if (log.customer && log.customer.phone) {
                                return log.customer.phone;
                              }

                              // Fallback to order contact phone
                              if (log.order && log.order.contactPhone) {
                                return log.order.contactPhone;
                              }

                              // Fallback to recipientPhone if exists
                              if (log.recipientPhone) {
                                return log.recipientPhone;
                              }

                              return "No phone";
                            })()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(log.createdAt || undefined)}
                      </TableCell>
                      <TableCell>
                        {log.estimatedDelivery
                          ? formatDate(log.estimatedDelivery)
                          : log.status === "Delivered" ||
                            log.status === "Received"
                          ? "Completed"
                          : "Not specified"}
                      </TableCell>
                      <TableCell>
                        {log.trackingNumber || "Not assigned"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentShipping(log);
                              setDetailDialogOpen(true);
                            }}
                          >
                            Details
                          </Button>
                          {(() => {
                            const allowedStatuses = getAllowedStatuses(log.status as ShippingStatus);
                            const hasUpdatePermission = allowedStatuses.length > 0;
                            
                            return (
                              <Button
                                size="sm"
                                disabled={!hasUpdatePermission}
                                onClick={() => {
                                  setCurrentShipping(log);
                                  setNewStatus(log.status as ShippingStatus);
                                  setCurrentLocation(log.currentLocation || "");
                                  setStatusNote("");
                                  setStatusDialogOpen(true);
                                }}
                                title={!hasUpdatePermission ? 
                                  (user?.role === Role.STAFF ? 
                                    "No further status changes available" : 
                                    "No status changes allowed") : 
                                  "Update status"
                                }
                              >
                                Update
                              </Button>
                            );
                          })()}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Get order ID from nested order object (new API format)
                                const orderId = log.order?.id;

                                if (orderId) {
                                  setCurrentShipping(log);
                                  setLoadingOrderItems(true);
                                  loadOrderItems(orderId, log);
                                  setOrderItemsDialogOpen(true);
                                } else {
                                  toast.error("Order ID not found");
                                }
                              }}
                            >
                              Items
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCurrentShipping(log);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Shipping Status</DialogTitle>
              <DialogDescription>
                Change the shipping status from the current state to a new one. This will be visible to the
                customer and update the order tracking information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-status">Current Status</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
                  <Badge className={`${getStatusColor(currentShipping?.status)}`}>
                    {currentShipping?.status || "Unknown"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Current shipping status
                  </span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) =>
                    setNewStatus(value as ShippingStatus)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue>
                      {newStatus || currentShipping?.status || "Select new status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAllowedStatuses(currentShipping?.status as ShippingStatus).map((status) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAllowedStatuses(currentShipping?.status as ShippingStatus).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {getAllowedStatuses(currentShipping?.status as ShippingStatus).length} status option(s) available
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  placeholder="E.g., Distribution Center, Local Branch"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Status Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add additional information about this status update..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={loadingAction}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={loadingAction}>
                {loadingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this shipping record? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {currentShipping && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-700 text-sm mb-4">
                  <p className="font-semibold mb-1">Warning:</p>
                  <p>You are about to delete a shipping record for:</p>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li>Order ID: {currentShipping.order?.id || "Unknown"}</li>
                    <li>
                      Recipient: {currentShipping.customer?.email || "Unknown"}
                    </li>
                    <li>Status: {currentShipping.status || "Unknown"}</li>
                    <li>
                      Products:{" "}
                      {typeof currentShipping.productSummary === "string"
                        ? currentShipping.productSummary
                        : currentShipping.items &&
                          currentShipping.items.length > 0
                        ? `${currentShipping.items.length} items`
                        : "Unknown"}
                    </li>
                    {currentShipping.totalAmount && (
                      <li>
                        Amount:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(currentShipping.totalAmount)}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={loadingAction}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteShipping}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Items Dialog */}
        <Dialog
          open={orderItemsDialogOpen}
          onOpenChange={setOrderItemsDialogOpen}
        >
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Items</DialogTitle>
              <DialogDescription>
                Items included in this shipment
              </DialogDescription>
            </DialogHeader>

            {loadingOrderItems ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading order items...</p>
              </div>
            ) : orderItems.length === 0 ? (
              <div className="text-center py-12">
                <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No items found</h3>
                <p className="text-muted-foreground mt-1">
                  There are no items associated with this order or the data is
                  unavailable
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.productName || "Unknown Product"}
                            </span>
                            {item.productId && (
                              <span className="text-xs text-muted-foreground">
                                ID: {item.productId}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.price || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(
                            item.subtotal || item.price * item.quantity || 0
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-right font-medium"
                      >
                        Total:
                      </td>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-right font-bold"
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          orderItems.reduce(
                            (sum, item) =>
                              sum +
                              (item.subtotal ||
                                item.price * item.quantity ||
                                0),
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setOrderItemsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shipping Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chi tiết vận chuyển</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về lô hàng này
              </DialogDescription>
            </DialogHeader>

            {currentShipping && (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5" /> Thông tin đơn hàng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-medium">
                          {(() => {
                            // Check for order.id first (new API format)
                            if (
                              currentShipping.order &&
                              (currentShipping.order.id ||
                                currentShipping.order._id)
                            ) {
                              return (
                                currentShipping.order.id ||
                                currentShipping.order._id
                              );
                            }

                            // Fall back to orderId
                            if (!currentShipping.orderId) return "N/A";

                            if (typeof currentShipping.orderId === "string") {
                              return currentShipping.orderId;
                            }

                            if (
                              typeof currentShipping.orderId === "object" &&
                              currentShipping.orderId
                            ) {
                              const orderIdObj =
                                currentShipping.orderId as Record<string, any>;
                              return (
                                orderIdObj.id ||
                                orderIdObj._id ||
                                "Order Reference"
                              );
                            }

                            return "Processing";
                          })()}
                        </span>
                      </div>

                      {/* Order Status */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Shipping Status:
                        </span>
                        <Badge
                          className={`${getStatusColor(
                            currentShipping.status || ""
                          )}`}
                        >
                          {currentShipping.status || "Unknown"}
                        </Badge>
                      </div>

                      {/* Order Status (if available) */}
                      {currentShipping.order &&
                        currentShipping.order.status && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Order Status:
                            </span>
                            <Badge
                              className={`${getStatusColor(
                                currentShipping.order.status
                              )}`}
                            >
                              {currentShipping.order.status}
                            </Badge>
                          </div>
                        )}

                      {/* Created Date */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {formatDate(currentShipping.createdAt || undefined)}
                        </span>
                      </div>

                      {/* Total Amount (from multiple sources) */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Amount:
                        </span>
                        <span>
                          {(() => {
                            const amount =
                              currentShipping.totalAmount ||
                              (currentShipping.order
                                ? currentShipping.order.totalAmount
                                : null);

                            return amount
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(amount)
                              : "N/A";
                          })()}
                        </span>
                      </div>

                      {/* Transaction Info (if available) */}
                      {currentShipping.transaction && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Payment:
                          </span>
                          <span>
                            {currentShipping.transaction.paymentMethod ||
                              "Payment received"}
                            {currentShipping.transaction.status &&
                              ` (${currentShipping.transaction.status})`}
                          </span>
                        </div>
                      )}

                      {/* Delivery Dates */}
                      {currentShipping.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Est. Delivery:
                          </span>
                          <span>
                            {formatDate(currentShipping.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                      {currentShipping.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Actual Delivery:
                          </span>
                          <span>
                            {formatDate(currentShipping.actualDelivery)}
                          </span>
                        </div>
                      )}

                      {/* View Order Details Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          // Get order ID from nested order object (new API format)
                          const orderId = currentShipping.order?.id;

                          if (orderId) {
                            viewOrderDetails(orderId);
                          } else {
                            toast.error("Order ID not found");
                          }
                        }}
                        disabled={!currentShipping.order?.id}
                      >
                        View Order Details
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <User className="h-5 w-5" /> Recipient Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">
                          {currentShipping.customer?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>
                          {currentShipping.customer?.phone ||
                            currentShipping.order?.contactPhone ||
                            "Not provided"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground mb-1">
                          Address:
                        </span>
                        <span className="text-right">
                          {currentShipping.customer?.address ||
                            currentShipping.order?.shippingAddress ||
                            "Address not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <TruckIcon className="h-5 w-5" /> Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier:</span>
                        <span>
                          {currentShipping.carrier || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tracking Number:
                        </span>
                        <span className="font-medium">
                          {currentShipping.trackingNumber || "Not assigned"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Current Location:
                        </span>
                        <span>
                          {currentShipping.currentLocation || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentShipping.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span>{currentShipping.weight} kg</span>
                        </div>
                      )}
                      {currentShipping.dimensions &&
                        currentShipping.dimensions.length &&
                        currentShipping.dimensions.width &&
                        currentShipping.dimensions.height && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Dimensions:
                            </span>
                            <span>
                              {currentShipping.dimensions.length} ×{" "}
                              {currentShipping.dimensions.width} ×{" "}
                              {currentShipping.dimensions.height} cm
                            </span>
                          </div>
                        )}
                      {currentShipping.cost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Shipping Cost:
                          </span>
                          <span>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(currentShipping.cost)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Signature Required:
                        </span>
                        <span>
                          {currentShipping.hasSignatureConfirmation === true
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {currentShipping.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Clipboard className="h-5 w-5" /> Notes
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {currentShipping.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Product Summary - handles both string and object formats */}
                {currentShipping.productSummary && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <PackageOpen className="h-5 w-5" /> Package Contents
                      </h3>

                      {/* Handle when productSummary is a string */}
                      {typeof currentShipping.productSummary === "string" ? (
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          <p className="text-sm">
                            {currentShipping.productSummary}
                          </p>
                          {(currentShipping.itemCount ||
                            currentShipping.totalQuantity) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentShipping.itemCount || 0} products,{" "}
                              {currentShipping.totalQuantity || 0} items total
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Handle when productSummary is an object */
                        <>
                          {(currentShipping.productSummary.count ||
                            currentShipping.productSummary.totalQuantity) && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {currentShipping.productSummary.count ||
                                currentShipping.itemCount ||
                                0}{" "}
                              products,
                              {currentShipping.productSummary.totalQuantity ||
                                currentShipping.totalQuantity ||
                                0}{" "}
                              items total
                            </p>
                          )}

                          {currentShipping.productSummary.items &&
                            currentShipping.productSummary.items.length > 0 && (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                                      <TableHead className="text-right">
                                        Quantity
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Price
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {currentShipping.productSummary.items.map(
                                      (item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {item.productName ||
                                              "Unknown Product"}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {item.quantity || 0}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {new Intl.NumberFormat("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                            }).format(item.price || 0)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Fallback to items array if productSummary doesn't exist */}
                {!currentShipping.productSummary &&
                  currentShipping.items &&
                  currentShipping.items.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                          <PackageOpen className="h-5 w-5" /> Package Contents
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {currentShipping.items.length} products,{" "}
                          {currentShipping.items.reduce(
                            (sum, item) => sum + (item.quantity || 1),
                            0
                          )}{" "}
                          items total
                        </p>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">
                                  Quantity
                                </TableHead>
                                <TableHead className="text-right">
                                  Price
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentShipping.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {item.productName || "Unknown Product"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.quantity || 0}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(item.price || 0)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  )}

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5" /> Admin Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const allowedStatuses = getAllowedStatuses(currentShipping?.status as ShippingStatus);
                      const hasUpdatePermission = allowedStatuses.length > 0;
                      
                      return (
                        <Button
                          onClick={() => {
                            setDetailDialogOpen(false);
                            setNewStatus(currentShipping.status as ShippingStatus);
                            setCurrentLocation(
                              currentShipping.currentLocation || ""
                            );
                            setStatusNote("");
                            setStatusDialogOpen(true);
                          }}
                          disabled={!hasUpdatePermission}
                          className="flex gap-2 items-center"
                          title={!hasUpdatePermission ? 
                            (user?.role === Role.STAFF ? 
                              "No further status changes available" : 
                              "No status changes allowed") : 
                            "Update shipping status"
                          }
                        >
                          <Clock className="h-4 w-4" /> Update Status
                        </Button>
                      );
                    })()}

                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!currentShipping) return;

                        // Get order ID - first from order object, then from orderId field
                        let orderId = "";
                        if (currentShipping.order) {
                          orderId =
                            currentShipping.order.id ||
                            currentShipping.order._id ||
                            "";
                        }

                        // Fall back to extracting from orderId if needed
                        if (!orderId && currentShipping.orderId) {
                          orderId = extractOrderId(currentShipping.orderId);
                        }

                        if (orderId) {
                          setDetailDialogOpen(false);
                          loadOrderItems(orderId, currentShipping); // Pass the shipping log
                          setOrderItemsDialogOpen(true);
                        } else {
                          toast.error("Order ID not found");
                        }
                      }}
                      className="flex gap-2 items-center"
                    >
                      <PackageOpen className="h-4 w-4" /> View Items
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex gap-2 items-center"
                    >
                      <XCircle className="h-4 w-4" /> Delete Record
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDetailDialogOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      )}
    </RoleRoute>
  );
}
