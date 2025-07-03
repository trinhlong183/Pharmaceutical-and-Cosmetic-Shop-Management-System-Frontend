import http from "@/lib/http";

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

export interface CategorySales {
  category: string;
  sales: number;
  revenue: number;
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
    const response = await http.get<{ data: DashboardStats }>(
      "/dashboard/stats"
    );
    return response.payload.data;
  },

  async getSalesData(
    period: "7d" | "30d" | "90d" = "30d"
  ): Promise<SalesData[]> {
    const response = await http.get<{ data: SalesData[] }>(
      "/dashboard/sales",
      {
        params: { period },
      }
    );
    return response.payload.data;
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await http.get<{ data: TopProduct[] }>(
      "/dashboard/top-products",
      {
        params: { limit },
      }
    );
    return response.payload.data;
  },

  async getCategorySales(): Promise<CategorySales[]> {
    const response = await http.get<{ data: CategorySales[] }>(
      "/dashboard/category-sales"
    );
    return response.payload.data;
  },

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await http.get<{ data: RecentActivity[] }>(
      "/dashboard/recent-activity",
      {
        params: { limit },
      }
    );
    return response.payload.data;
  },

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const response = await http.get<{ data: InventoryAlert[] }>(
      "/dashboard/inventory-alerts"
    );
    return response.payload.data;
  },
};

export default dashboardService;
      