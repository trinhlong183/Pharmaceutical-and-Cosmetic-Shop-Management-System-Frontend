import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DashboardStats } from "@/api/dashboardService";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="h-4 w-4" />,
      growth: stats.revenueGrowth,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="h-4 w-4" />,
      growth: stats.orderGrowth,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: <Package className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      icon: <Clock className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      alert: stats.pendingOrders > 10,
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts.toLocaleString(),
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      alert: stats.lowStockProducts > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <Card
          key={index}
          className={`relative overflow-hidden ${
            stat.alert ? "ring-2 ring-red-200" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            {stat.growth !== undefined && (
              <div className="flex items-center text-sm">
                {stat.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={
                    stat.growth >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {Math.abs(stat.growth)}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            )}
            {stat.alert && (
              <Badge variant="destructive" className="mt-2 text-xs">
                Needs Attention
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
