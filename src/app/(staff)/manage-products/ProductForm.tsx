"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductBody, SuitableFor, UpdateProductBody } from "@/schemaValidations/product.schema";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { CalendarIcon, ImagePlusIcon, TrashIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ProductForm = ({ product, categories, onSubmit, isLoading = false }: ProductFormProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(product?.productImages || []);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (product?.category as string[]) || []
  );

  const isEditMode = !!product;

  // Create form with validation
  const form = useForm({
    resolver: zodResolver(isEditMode ? UpdateProductBody : CreateProductBody),
    defaultValues: {
      productName: product?.productName || "",
      productDescription: product?.productDescription || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      brand: product?.brand || "",
      ingredients: product?.ingredients || "",
      suitableFor: product?.suitableFor || SuitableFor.ALL,
      salePercentage: product?.salePercentage || 0,
      expiryDate: product?.expiryDate ? new Date(product.expiryDate) : new Date(),
    },
  });

  // Handle form submission
  const handleSubmitForm = (values: any) => {
    // Combine form values with image URLs and categories
    const formData = {
      ...values,
      productImages: imageUrls,
      category: selectedCategories,
    };
    
    onSubmit(formData);
  };

  // Handle adding image URLs
  const handleAddImageUrl = () => {
    if (imageUrl && !imageUrls.includes(imageUrl)) {
      setImageUrls([...imageUrls, imageUrl]);
      setImageUrl("");
    }
  };

  // Handle removing an image URL
  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prevSelected => 
      prevSelected.includes(categoryId)
        ? prevSelected.filter(id => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (VND)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Percentage */}
          <FormField
            control={form.control}
            name="salePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Percentage (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="0" 
                    max="100" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Suitable For */}
          <FormField
            control={form.control}
            name="suitableFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suitable For*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skin type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(SuitableFor).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date */}
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date("2050-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Description */}
        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  className="min-h-[120px]" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ingredients */}
        <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product ingredients" 
                  className="min-h-[100px]" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Images */}
        <div className="space-y-4">
          <Label htmlFor="productImages">Product Images</Label>
          <div className="flex items-center gap-2">
            <Input
              id="imageUrl"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddImageUrl}
              disabled={isLoading || !imageUrl}
              className="flex gap-2 items-center"
            >
              <ImagePlusIcon className="h-4 w-4" /> Add
            </Button>
          </div>
          
          {/* Image Previews */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative h-32 w-full overflow-hidden rounded-md border">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Handle image loading errors
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImageUrl(index)}
                  disabled={isLoading}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => (
              <div key={category.id || category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id || category._id}`}
                  checked={selectedCategories.includes(category.id || category._id as string)}
                  onCheckedChange={() => toggleCategory(category.id || category._id as string)}
                  disabled={isLoading}
                />
                <label
                  htmlFor={`category-${category.id || category._id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.categoryName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
