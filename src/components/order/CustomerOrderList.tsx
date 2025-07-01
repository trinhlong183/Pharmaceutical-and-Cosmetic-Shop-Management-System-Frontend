import React from 'react';
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  TruckIcon,
  RefreshCw,
  Calendar,
  Star,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/order/StatusBadge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { getUnifiedStatus } from "@/utils/statusUtils";
import ShipmentTracking from "@/components/ShipmentTracking";

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

interface ExtendedOrder {
  id: string;
  _id?: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: ExtendedOrderItem[];
  userId: any;
  processedBy?: any;
  shippingAddress?: string;
  contactPhone?: string;
  itemCount?: number;
  totalQuantity?: number;
  rejectionReason?: string;
  refundReason?: string;
  refundedAt?: string;
  notes?: string;
}

interface CustomerOrderListProps {
  orders: ExtendedOrder[];
  expandedOrder: string | null;
  productReviews: Record<string, any>;
  onToggleExpand: (orderId: string) => void;
  onOpenReviewDialog: (productId: string, review?: any) => void;
  onOpenConfirmDialog: (orderId: string) => void;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  getProcessorName: (processedBy: any) => string;
}

export const CustomerOrderList: React.FC<CustomerOrderListProps> = ({
  orders,
  expandedOrder,
  productReviews,
  onToggleExpand,
  onOpenReviewDialog,
  onOpenConfirmDialog,
  formatDate,
  formatCurrency,
  getProcessorName,
}) => {
  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const unifiedStatus = getUnifiedStatus(order.status, null, true);
        const progressPercentage = Math.round((unifiedStatus.stage / 7) * 100);

        return (
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
            {/* Status-specific headers */}
            {order.status.toLowerCase() === "pending" && (
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
            )}
            
            {order.status.toLowerCase() === "refunded" && (
              <div className="bg-emerald-50 px-6 py-3 flex items-center gap-3 border-b border-emerald-100">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    This order has been refunded. Your payment has been returned.
                  </p>
                  {order.refundedAt && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Refunded on: {formatDate(order.refundedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Main order info */}
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center">
                  <span className="text-xl">{unifiedStatus.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{order.id.slice(-6)}
                    <StatusBadge 
                      orderStatus={order.status} 
                      shippingLog={null}
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
                    {/* Progress indicator */}
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span>{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
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
                  onClick={() => onToggleExpand(order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>Details <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>Details <ChevronDown className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded content */}
            {expandedOrder === order.id && (
              <CardContent className="p-0">
                <div className="p-6 border-t border-gray-100 space-y-6">
                  {/* Order Timeline */}
                  <OrderTimeline
                    orderStatus={order.status}
                    shippingLog={null}
                    createdAt={order.createdAt}
                    isCustomerView={true}
                  />

                  {/* Shipment Tracking for applicable orders */}
                  {['approved', 'processing', 'shipped', 'shipping', 'in_transit', 'delivered'].includes(order.status.toLowerCase()) && (
                    <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                      <h3 className="font-medium flex items-center gap-2">
                        <TruckIcon className="h-4 w-4" />
                        Shipment Tracking
                      </h3>
                      <ShipmentTracking orderId={order.id} />
                      
                      {/* Confirm Receipt for delivered orders */}
                      {order.status.toLowerCase() === "delivered" && (
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
                              onClick={() => onOpenConfirmDialog(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Confirm Receipt
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items */}
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
                                Product: {item.productDetails?.productName || item.productName}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Unit Price:</div>
                              <div>{formatCurrency(item.price)}</div>
                              <div className="font-semibold mt-1">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              
                              {/* Review section for delivered orders */}
                              {order.status.toLowerCase() === "delivered" && (
                                <div className="mt-4 flex flex-col items-end">
                                  {!productReviews[item.productId] ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => onOpenReviewDialog(item.productId)}
                                    >
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      Review
                                    </Button>
                                  ) : (
                                    <div className="group relative w-full flex flex-col items-end">
                                      <div className="mt-1 text-xs text-gray-600 text-left w-full flex items-center justify-end gap-2">
                                        <span className="flex items-center gap-1">
                                          {Array.from(
                                            { length: productReviews[item.productId]?.rating || 0 },
                                            (_, i) => (
                                              <Star
                                                key={i}
                                                className="h-3 w-3 text-yellow-400 fill-yellow-400"
                                              />
                                            )
                                          )}
                                        </span>
                                        <span>{productReviews[item.productId]?.content}</span>
                                        <button
                                          type="button"
                                          className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Edit review"
                                          onClick={() => onOpenReviewDialog(item.productId, productReviews[item.productId])}
                                        >
                                          Edit
                                        </button>
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

                  {/* Status-specific information sections */}
                  {order.status.toLowerCase() === "pending" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Order Status
                      </h3>
                      <div className="bg-yellow-50 rounded-lg p-4 text-yellow-800">
                        <p className="text-sm mb-3">
                          Your order has been received and is currently being reviewed. 
                          We'll notify you once it's confirmed and begins processing.
                        </p>
                        <div className="mt-3 text-xs text-yellow-700">
                          Orders are typically confirmed within 24 hours
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status.toLowerCase() === "rejected" && order.rejectionReason && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        Rejection Information
                      </h3>
                      <div className="bg-red-50 rounded-lg p-4 text-red-800">
                        <div className="font-medium mb-1">Rejection Reason:</div>
                        <p className="text-sm">{order.rejectionReason}</p>
                        {order.processedBy && (
                          <div className="text-xs text-red-600 mt-2">
                            Processed by: {getProcessorName(order.processedBy)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.status.toLowerCase() === "refunded" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-emerald-500" />
                        Refund Information
                      </h3>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-emerald-800">
                        {order.refundReason && (
                          <>
                            <div className="font-medium mb-1">Refund Reason:</div>
                            <p className="text-sm mb-3">{order.refundReason}</p>
                          </>
                        )}
                        {order.rejectionReason && (
                          <>
                            <div className="font-medium mb-1">Original Rejection Reason:</div>
                            <p className="text-sm">{order.rejectionReason}</p>
                          </>
                        )}
                        {order.notes && (
                          <>
                            <div className="font-medium mb-1 mt-3">Additional Notes:</div>
                            <p className="text-sm">{order.notes}</p>
                          </>
                        )}
                        {order.processedBy && (
                          <div className="text-xs text-emerald-600 mt-3 pt-3 border-t border-emerald-100">
                            Processed by: {getProcessorName(order.processedBy)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order total */}
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

                  {/* Support section */}
                  <div className="bg-gray-50 -mx-6 -mb-6 p-6 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">Need help with this order?</div>
                      <div className="text-sm text-gray-500">Contact our support team</div>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      Contact Support <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
