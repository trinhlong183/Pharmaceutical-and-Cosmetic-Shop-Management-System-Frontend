'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderService, Order } from '@/api/orderService';
import { Loader2, Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link href="/products">
          <Button variant="outline">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading your orders...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    <CardDescription>
                      Placed on {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Items ({order.items.length})</h3>
                    <div className="grid gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 border-b pb-3">
                          <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Product ID: {item.productId}</div>
                            <div className="text-sm text-gray-500">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </div>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
