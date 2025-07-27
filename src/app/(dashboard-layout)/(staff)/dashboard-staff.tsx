"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShoppingBag, Package, TrendingUp, Users, DollarSign, 
  Clipboard, AlertCircle, ArrowRight 
} from "lucide-react";
import Link from "next/link";

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: number;
}

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    activeCustomers: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalSales: 9850000,
        pendingOrders: 12,
        lowStockItems: 5,
        activeCustomers: 143
      });
      
      setRecentOrders([
        { id: "ORD-9385", customer: "Nguyễn Văn A", date: "2023-08-15", status: "Đang xử lý", total: 125000 },
        { id: "ORD-9384", customer: "Trần Thị B", date: "2023-08-15", status: "Đã giao hàng", total: 350000 },
        { id: "ORD-9383", customer: "Lê Văn C", date: "2023-08-14", status: "Đang xử lý", total: 85000 },
        { id: "ORD-9382", customer: "Phạm Thị D", date: "2023-08-14", status: "Hoàn thành", total: 220000 },
        { id: "ORD-9381", customer: "Hoàng Văn E", date: "2023-08-13", status: "Hoàn thành", total: 175000 },
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang xử lý': return 'bg-yellow-100 text-yellow-800';
      case 'Đã giao hàng': return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      case 'Đã hủy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const topSellingProducts = [
    { name: 'Kem dưỡng da Cetaphil', sales: 58, revenue: 5800000 },
    { name: 'Nước tẩy trang Bioderma', sales: 45, revenue: 3825000 },
    { name: 'Thuốc giảm đau Paracetamol', sales: 37, revenue: 1480000 },
    { name: 'Vitamin C Effervescent', sales: 32, revenue: 2880000 },
  ];

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển nhân viên</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu hôm nay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSales.toLocaleString()}đ</div>
                <p className="text-xs text-muted-foreground">+2.5% so với hôm qua</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sản phẩm sắp hết hàng</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Cần bổ sung hàng</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Khách hàng hoạt động</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground">+5% so với tuần trước</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
            {/* Recent Orders */}
            <div className="md:col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <CardDescription>Danh sách 5 đơn hàng mới nhất cần xử lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{order.total.toLocaleString()}đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <Link href="/staff/orders">
                      <Button variant="ghost" size="sm" className="gap-1">
                        Xem tất cả đơn hàng
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Selling Products */}
            <div className="md:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Sản phẩm bán chạy</CardTitle>
                  <CardDescription>Thống kê trong 7 ngày qua</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSellingProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-6 text-muted-foreground">{index + 1}.</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.sales} sản phẩm</div>
                        </div>
                        <div className="text-sm font-medium">{product.revenue.toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link href="/staff/products">
                      <Button variant="ghost" size="sm" className="gap-1">
                        Xem tất cả sản phẩm
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các công cụ thường dùng cho nhân viên</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/staff/orders/new">
                  <Button>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Tạo đơn hàng mới
                  </Button>
                </Link>
                <Link href="/staff/inventory">
                  <Button variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Kiểm tra kho hàng
                  </Button>
                </Link>
                <Link href="/staff/products">
                  <Button variant="outline">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Quản lý sản phẩm
                  </Button>
                </Link>
                <Link href="/staff/customers">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Danh sách khách hàng
                  </Button>
                </Link>
                <Link href="/staff/reports">
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Báo cáo doanh số
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
