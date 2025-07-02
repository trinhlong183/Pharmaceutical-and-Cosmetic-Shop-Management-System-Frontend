"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/api/productService";
import { categoriesService } from "@/api/categoriesService";
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import ProductForm from "@/app/(dashboard-layout)/(staff)/manage-products/ProductForm";
import { PlusIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { formatCurrency } from "@/lib/utils";

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          categoriesService.getAllCategories(),
        ]);

        const productList = productsData.products || [];
        setProducts(productList);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products or categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      product.productName?.toLowerCase().includes(lowercaseQuery) ||
      product.productDescription?.toLowerCase().includes(lowercaseQuery) ||
      product.brand?.toLowerCase().includes(lowercaseQuery)
    );
  });

  const handleAddProduct = async (productData: any) => {
    try {
      setLoading(true);
      await productService.createProduct(productData);

      // Refresh products list
      const updatedProductsData = await productService.getAllProducts();
      const updatedProducts = updatedProductsData.products || [];
      setProducts(updatedProducts);

      toast.success("Product added successfully");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (productData: any) => {
    try {
      const productId = selectedProduct?.id || selectedProduct?._id;
      if (!productId) {
        throw new Error("No product selected for editing");
      }

      setLoading(true);
      await productService.updateProduct(productId, productData);

      // Refresh products list
      const updatedProductsData = await productService.getAllProducts();
      const updatedProducts = updatedProductsData.products || [];
      setProducts(updatedProducts);

      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      if (!deleteProductId) {
        throw new Error("No product selected for deletion");
      }

      setLoading(true);
      await productService.deleteProduct(deleteProductId);

      setProducts(
        products.filter(
          (product) => (product.id || product._id) !== deleteProductId
        )
      );

      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <RoleRoute allowedRoles={[Role.STAFF, Role.ADMIN]}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>
                Add, edit, and manage your product inventory
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Add Product
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search bar */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products by name, description, or brand..."
                className="pl-10 w-full md:w-1/2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Products table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>
                            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-md"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-8 bg-gray-200 animate-pulse rounded w-full"></div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id || product._id}>
                        <TableCell>
                          {product.productImages && product.productImages[0] ? (
                            <div className="relative w-14 h-14 rounded-md overflow-hidden">
                              <Image
                                src={product.productImages[0]}
                                alt={product.productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-md text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.productName}
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>
                          {product.category && product.category.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.category
                                .slice(0, 2)
                                .map((cat, index) => {
                                  // Find category name if it's an ID
                                  const categoryName =
                                    typeof cat === "string"
                                      ? categories.find((c) => c._id === cat)
                                          ?.categoryName || cat
                                      : cat.categoryName;

                                  return (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-blue-50 text-blue-800 border-blue-200"
                                    >
                                      {categoryName}
                                    </Badge>
                                  );
                                })}
                              {product.category.length > 2 && (
                                <Badge variant="outline">
                                  +{product.category.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No category</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.salePercentage &&
                          product.salePercentage > 0 ? (
                            <div>
                              <span className="font-medium text-red-600">
                                {formatCurrency(
                                  product.price *
                                    (1 - product.salePercentage / 100)
                                )}
                              </span>
                              <span className="text-gray-400 line-through text-xs ml-2">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span>{formatCurrency(product.price)}</span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          {product.stock > 10 ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                              In Stock
                            </Badge>
                          ) : product.stock > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-three-dots"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              {user?.role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeleteProductId(
                                      product.id || product._id!
                                    );
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/products/${product.id || product._id}`
                                  )
                                }
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details below to add a new product to your
                inventory.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={handleAddProduct}
              categories={categories || []}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product details below.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              onSubmit={handleEditProduct}
              categories={categories}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleRoute>
  );
}
