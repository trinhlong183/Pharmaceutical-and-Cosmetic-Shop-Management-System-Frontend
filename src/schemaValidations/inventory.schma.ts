import { z } from "zod";

export enum action {
  IMPORT = "import",
  EXPORT = "export",
}

const InventoryLogSchema = z.object({
  id: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string(),
      quantity: z
        .number()
        .int()
        .nonnegative("Quantity must be a non-negative integer"),
      price: z
        .number()
        .min(0, "Price must be a non-negative number")
        .optional(),
      expiryDate: z.string().optional(),
      batch: z.string().optional(),
    })
  ),
  action: z.nativeEnum(action),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "denied"]).optional(),
  userId: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type InventoryLogType = z.infer<typeof InventoryLogSchema>;

export const CreateInventoryLogBody = InventoryLogSchema.extend({
  userId: z.string().min(1, "User ID is required"),
  action: z.nativeEnum(action),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      quantity: z
        .number()
        .int()
        .nonnegative("Quantity must be a non-negative integer"),
      // Price and expiryDate only required for import
      price: z.number().min(0, "Price must be a non-negative number").optional(),
      expiryDate: z
        .string()
        .datetime("Expiry date must be a valid ISO 8601 date string")
        .optional(),
      batch: z.string().optional(),
    })
  ),
})
  .superRefine((data, ctx) => {
    if (data.action === action.IMPORT) {
      data.products.forEach((product, idx) => {
        if (typeof product.price !== "number") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Price is required for import",
            path: ["products", idx, "price"],
          });
        }
        if (!product.expiryDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expiry date is required for import",
            path: ["products", idx, "expiryDate"],
          });
        }
      });
    }
  })
export type CreateInventoryLogBodyType = z.infer<typeof CreateInventoryLogBody>;

export const InventoryQueryParams = z
  .object({
    status: z.enum(["pending", "approved", "denied"]).optional(),
    productId: z.string().optional(),
    userId: z.string().optional(),
  })
  .strict();

export type InventoryQueryParamsType = z.infer<typeof InventoryQueryParams>;
