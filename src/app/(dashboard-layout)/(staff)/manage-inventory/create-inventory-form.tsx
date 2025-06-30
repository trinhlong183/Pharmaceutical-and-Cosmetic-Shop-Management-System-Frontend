import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import {
  action,
  CreateInventoryLogBodyType,
} from "@/schemaValidations/inventory.schma";
import { toast } from "sonner";
import { productService } from "@/api/productService";
import { categoriesService } from "@/api/categoriesService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import Image from "next/image";

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
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load all products when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      loadAllProducts();
    }
  }, [searchModalOpen]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadAllProducts = async () => {
    setSearchLoading(true);
    try {
      const params: any = { limit: 1000 };
      if (selectedCategoryId && selectedCategoryId !== "all") {
        params.category = [selectedCategoryId];
      }
      const result = await productService.getAllProducts(params);
      setAllProducts(result.products || []);
      setSearchResults(result.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setAllProducts([]);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter products based on search query (name only) and selected category
  useEffect(() => {
    let filtered = allProducts;

    // Filter by selected category
    if (selectedCategoryId && selectedCategoryId !== "all") {
      filtered = filtered.filter((product) =>
        Array.isArray(product.category)
          ? product.category.some((cat) => cat._id === selectedCategoryId)
          : false
      );
    }

    // Filter by search query (name only)
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setSearchResults(filtered);
  }, [searchQuery, selectedCategoryId, allProducts]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleProductSelect = (product: Product) => {
    // Check if product already exists
    const existingIndex = form.products.findIndex(
      (p) => p.productId === product.id
    );
    if (existingIndex !== -1) {
      toast.error("Product already added to inventory!");
      return;
    }

    // Add new product or update existing empty slot
    const emptySlotIndex = form.products.findIndex((p) => !p.productId);
    if (emptySlotIndex !== -1) {
      const products = [...form.products];
      products[emptySlotIndex] = {
        productId: product.id,
        quantity: 1,
        price: 0,
        expiryDate: "",
      };
      setForm({ ...form, products });
    } else {
      setForm({
        ...form,
        products: [
          ...form.products,
          {
            productId: product.id,
            quantity: 1,
            price: 0,
            expiryDate: "",
          },
        ],
      });
    }

    setSearchModalOpen(false);
    setSearchQuery("");
    toast.success(`Added ${product.productName} to inventory`);
  };

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
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold">Products</Label>
          <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search Products
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl  max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Search Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={handleCategorySelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {searchLoading ? (
                    <div className="text-center py-4">Loading products...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex gap-3 items-start">
                          {/* Product Image */}
                          <div className="w-16 h-16 flex-shrink-0">
                            {product.productImages &&
                            product.productImages.length > 0 ? (
                              <Image
                                src={product.productImages[0]}
                                alt={product.productName}
                                className="w-full h-full object-cover rounded-md"
                                width={64}
                                height={64}
                                unoptimized
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder-product.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-gray-400 text-xs">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {product.productName || "Unknown Product"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {product.id} | Category:{" "}
                              {Array.isArray(product.category)
                                ? product.category
                                    .map((cat) => cat.categoryName)
                                    .join(", ")
                                : product.category || "N/A"}{" "}
                              | Brand: {product.brand || "N/A"}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              <span>Price: ${product.price || 0}</span>
                              <span>Stock: {product.stock || 0}</span>
                              {product.salePercentage &&
                                product.salePercentage > 0 && (
                                  <span className="text-red-600">
                                    Sale: {product.salePercentage}% off
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Add Button */}
                          <Button size="sm" variant="ghost">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {searchQuery ||
                      (selectedCategoryId && selectedCategoryId !== "all")
                        ? "No products found matching your criteria"
                        : "No products available"}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-2 mb-2 px-2">
          <Label className="text-sm font-medium">Product ID</Label>
          <Label className="text-sm font-medium">Quantity</Label>
          <Label className="text-sm font-medium">Price</Label>
          <Label className="text-sm font-medium">Expiry Date</Label>
        </div>

        <div className="space-y-2">
          {form.products.map((p, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 items-center">
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
                min={1}
              />
              <Input
                name="price"
                type="number"
                step="1"
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
              <div className="flex justify-center">
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
            </div>
          ))}
          <div className="pt-2">
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
      </div>
      <Button type="submit" disabled={loading}>
        Create Inventory Log
      </Button>
    </form>
  );
};

export default CreateInventoryForm;
