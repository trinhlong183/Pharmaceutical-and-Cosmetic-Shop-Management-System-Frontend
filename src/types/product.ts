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

export interface Product {
  _id: string;
  productName: string;
  productDescription: string;
  price: number;
  stock: number;
  category: Category[];
  brand: string;
  productImages: string[];
  ingredients: string;
  suitableFor: SuitableForType;
  reviews: string[];
  salePercentage: number | null;
  expiryDate: Date;
}