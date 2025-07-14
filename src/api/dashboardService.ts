import http from "@/lib/http";
import { orderService, Order } from "./orderService";
import { productService } from "./productService";
import { userService, User } from "./userService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export interface OrderStatusStats {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: "order" | "product" | "customer" | "inventory";
  description: string;
  timestamp: string;
  status?: string;
}

export interface InventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  status: "low" | "out";
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Lấy dữ liệu từ các API có sẵn
      const [orders, products, usersResponse] = await Promise.all([
        orderService.getAllOrders().catch(() => []),
        productService.getAllProducts().then(res => res.products).catch(() => []),
        userService.getAllUsers().catch(() => ({ success: false, data: [], message: '' }))
      ]);

      const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];

      // Tính toán thống kê từ dữ liệu thực
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const totalProducts = products.length;
      const totalCustomers = users.filter(user => 
        user.role && user.role !== 'admin' && user.role !== 'staff'
      ).length;
      const lowStockProducts = products.filter(product => 
        product.stock !== undefined && product.stock < 10
      ).length;

      // Tính toán growth (so với tháng trước - giả lập)
      const currentMonth = new Date().getMonth();
      const currentMonthOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderMonth = new Date(order.createdAt).getMonth();
        return orderMonth === currentMonth;
      });
      
      const previousMonthOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderMonth = new Date(order.createdAt).getMonth();
        return orderMonth === (currentMonth - 1 >= 0 ? currentMonth - 1 : 11);
      });

      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      const revenueGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;
      const orderGrowth = previousMonthOrders.length > 0 
        ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100 
        : 0;

      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        revenueGrowth,
        orderGrowth,
      };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      // Trả về empty stats nếu có lỗi
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
      };
    }
  },

  async getSalesData(period: "7d" | "30d" | "90d" = "30d"): Promise<SalesData[]> {
    try {
      const orders = await orderService.getAllOrders();
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const now = new Date();
      
      const salesMap = new Map<string, { revenue: number; orders: number }>();
      
      // Khởi tạo với zeros cho tất cả ngày trong khoảng thời gian
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        salesMap.set(dateStr, { revenue: 0, orders: 0 });
      }
      
      // Tổng hợp dữ liệu order thực
      orders.forEach(order => {
        // Kiểm tra order có createdAt và totalAmount không
        if (order.createdAt && order.totalAmount !== undefined) {
          const orderDate = new Date(order.createdAt);
          const dateStr = orderDate.toISOString().split('T')[0];
          
          if (salesMap.has(dateStr)) {
            const existing = salesMap.get(dateStr)!;
            existing.revenue += order.totalAmount;
            existing.orders += 1;
          }
        }
      });
      
      return Array.from(salesMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));
    } catch (error) {
      console.error("Error getting sales data:", error);
      return [];
    }
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const [orders, products] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAllProducts().then(res => res.products)
      ]);

      console.log('Orders data:', orders);
      console.log('Sample order:', orders[0]);

      // Đếm sales cho mỗi product
      const productSales = new Map<string, { sales: number; revenue: number }>();
      
      orders.forEach(order => {
        // Kiểm tra order có items không
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            // Kiểm tra item có productId và các thuộc tính cần thiết
            if (item.productId && item.quantity && item.price) {
              const existing = productSales.get(item.productId) || { sales: 0, revenue: 0 };
              existing.sales += item.quantity;
              existing.revenue += item.price * item.quantity;
              productSales.set(item.productId, existing);
            }
          });
        }
      });
      
      // Join với thông tin product và sắp xếp theo sales
      const topProducts = Array.from(productSales.entries())
        .map(([productId, stats]) => {
          const product = products.find(p => p._id === productId || p.id === productId);
          return {
            id: productId,
            name: product?.productName || `Product ${productId}`,
            sales: stats.sales,
            revenue: stats.revenue,
            image: product?.productImages?.[0],
          };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
        
      return topProducts;
    } catch (error) {
      console.error("Error getting top products:", error);
      return [];
    }
  },

  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    try {
      const orders = await orderService.getAllOrders();
      
      const recentOrders: RecentOrder[] = orders
        .filter(order => order.id && order.createdAt && order.totalAmount !== undefined)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map(order => ({
          id: order.id,
          customerName: `Customer ${order.userId || 'Unknown'}`,
          totalAmount: order.totalAmount,
          status: order.status || 'unknown',
          createdAt: order.createdAt,
          itemCount: order.items ? order.items.length : 0,
        }));
        
      return recentOrders;
    } catch (error) {
      console.error("Error getting recent orders:", error);
      return [];
    }
  },

  async getOrderStatusStats(): Promise<OrderStatusStats[]> {
    try {
      const orders = await orderService.getAllOrders();
      
      const statusCounts = new Map<string, number>();
      const statusColors = {
        'pending': '#f59e0b',
        'processing': '#3b82f6',
        'shipped': '#8b5cf6',
        'delivered': '#10b981',
        'cancelled': '#ef4444',
        'rejected': '#dc2626',
        'completed': '#059669',
      };
      
      // Đếm số lượng orders theo status
      orders.forEach(order => {
        if (order.status) {
          const count = statusCounts.get(order.status) || 0;
          statusCounts.set(order.status, count + 1);
        }
      });
      
      const totalOrders = orders.length;
      
      return Array.from(statusCounts.entries()).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
        color: statusColors[status as keyof typeof statusColors] || '#6b7280',
      }));
    } catch (error) {
      console.error("Error getting order status stats:", error);
      return [];
    }
  },

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const orders = await orderService.getAllOrders();
      
      const activities: RecentActivity[] = orders
        .filter(order => order.id && order.createdAt && order.totalAmount !== undefined)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map(order => ({
          id: order.id,
          type: 'order' as const,
          description: `New order #${order.id} received - ${order.totalAmount.toLocaleString('vi-VN')} VND`,
          timestamp: order.createdAt,
          status: order.status || 'unknown',
        }));
        
      return activities;
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return [];
    }
  },

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
      const products = await productService.getAllProducts().then(res => res.products);

      const alerts: InventoryAlert[] = [];
      const minimumStock = 10; // Threshold mặc định
      
      products.forEach(product => {
        // Kiểm tra product có các thuộc tính cần thiết không
        if (product && 
            product.stock !== undefined && 
            product.productName && 
            (product._id || product.id)) {
          if (product.stock <= minimumStock) {
            alerts.push({
              productId: product._id || product.id || '',
              productName: product.productName,
              currentStock: product.stock,
              minimumStock,
              status: product.stock === 0 ? 'out' : 'low',
            });
          }
        }
      });
      
      return alerts;
    } catch (error) {
      console.error("Error getting inventory alerts:", error);
      return [];
    }
  },
};

export default dashboardService;
      