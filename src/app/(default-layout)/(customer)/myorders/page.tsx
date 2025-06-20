'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderService, Order } from '@/api/orderService';
import { 
  Loader2, Package, ShoppingBag, AlertCircle, 
  ChevronDown, ChevronUp, Clock, CheckCircle2, 
  TruckIcon, Box, XCircle, ArrowRight, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await orderService.getCurrentUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error loading orders:', err);
        if (err instanceof Error && err.message.includes('Authentication token is missing')) {
          setIsAuthenticated(false);
        } else {
          setError('Failed to load orders. Please try again later.');
          toast.error('Failed to load orders');
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
      toast.error('Please login to view your orders');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Box className="h-5 w-5" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders by status
  const pendingOrders = orders.filter(order => 
    ['pending', 'processing', 'shipped'].includes(order.status.toLowerCase())
  );
  const completedOrders = orders.filter(order => 
    order.status.toLowerCase() === 'delivered'
  );
  const cancelledOrders = orders.filter(order => 
    order.status.toLowerCase() === 'cancelled'
  );

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
          <span className="mt-6 text-lg text-gray-600">Loading your orders...</span>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <div className="text-xl font-medium text-gray-900 mb-2">Sorry, something went wrong</div>
          <div className="text-gray-500 mb-6 max-w-md mx-auto">{error}</div>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-6 h-auto text-lg">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              <OrderList orders={orders} />
            </TabsContent>
            
            <TabsContent value="active" className="space-y-6">
              {pendingOrders.length > 0 ? (
                <OrderList orders={pendingOrders} />
              ) : (
                <EmptyState message="No active orders at the moment" />
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-6">
              {completedOrders.length > 0 ? (
                <OrderList orders={completedOrders} />
              ) : (
                <EmptyState message="No completed orders yet" />
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-6">
              {cancelledOrders.length > 0 ? (
                <OrderList orders={cancelledOrders} />
              ) : (
                <EmptyState message="No cancelled orders" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
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

  function OrderList({ orders }: { orders: Order[] }) {
    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    Order #{order.id.slice(-6)}
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 ml-2`}>
                      <span className="md:hidden">{getStatusIcon(order.status)}</span>
                      <span>{order.status}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="font-medium">{order.items.length} items</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount:</div>
                  <div className="font-bold text-lg">{formatCurrency(order.totalAmount)}</div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>Details <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>Details <ChevronDown className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
            
            {expandedOrder === order.id && (
              <CardContent className="p-0">
                <div className="p-6 border-t border-gray-100 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Order Items
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">Product ID: {item.productId}</div>
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
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
        ))}
      </div>
    );
  }
}
