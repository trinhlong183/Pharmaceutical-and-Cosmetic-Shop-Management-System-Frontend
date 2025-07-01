"use client";

import { useState, useEffect } from "react";
import { shippingLogsService, ShippingLog, ShippingStatus } from "@/api/shippingLogsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Clock,
  Package,
  CheckCircle2,
  TruckIcon,
  MapPin,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Box
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ShipmentTrackingProps {
  orderId: string;
}

export default function ShipmentTracking({ orderId }: ShipmentTrackingProps) {
  const [shippingLog, setShippingLog] = useState<ShippingLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean and validate orderId before proceeding
    const cleanOrderId = orderId?.trim() || '';
    if (!cleanOrderId) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    const controller = new AbortController(); // For cleanup on unmount
    
    async function fetchShippingData() {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        // Check authentication
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("Authentication required");
          return;
        }
        
        // Add a small delay to prevent too many rapid calls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use the service's method with the clean ID
        const logs = await shippingLogsService.getByOrderId(cleanOrderId);
        
        // Process the response
        if (logs && Array.isArray(logs) && logs.length > 0) {
          // Find the most recent log if multiple exist
          const sortedLogs = [...logs].sort((a, b) => {
            const dateA = a.updatedAt || a.createdAt || '';
            const dateB = b.updatedAt || b.createdAt || '';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          
          setShippingLog(sortedLogs[0]);
        } else {
          setShippingLog(null);
          setError("No shipping information available for this order yet");
        }
      } catch (err) {
        console.error(`Error in shipping tracking component for order ${cleanOrderId}:`, err);
        
        if (err instanceof Error) {
          // Provide more specific error messages for better UX
          if (err.message.includes("Network") || err.message.includes("fetch")) {
            setError("Network error. Please check your connection and try again");
          } else {
            setError("Could not retrieve shipping information");
          }
        } else {
          setError("Could not display shipping information");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchShippingData();
    
    // Cleanup on component unmount
    return () => controller.abort();
  }, [orderId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusInfo = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return {
        icon: <Clock className="h-5 w-5 text-gray-500" />,
        title: "Unknown",
        description: "Status information not available",
        color: "text-gray-500",
        badge: "bg-gray-100 text-gray-800 border-gray-200"
      };
    }
    
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case ShippingStatus.PENDING:
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: "Pending",
          description: "Your order is being prepared for shipment",
          color: "text-yellow-500",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
      case ShippingStatus.PROCESSING:
        return {
          icon: <Box className="h-5 w-5 text-blue-500" />,
          title: "Processing",
          description: "Your order is being packaged",
          color: "text-blue-500",
          badge: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case ShippingStatus.SHIPPED:
        return {
          icon: <Package className="h-5 w-5 text-indigo-500" />,
          title: "Shipped",
          description: "Your order has been shipped",
          color: "text-indigo-500",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200"
        };
      case ShippingStatus.IN_TRANSIT:
        return {
          icon: <TruckIcon className="h-5 w-5 text-purple-500" />,
          title: "In Transit",
          description: "Your package is on the way",
          color: "text-purple-500",
          badge: "bg-purple-100 text-purple-800 border-purple-200"
        };

      case ShippingStatus.DELIVERED:
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: "Delivered",
          description: "Your package has been delivered",
          color: "text-green-500",
          badge: "bg-green-100 text-green-800 border-green-200"
        };
      case ShippingStatus.RECEIVED:
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          title: "Received",
          description: "You have received your package",
          color: "text-emerald-500",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
      case ShippingStatus.RETURNED:
        return {
          icon: <RefreshCw className="h-5 w-5 text-orange-500" />,
          title: "Returned",
          description: "Your package is being returned",
          color: "text-orange-500",
          badge: "bg-orange-100 text-orange-800 border-orange-200"
        };

      case ShippingStatus.CANCELLED:
        return {
          icon: <XCircle className="h-5 w-5 text-gray-500" />,
          title: "Cancelled",
          description: "This shipment was cancelled",
          color: "text-gray-500",
          badge: "bg-gray-100 text-gray-800 border-gray-200"
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          title: "Unknown",
          description: "Status unknown",
          color: "text-gray-500",
          badge: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  // Define the status steps in order
  const steps = [
    ShippingStatus.PENDING,
    ShippingStatus.PROCESSING,
    ShippingStatus.SHIPPED,
    ShippingStatus.IN_TRANSIT,
    ShippingStatus.DELIVERED,
    ShippingStatus.RECEIVED
  ];

  // Determine the current step index
  const getCurrentStepIndex = () => {
    if (!shippingLog || !shippingLog.status) return -1;
    
    // Handle special cases first
    if ([ShippingStatus.RETURNED, ShippingStatus.CANCELLED].includes(shippingLog.status as ShippingStatus)) {
      return -2; // Special status that doesn't fit in the normal flow
    }
    
    // Safely check if status exists before calling toLowerCase
    const status = shippingLog.status;
    if (typeof status !== 'string' || !status.trim()) return -1;
    
    const normalizedStatus = status.toLowerCase();
    return steps.findIndex(step => step.toLowerCase() === normalizedStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-300">
            <Package className="h-5 w-5" /> Shipment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-2 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !shippingLog) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> Shipment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          {error ? (
            <div className="text-muted-foreground">
              {/* Show a different icon based on error type */}
              {error.includes("No shipping information") ? (
                <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
              ) : (
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              )}
              <p>{error}</p>
              {error.includes("No shipping information") && (
                <p className="text-sm mt-1">The order may still be in processing</p>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No shipping information available yet</p>
              <p className="text-sm mt-1">The order may still be in processing</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(shippingLog?.status);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" /> Shipment Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <div>
              <p className="font-medium">
                Status: <Badge className={statusInfo.badge}>{statusInfo.title}</Badge>
              </p>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>
          
          {shippingLog.trackingNumber && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-medium">{shippingLog.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Normal shipping flow progress */}
        {currentStepIndex >= 0 && (
          <div className="pt-2">
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200"></div>
              <div 
                className="absolute left-0 top-4 h-0.5 bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
              ></div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const stepInfo = getStatusInfo(step);
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCurrent 
                            ? 'bg-primary text-white ring-4 ring-primary/20' 
                            : isActive 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {stepInfo.icon}
                      </div>
                      <span className={`text-[10px] text-center mt-1 max-w-12 ${
                        isActive ? `${stepInfo.color} font-medium` : 'text-gray-400'
                      }`}>
                        {stepInfo.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* For special statuses that don't fit in the normal flow */}
        {currentStepIndex === -2 && (
          <div className="flex flex-col items-center py-4 px-6 bg-gray-50 rounded-lg">
            {statusInfo.icon}
            <p className="mt-2 font-medium">{statusInfo.title}</p>
            <p className="text-sm text-muted-foreground text-center">{statusInfo.description}</p>
            {shippingLog.notes && <p className="mt-2 text-sm italic">{shippingLog.notes}</p>}
          </div>
        )}

        <Separator />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Recipient</p>
            <p className="font-medium">{shippingLog.recipientName}</p>
            <p>{shippingLog.recipientPhone}</p>
            <p className="mt-1 text-muted-foreground">{shippingLog.shippingAddress}</p>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Estimated Delivery
              </p>
              <p>{shippingLog.estimatedDelivery ? formatDate(shippingLog.estimatedDelivery) : "Not available"}</p>
            </div>
            
            {shippingLog.carrier && (
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <TruckIcon className="h-3.5 w-3.5" /> Carrier
                </p>
                <p>{shippingLog.carrier}</p>
              </div>
            )}
            
            {shippingLog.currentLocation && (
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Current Location
                </p>
                <p>{shippingLog.currentLocation}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
