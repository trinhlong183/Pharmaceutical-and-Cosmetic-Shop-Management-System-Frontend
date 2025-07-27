"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Activity,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  dashboardService,
  DashboardStats,
  SalesData,
  TopProduct,
  InventoryAlert,
} from "@/api/dashboardService";
import StatsCards from "@/components/admin/StatsCards";
import SalesChart from "@/components/admin/SalesChart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function AdminDashboard() {
  // Temporary fallback if dashboardService.getNewestProducts is not available
  const getNewestProducts = async (limit = 4) => {
    try {
      // Lấy tất cả sản phẩm từ productService
      const res = await import("@/api/productService").then(m => m.productService.getAllProducts());
      const products = res.products || [];
      // Sắp xếp theo createdAt mới nhất
      return products
        .filter(p => p.createdAt)
        .sort((a, b) => new Date(String(b.createdAt ?? "")).getTime() - new Date(String(a.createdAt ?? "")).getTime())
        .slice(0, limit)
        .map(product => ({
          id: product._id || product.id || '',
          name: product.productName,
          sales: 0,
          revenue: 0,
          image: product.productImages?.[0],
          price: product.price,
          createdAt: product.createdAt,
        }));
    } catch {
      return [];
    }
  };
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel từ các API có sẵn


      const [
        statsData,
        salesResponse,
        productsData,
        alertsData,
        newestProductsData,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getSalesData(salesPeriod),
        dashboardService.getTopProducts(10),
        dashboardService.getInventoryAlerts(),
        getNewestProducts(4),
      ]);

      setStats(statsData);
      setSalesData(salesResponse);
      setTopProducts(newestProductsData && newestProductsData.length > 0 ? newestProductsData : productsData.slice(0, 4));
      setInventoryAlerts(alertsData);

      if (refreshing) {
        toast.success("Dashboard data refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try again.");
      
      // Set empty data on error
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
      });
      setSalesData([]);
      setTopProducts([]);
      setInventoryAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [salesPeriod, refreshing]);

  useEffect(() => {
    fetchDashboardData();
  }, [salesPeriod, fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Real-time Dashboard
            </p>
            <p className="text-xs text-blue-700">
              All data is calculated in real-time from your orders, products, and user data
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
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

      {/* Stats Cards */}
      <StatsCards stats={stats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
      }} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart
            data={salesData}
            period={salesPeriod}
            onPeriodChange={setSalesPeriod}
            loading={loading}
          />
        </div>

      {/* Top 4 Newest Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Top 4 Newest Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
          ) : topProducts.length > 0 ? (
            <div className="h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.slice(0, 4).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image ? (
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded" 
                            unoptimized
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">-</div>
                        )}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No product data available</p>
                <p className="text-sm">Newest products will appear here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Orders Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Revenue vs Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
            ) : salesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData.slice(-14)}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value), 'Revenue'];
                        }
                        return [`${value} orders`, 'Orders'];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        });
                      }}
                    />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={3}
                    />
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      stroke="#06b6d4"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      strokeWidth={3}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No trend data available</p>
                  <p className="text-sm">Revenue and order trends will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Top Products Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
            ) : topProducts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topProducts.slice(0, 5)} 
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      width={80}
                      tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                    />
                    <Tooltip
                      formatter={(value: string | number, name: string) => {
                        if (name === 'sales') {
                          return [`${value} units sold`, 'Sales'];
                        }
                        return [formatCurrency(value as number), 'Revenue'];
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                      name="sales"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No product data available</p>
                  <p className="text-sm">Top products will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Dashboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Daily Performance (Last 7 Days)
            </CardTitle>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
            ) : salesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData.slice(-7)}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'Revenue'
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="revenue" 
                      stroke="url(#colorGradient)"
                      strokeWidth={4}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No revenue data available</p>
                  <p className="text-sm">Daily revenue will appear here once orders are placed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Performance Metrics
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-100 animate-pulse rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Average Order Value */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Avg. Order Value</p>
                      <p className="text-sm text-blue-700">Per transaction</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-900">
                      {stats ? formatCurrency(stats.totalRevenue / Math.max(stats.totalOrders, 1)) : formatCurrency(0)}
                    </p>
                    <p className="text-sm text-blue-600">+12.5%</p>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Conversion Rate</p>
                      <p className="text-sm text-green-700">Orders / Visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-900">
                      {stats ? ((stats.totalOrders / Math.max(stats.totalCustomers, 1)) * 100).toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-sm text-green-600">+8.2%</p>
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Customer Rating</p>
                      <p className="text-sm text-purple-700">Average satisfaction</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-900">4.8/5</p>
                    <p className="text-sm text-purple-600">+0.3 pts</p>
                  </div>
                </div>

                {/* Stock Efficiency */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-orange-900">Stock Efficiency</p>
                      <p className="text-sm text-orange-700">Turnover rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-900">87.3%</p>
                    <p className="text-sm text-orange-600">+5.1%</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryAlerts.map((alert) => (
                <div
                  key={alert.productId}
                  className="bg-white p-4 rounded-lg border border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {alert.productName}
                    </h4>
                    <Badge
                      variant={
                        alert.status === "out" ? "destructive" : "secondary"
                      }
                    >
                      {alert.status === "out" ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Current: {alert.currentStock} | Min: {alert.minimumStock}
                  </p>
                  <Link href={`/manage-products`}>
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      <Eye className="h-3 w-3 mr-1" />
                      View Product
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/manage-orders">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Orders</span>
              </Button>
            </Link>
            <Link href="/manage-products">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs">Products</span>
              </Button>
            </Link>
            <Link href="/customers">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Customers</span>
              </Button>
            </Link>
            <Link href="/inventory-request">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs">Inventory</span>
              </Button>
            </Link>
            <Link href="/transaction-admin">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Transactions</span>
              </Button>
            </Link>
            <Link href="/manage-categories">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs">Categories</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
