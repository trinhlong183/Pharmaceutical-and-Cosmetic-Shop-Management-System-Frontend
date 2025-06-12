import { SuitableFor } from "@/schemaValidations/product.schema";
import { Category } from "./category";

export enum SuitableForType {
  ALL = "ALL",
  MEN = "MEN",
  WOMEN = "WOMEN",
  CHILDREN = "CHILDREN",
}

export interface Review {
  userId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface Product {
  id?: string;
  _id?: string;
  productId?: string;
  productName: string;
  productDescription: string;
  price: number;
  stock: number;
  category: Category[];
  brand: string;
  productImages: string[];
  ingredients: string;
  suitableFor: SuitableFor;
  reviews?: Review[];
  salePercentage?: number;
  averageRating?: number;
  expiryDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
