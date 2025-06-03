import { Category } from '@/types/category';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const categoriesService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data: ApiResponse<Category[]> = await response.json();
    return data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    const data: ApiResponse<Category> = await response.json();
    return data.data;
  },

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    
    const data: ApiResponse<Category> = await response.json();
    return data.data;
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to update category');
    }
    
    const data: ApiResponse<Category> = await response.json();
    return data.data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
    
    const data = await response.json();
    return { success: data.success, message: data.message };
  }
};
