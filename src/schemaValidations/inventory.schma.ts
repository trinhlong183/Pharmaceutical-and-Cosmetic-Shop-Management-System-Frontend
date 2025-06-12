import { z } from "zod";

export enum action {
  IMPORT = "import",
  EXPORT = "export",
}

const InventoryLogSchema = z.object({
  batch: z.string().optional(),
  id: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string(),
      quantity: z
        .number()
        .int()
        .nonnegative("Quantity must be a non-negative integer"),
    })
  ),
  action: z.nativeEnum(action),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "denied"]).optional(),
  userId: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type InventoryLogType = z.infer<typeof InventoryLogSchema>;


export const CreateInventoryLogBody = InventoryLogSchema.extend({
  userId: z.string().min(1, "User ID is required"),
  batch: z.string().min(1, "Batch is required"),
  action: z.nativeEnum(action),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      quantity: z
        .number()
        .int()
        .nonnegative("Quantity must be a non-negative integer"),
    })
  ),
}).strict();
export type CreateInventoryLogBodyType = z.infer<typeof CreateInventoryLogBody>;

export const InventoryQueryParams = z
  .object({
    status: z.enum(["pending", "approved", "denied"]).optional(),
    productId: z.string().optional(),
    userId: z.string().optional(),
  })
  .strict();

export type InventoryQueryParamsType = z.infer<typeof InventoryQueryParams>;
