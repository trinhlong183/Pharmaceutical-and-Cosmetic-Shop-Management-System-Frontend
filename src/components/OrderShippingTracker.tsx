"use client";

import { useState, useEffect } from "react";
import { ShippingLog, ShippingStatus } from "@/api/shippingLogsService";
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
  Box,
  Truck,
  Home,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderShippingTrackerProps {
  shippingLog: ShippingLog | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function OrderShippingTracker({ shippingLog, loading, onRefresh }: OrderShippingTrackerProps) {
  // Debug logging
  console.log('OrderShippingTracker received props:', {
    shippingLog,
    loading,
    status: shippingLog?.status,
    hasOnRefresh: !!onRefresh
  });
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
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: "Pending",
          description: "Your order is being prepared for shipment",
          color: "text-yellow-500",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
      case 'processing':
        return {
          icon: <Box className="h-5 w-5 text-blue-500" />,
          title: "Processing",
          description: "Your order is being packaged",
          color: "text-blue-500",
          badge: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case 'shipped':
        return {
          icon: <Package className="h-5 w-5 text-indigo-500" />,
          title: "Shipped",
          description: "Your order has been shipped",
          color: "text-indigo-500",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200"
        };
      case 'in transit':
        return {
          icon: <TruckIcon className="h-5 w-5 text-purple-500" />,
          title: "In Transit",
          description: "Your package is on the way",
          color: "text-purple-500",
          badge: "bg-purple-100 text-purple-800 border-purple-200"
        };
      case 'delivered':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: "Delivered",
          description: "Your package has been delivered",
          color: "text-green-500",
          badge: "bg-green-100 text-green-800 border-green-200"
        };
      case 'received':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          title: "Received",
          description: "You have confirmed receipt of your package",
          color: "text-emerald-500",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
      case 'returned':
        return {
          icon: <RefreshCw className="h-5 w-5 text-orange-500" />,
          title: "Returned",
          description: "Your package is being returned",
          color: "text-orange-500",
          badge: "bg-orange-100 text-orange-800 border-orange-200"
        };
      case 'cancelled':
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

  // Define the shipping timeline steps
  const shippingSteps = [
    {
      key: 'pending',
      title: 'Order Confirmed',
      icon: <Clock className="h-4 w-4" />,
      description: 'Order received and confirmed'
    },
    {
      key: 'processing',
      title: 'Processing',
      icon: <Box className="h-4 w-4" />,
      description: 'Preparing your order'
    },
    {
      key: 'in transit',
      title: 'In Transit',
      icon: <Truck className="h-4 w-4" />,
      description: 'On the way to you'
    },
    {
      key: 'shipped',
      title: 'Shipped',
      icon: <Package className="h-4 w-4" />,
      description: 'Package has dilivered to you',
    },
    {
      key: 'delivered',
      title: 'Delivered',
      icon: <Home className="h-4 w-4" />,
      description: 'Package delivered'
    }
  ];

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!shippingLog || !shippingLog.status) return -1;
    
    // Handle special cases
    if (['returned', 'cancelled'].includes(shippingLog.status.toLowerCase())) {
      return -2; // Special status
    }
    
    if (shippingLog.status.toLowerCase() === 'received') {
      return shippingSteps.length; // Beyond the last step
    }
    
    const currentStatus = shippingLog.status.toLowerCase();
    return shippingSteps.findIndex(step => step.key === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-300">
            <Package className="h-5 w-5" /> Shipping Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="flex justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
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

  if (!shippingLog) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Shipping Status
            </CardTitle>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
          <p className="text-muted-foreground font-medium">Preparing for shipment</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your order is being processed and will be shipped soon
          </p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="mt-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check for updates
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(shippingLog.status);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> Shipping Status
          </CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <Badge className={statusInfo.badge}>{statusInfo.title}</Badge>
              <p className="text-sm text-muted-foreground mt-1">{statusInfo.description}</p>
              {/* Debug info - remove in production */}
              <p className="text-xs text-gray-400 mt-1">
                Raw Status: {shippingLog.status} | Updated: {shippingLog.updatedAt ? formatDate(shippingLog.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>
          
          {shippingLog.trackingNumber && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-medium text-sm">{shippingLog.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Shipping Timeline for normal flow */}
        {currentStepIndex >= 0 && currentStepIndex < shippingSteps.length && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Shipping Progress</h4>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
              <div 
                className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-blue-500 to-green-500 transition-all duration-500"
                style={{ 
                  height: currentStepIndex >= 0 ? `${(currentStepIndex / (shippingSteps.length - 1)) * 100}%` : '0%' 
                }}
              ></div>
              
              {/* Steps */}
              <div className="space-y-6">
                {shippingSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCurrent 
                            ? 'bg-blue-500 text-white ring-4 ring-blue-100' 
                            : isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-h-8 flex flex-col justify-center">
                        <p className={`font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-sm ${
                          isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                        {isCurrent && shippingLog.updatedAt && (
                          <p className="text-xs text-blue-600 mt-1">
                            Updated: {formatDate(shippingLog.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Special status display for returned/cancelled */}
        {currentStepIndex === -2 && (
          <div className="flex flex-col items-center py-6 px-4 bg-gray-50 rounded-lg">
            {statusInfo.icon}
            <p className="mt-2 font-medium">{statusInfo.title}</p>
            <p className="text-sm text-muted-foreground text-center">{statusInfo.description}</p>
            {shippingLog.notes && (
              <p className="mt-2 text-sm italic text-center bg-white px-3 py-2 rounded border">
                {shippingLog.notes}
              </p>
            )}
          </div>
        )}

        {/* Additional Information */}
        <Separator />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="font-medium text-muted-foreground">Delivery Information</h5>
            <div>
              <p className="font-medium">{shippingLog.recipientName || 'Not specified'}</p>
              <p className="text-muted-foreground">{shippingLog.recipientPhone || 'No phone'}</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {shippingLog.shippingAddress || 'Address not specified'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-muted-foreground">Shipping Details</h5>
            
            {shippingLog.carrier && (
              <div className="flex items-center gap-2">
                <TruckIcon className="h-3 w-3 text-muted-foreground" />
                <span>Carrier: {shippingLog.carrier}</span>
              </div>
            )}
            
            {shippingLog.currentLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>Current: {shippingLog.currentLocation}</span>
              </div>
            )}
            
            {shippingLog.estimatedDelivery && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Est. Delivery: {formatDate(shippingLog.estimatedDelivery)}</span>
              </div>
            )}

            {/* Product Summary */}
            {shippingLog.productSummary && typeof shippingLog.productSummary === 'string' && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <p className="font-medium text-muted-foreground mb-1">Items:</p>
                <p>{shippingLog.productSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        {shippingLog.updatedAt && (
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(shippingLog.updatedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
