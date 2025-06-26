import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  action,
  CreateInventoryLogBodyType,
} from "@/schemaValidations/inventory.schma";
import { toast } from "sonner";

interface CreateInventoryFormProps {
  onSubmit: (form: Omit<CreateInventoryLogBodyType, "userId">) => Promise<void>;
  loading: boolean;
}

const defaultForm: Omit<CreateInventoryLogBodyType, "userId"> = {
  batch: "",
  products: [{ productId: "", quantity: 0, price: 0, expiryDate: "" }],
  action: action.IMPORT,
};

const CreateInventoryForm: React.FC<CreateInventoryFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [form, setForm] =
    useState<Omit<CreateInventoryLogBodyType, "userId">>(defaultForm);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx?: number
  ) => {
    const { name, value } = e.target;
    if (
      name === "productId" ||
      name === "quantity" ||
      name === "price" ||
      name === "expiryDate"
    ) {
      const products = [...form.products];
      if (idx !== undefined) {
        products[idx] = {
          ...products[idx],
          [name]:
            name === "quantity" || name === "price" ? Number(value) : value,
        };
        setForm({ ...form, products });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleActionChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      action: value as action.IMPORT | action.EXPORT,
    }));
  };

  const addProduct = () => {
    setForm({
      ...form,
      products: [
        ...form.products,
        { productId: "", quantity: 0, price: 0, expiryDate: "" },
      ],
    });
  };

  const removeProduct = (idx: number) => {
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check for duplicate productId in products
    const productIds = form.products.map((p) => p.productId.trim());
    const hasDuplicate = productIds.some(
      (id, idx) => id && productIds.indexOf(id) !== idx
    );
    if (hasDuplicate) {
      toast.error("Product ID must be unique in the inventory log!");
      return;
    }

    // Convert expiryDate to ISO format
    const formWithISODates = {
      ...form,
      products: form.products.map((product) => ({
        ...product,
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate + "T23:59:59.000Z").toISOString()
          : "",
      })),
    };

    await onSubmit(formWithISODates);
    setForm(defaultForm);
  };

  // Get today's date in YYYY-MM-DD format for min date restriction
  const getTodayDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2">Batch</Label>
        <Input
          name="batch"
          placeholder="Batch"
          value={form.batch}
          onChange={handleFormChange}
          required
        />
      </div>
      <div>
        <Label className="mb-2">Action</Label>
        <Select value={form.action} onValueChange={handleActionChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="import">Import</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2">Products</Label>
        <div className="space-y-2">
          {form.products.map((p, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                name="productId"
                placeholder="Product ID"
                value={p.productId}
                onChange={(e) => handleFormChange(e, idx)}
                required
              />
              <Input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={p.quantity}
                onChange={(e) => handleFormChange(e, idx)}
                required
                min={0}
              />
              <Input
                name="price"
                type="number"
                step="0.01"
                placeholder="Price"
                value={p.price}
                onChange={(e) => handleFormChange(e, idx)}
                required
                min={0}
              />
              <Input
                name="expiryDate"
                type="date"
                placeholder="Expiry Date"
                value={p.expiryDate}
                onChange={(e) => handleFormChange(e, idx)}
                required
                min={getTodayDate()}
              />
              {form.products.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(idx)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProduct}
          >
            Add Product
          </Button>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        Create Inventory Log
      </Button>
    </form>
  );
};

export default CreateInventoryForm;
