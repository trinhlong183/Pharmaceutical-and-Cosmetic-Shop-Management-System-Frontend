"use client";
import React, { useEffect, useState } from "react";
import { categoriesService } from "@/api/categoriesService";
import { Category } from "@/types/category";
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getAllCategories();
      console.log("Fetched categories:", data);

      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Error fetching categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !categoryDescription.trim()) {
      setError("Category name and description are required");
      return;
    }
    try {
      await categoriesService.createCategory({
        categoryName,
        categoryDescription,
      });
      setCategoryName("");
      setCategoryDescription("");
      setError(null);
      toast.success("Category created successfully");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Error creating category");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditCategoryName(cat.categoryName || "");
    setEditCategoryDescription(cat.categoryDescription || "");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) {
      setError("Category ID is required for editing");
      return;
    }
    try {
      await categoriesService.updateCategory(editingId, {
        categoryName: editCategoryName,
        categoryDescription: editCategoryDescription,
      });
      setEditingId(null);
      setEditCategoryName("");
      setEditCategoryDescription("");
      setError(null);
      toast.success("Category updated successfully");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Error updating category");
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await categoriesService.deleteCategory(_id);
      fetchCategories();
      toast.success("Category deleted successfully");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error deleting category");
    }
  };

  return (
    <RoleRoute allowedRoles={[Role.ADMIN]}>
      <div className="max-w-3xl mx-auto py-8 px-4 min-h-lvh">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Manage Categories</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>
              Create a new category for your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Categories List</h2>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : categories.length === 0 ? (
          <Card className="text-center p-8 bg-muted/50">
            <p>No categories found. Add your first category above.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((cat) =>
              editingId === cat._id ? (
                <Card key={cat._id} className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle>Edit Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEdit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-name-${cat._id}`}>Name</Label>
                        <Input
                          id={`edit-name-${cat._id}`}
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-desc-${cat._id}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`edit-desc-${cat._id}`}
                          value={editCategoryDescription}
                          onChange={(e) =>
                            setEditCategoryDescription(e.target.value)
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" variant="default">
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card key={cat._id}>
                  <CardHeader>
                    <CardTitle>{cat.categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {cat.categoryDescription}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the category "
                            {cat.categoryName}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat._id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </RoleRoute>
  );
}

export default ManageCategories;
