import http from "@/lib/http";
import { Category } from "@/types/category";

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const categoriesService = {
  getAllCategories: () => {
    return http
      .get<{
        success: boolean;
        data: { categories: Category[] };
        message: string;
      }>("categories")
      .then((response) => response.payload.data.categories);
  },


  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch category");
    }
    const data: ApiResponse<Category> = await response.json();
    return data.data;
  },

  createCategory: (categoryData: Partial<Category>) => {
    return http.post("categories", categoryData);
  },

  updateCategory: (id: string, categoryData: Partial<Category>) => {
    return http.patch(`/categories/${id}`, categoryData);
  },

  deleteCategory: (id: string) => {
    return http.delete(`/categories/${id}`);
  },
};
