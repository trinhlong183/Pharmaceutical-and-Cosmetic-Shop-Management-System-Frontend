import http from "@/lib/http";
import {
  CreateProductBodyType,
  ProductQueryParamsType,
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
  getAllProducts: (param: ProductQueryParamsType = {}) => {
    return http
      .get<{ data: { products: Product[]; total: number } }>("/products", {
        params: param,
      })
      .then((response) => response.payload.data);
  },

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const data: ApiResponse<Product> = await response.json();
    return data.data;
  },
  // getProductById: (id: string): Promise<Product> => {
  //   return http
  //     .get<{ data: Product }>(`/products/${id}`)
  //     .then((response) => response.payload.data);
  // },

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
