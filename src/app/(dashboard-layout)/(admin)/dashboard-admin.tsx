"use client";

import React, { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  AlertTriangle,
  Activity,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  dashboardService,
  DashboardStats,
  SalesData,
  TopProduct,
  CategorySales,
  RecentActivity,
  InventoryAlert,
} from "@/api/dashboardService";
import StatsCards from "@/components/admin/StatsCards";
import SalesChart from "@/components/admin/SalesChart";
import TopProductsTable from "@/components/admin/TopProductsTable";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        statsData,
        salesResponse,
        productsData,
        categoryData,
        activityData,
        alertsData,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getSalesData(salesPeriod),
        dashboardService.getTopProducts(10),
        dashboardService.getCategorySales(),
        dashboardService.getRecentActivity(8),
        dashboardService.getInventoryAlerts(),
      ]);

      setStats(statsData);
      setSalesData(salesResponse);
      setTopProducts(productsData);
      setCategorySales(categoryData);
      setRecentActivity(activityData);
      setInventoryAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // toast.error("Failed to load dashboard data");

      // Set mock data for development
      setStats({
        totalRevenue: 15420000,
        totalOrders: 1247,
        totalProducts: 856,
        totalCustomers: 523,
        pendingOrders: 23,
        lowStockProducts: 12,
        revenueGrowth: 15.2,
        orderGrowth: 8.7,
      });

      setSalesData(generateMockSalesData());
      setTopProducts(generateMockTopProducts());
      setCategorySales(generateMockCategorySales());
      setRecentActivity(generateMockActivity());
      setInventoryAlerts(generateMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [salesPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  // Mock data generators for development
  const generateMockSalesData = (): SalesData[] => {
    const days = salesPeriod === "7d" ? 7 : salesPeriod === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 500000) + 100000,
        orders: Math.floor(Math.random() * 50) + 10,
      };
    });
  };

  const generateMockTopProducts = (): TopProduct[] => [
    { id: "1", name: "Vitamin C Serum", sales: 234, revenue: 4680000 },
    { id: "2", name: "Moisturizing Cream", sales: 189, revenue: 3780000 },
    { id: "3", name: "Sunscreen SPF 50", sales: 156, revenue: 3120000 },
    { id: "4", name: "Anti-aging Serum", sales: 134, revenue: 2680000 },
    { id: "5", name: "Face Cleanser", sales: 123, revenue: 1845000 },
  ];

  const generateMockCategorySales = (): CategorySales[] => [
    { category: "Skincare", sales: 567, revenue: 11340000 },
    { category: "Supplements", sales: 234, revenue: 4680000 },
    { category: "Cosmetics", sales: 189, revenue: 3780000 },
    { category: "Hair Care", sales: 156, revenue: 3120000 },
    { category: "Body Care", sales: 101, revenue: 2020000 },
  ];

  const generateMockActivity = (): RecentActivity[] => [
    {
      id: "1",
      type: "order",
      description: "New order #ORD-1234 received",
      timestamp: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "2",
      type: "product",
      description: 'Product "Vitamin C Serum" updated',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "3",
      type: "inventory",
      description: "Inventory request approved",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "approved",
    },
    {
      id: "4",
      type: "customer",
      description: "New customer registration",
      timestamp: new Date(Date.now() - 5400000).toISOString(),
    },
  ];

  const generateMockAlerts = (): InventoryAlert[] => [
    {
      productId: "1",
      productName: "Vitamin E Oil",
      currentStock: 5,
      minimumStock: 10,
      status: "low",
    },
    {
      productId: "2",
      productName: "Face Mask",
      currentStock: 0,
      minimumStock: 15,
      status: "out",
    },
    {
      productId: "3",
      productName: "Eye Cream",
      currentStock: 3,
      minimumStock: 8,
      status: "low",
    },
  ];

  const CATEGORY_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status === "pending") return "text-yellow-600 bg-yellow-50";
    if (status === "approved") return "text-green-600 bg-green-50";

    switch (type) {
      case "order":
        return "text-blue-600 bg-blue-50";
      case "product":
        return "text-purple-600 bg-purple-50";
      case "customer":
        return "text-indigo-600 bg-indigo-50";
      case "inventory":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business today.
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
      <StatsCards stats={stats} loading={loading} />

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

        {/* Category Sales Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ category, revenue }) =>
                        `${category}: ${formatCurrency(revenue)}`
                      }
                      labelLine={false}
                    >
                      {categorySales.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <TopProductsTable products={topProducts} loading={loading} />

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-full ${getActivityColor(
                        activity.type,
                        activity.status
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
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
