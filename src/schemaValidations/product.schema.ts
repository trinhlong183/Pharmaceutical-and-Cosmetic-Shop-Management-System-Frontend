import z from "zod";

// Define the SuitableFor enum

export enum SuitableFor {
  ALL_SKIN_TYPES = "All skin types",
  DRY_SKIN = "Dry skin",
  OILY_SKIN = "Oily skin",
  COMBINATION_SKIN = "Combination skin",
  SENSITIVE_SKIN = "Sensitive skin",
  NORMAL_SKIN = "Normal skin",
}

// Review sub-schema
const ReviewSchema = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.date().optional(),
});

// Base Product Schema
const BaseProductSchema = z.object({
  productId: z.string().optional(), // Usually auto-generated
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  category: z.array(z.string()),
  brand: z.string().min(1, "Brand is required"),
  productImages: z.array(z.string()),
  ingredients: z.string(),
  suitableFor: z.nativeEnum(SuitableFor),
  reviews: z.array(ReviewSchema).optional().default([]),
  salePercentage: z.number().min(0).max(100).default(0),
  expiryDate: z.string().or(z.date()),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

// CREATE - Product creation schema
export const CreateProductBody = BaseProductSchema.omit({
  productId: true,
  createdAt: true,
  updatedAt: true,
  reviews: true,
}).strict();

export type CreateProductBodyType = z.infer<typeof CreateProductBody>;

// READ - Product response schema
export const ProductResponse = BaseProductSchema;

export type ProductResponseType = z.infer<typeof ProductResponse>;

// READ - List products response
export const ProductListResponse = z.object({
  products: z.array(ProductResponse),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ProductListResponseType = z.infer<typeof ProductListResponse>;

// UPDATE - Product update schema
export const UpdateProductBody = BaseProductSchema.partial()
  .omit({
    productId: true,
    createdAt: true,
    updatedAt: true,
    reviews: true,
  })
  .strict();

export type UpdateProductBodyType = z.infer<typeof UpdateProductBody>;

// DELETE - Delete product params
export const DeleteProductParams = z
  .object({
    productId: z.string().min(1, "Product ID is required"),
  })
  .strict();

export type DeleteProductParamsType = z.infer<typeof DeleteProductParams>;

// Add review schema
export const AddReviewBody = z
  .object({
    productId: z.string().min(1, "Product ID is required"),
    rating: z.number().min(1).max(5),
    comment: z.string(),
  })
  .strict();

export type AddReviewBodyType = z.infer<typeof AddReviewBody>;

// Query parameters for product filtering
export const ProductQueryParams = z
  .object({
    search: z.string().optional(),
    category: z.array(z.string()).or(z.string()).optional(),
    brand: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    suitableFor: z.nativeEnum(SuitableFor).optional(),
    sortBy: z.enum(["price", "name", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .strict();

export type ProductQueryParamsType = z.infer<typeof ProductQueryParams>;
