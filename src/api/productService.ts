import http from "@/lib/http";
import {
  CreateProductBodyType,
  UpdateProductBodyType,
} from "./../schemaValidations/product.schema";
import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const productService = {
  getAllProducts: (): Promise<Product[]> => {
    return http
      .get<{
        success: boolean;
        data: { products: Product[] };
        message: string;
      }>("/products")
      .then((response) => response.payload.data.products);
  },
  // async getAllProducts(): Promise<Product[]> {
  //   const response = await fetch(`${API_URL}/products`);
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch products");
  //   }
  //   const data: ApiResponse<{ products: Product[] }> = await response.json();
  //   return data.data.products;
  // },

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const data: ApiResponse<Product> = await response.json();
    return data.data;
  },

  createProduct: (body: CreateProductBodyType) => {
    return http.post("/products", body);
  },
  updateProduct: (id: string, body: UpdateProductBodyType) => {
    return http.patch(`/products/${id}`, body);
  },
  deleteProduct: (id: string) => {
    return http.delete(`/products/${id}`);
  },
};

export default productService;
