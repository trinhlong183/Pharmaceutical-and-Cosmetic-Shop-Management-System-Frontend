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
  products: [
    { productId: "", quantity: 0, price: 0, expiryDate: "", batch: "" },
  ],
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
        batch: "",
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
            batch: "",
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
      name === "expiryDate" ||
      name === "batch"
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
        { productId: "", quantity: 0, price: 0, expiryDate: "", batch: "" },
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
    <form onSubmit={handleSubmit} className="space-y-3 flex flex-col h-full">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Action Type</Label>
        <Select value={form.action} onValueChange={handleActionChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="import"> Import</SelectItem>
            <SelectItem value="export"> Export</SelectItem>
          </SelectContent>
        </Select>

        {/* Action-specific guidance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-lg">💡</div>
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">
                {form.action === "import"
                  ? "Import Guidelines:"
                  : "Export Guidelines:"}
              </div>
              {form.action === "import" ? (
                <ul className="space-y-1">
                  <li>
                    • Batch field is optional - system will auto-generate if
                    empty
                  </li>
                  <li>
                    • Format:{" "}
                    <span className="font-mono bg-blue-100 px-1 rounded">
                      PROD-YYYYMMDD-001
                    </span>
                  </li>
                  <li>• Custom batch names are allowed for manual tracking</li>
                </ul>
              ) : (
                <ul className="space-y-1">
                  <li>
                    • Batch field is optional - system will auto-select if empty
                  </li>
                  <li>• Auto-selection prioritizes nearest expiry date</li>
                  <li>• Specify batch to export from specific inventory lot</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
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

        {/* Improved column headers */}
        <div className="bg-slate-100 rounded-lg p-3">
          <div className="grid grid-cols-6 gap-3 text-sm font-medium text-slate-700">
            <div>Product ID</div>
            <div>Quantity</div>
            <div>Price</div>
            <div>Expiry Date</div>
            <div>Batch</div>
            <div className="text-center">Actions</div>
          </div>
        </div>
        {/* Product rows scrollable area */}
        <div className="space-y-3 overflow-y-auto max-h-[250px] flex-1 min-h-0">
          {form.products.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600">
                  {idx + 1}
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 items-start">
                <Input
                  name="productId"
                  placeholder="Product ID"
                  value={p.productId}
                  onChange={(e) => handleFormChange(e, idx)}
                  required
                  className="h-10"
                />
                <Input
                  name="quantity"
                  type="number"
                  placeholder="Quantity"
                  value={p.quantity}
                  onChange={(e) => handleFormChange(e, idx)}
                  required
                  min={1}
                  className="h-10"
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
                  className="h-10"
                />
                <Input
                  name="expiryDate"
                  type="date"
                  value={p.expiryDate}
                  onChange={(e) => handleFormChange(e, idx)}
                  required
                  min={getTodayDate()}
                  className="h-10"
                />
                <div className="space-y-1">
                  <Input
                    name="batch"
                    placeholder="Optional"
                    value={p.batch}
                    onChange={(e) => handleFormChange(e, idx)}
                    className="h-10"
                  />
                  <div className="text-xs text-slate-500">
                    {form.action === "import"
                      ? "Auto-gen if empty"
                      : "Auto-select if empty"}
                  </div>
                </div>
                <div className="flex justify-center items-start">
                  {form.products.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(idx)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProduct}
            className="w-full border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Product
          </Button>
        </div>
      </div>
      {/* Sticky submit button at the bottom */}
      <div className="pt-4 border-t border-slate-200 sticky bottom-2 bg-white z-10">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
        >
          {loading
            ? "Creating..."
            : `Create ${form.action === "import" ? "Import" : "Export"} Log`}
        </Button>
      </div>
    </form>
  );
};

export default CreateInventoryForm;
