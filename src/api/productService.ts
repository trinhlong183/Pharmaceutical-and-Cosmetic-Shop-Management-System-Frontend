import { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data: ApiResponse<{products: Product[]}> = await response.json();
    return data.data.products;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data: ApiResponse<Product> = await response.json();
    return data.data;
  }
};