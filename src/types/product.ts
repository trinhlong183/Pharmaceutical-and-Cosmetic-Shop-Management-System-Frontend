export enum SuitableForType {
  ALL = 'ALL',
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  CHILDREN = 'CHILDREN'
}

export interface Category {
  _id: string;
  name: string;
}

export interface CategoryObject {
  _id: string;
  categoryName: string;
  categoryDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Product {
  id: string;
  productName: string;
  productDescription: string;
  price: number;
  stock: number;
  category: (string | CategoryObject)[];
  brand: string;
  productImages: string[];
  ingredients: string;
  suitableFor: string;
  reviews: any[];
  salePercentage: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}