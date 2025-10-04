"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCreateProduct } from "@/hooks/use-products"
import { useRouter } from "next/navigation"
import { useCategories, useSubcategories } from "@/hooks/use-categories"

export default function AddProductPage() {
  const router = useRouter()
  const createProduct = useCreateProduct()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ include_inactive: false })

  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId)

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    initial_stock: "",
    brand: "",
    cost_price: "",
    compare_at_price: "",
    description: "",
    status: "available",
    is_active: true,
    is_featured: false,
    show_discount: false,
    tags: "",
  })

  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    if (selectedCategoryId) {
      setFormData((prev) => ({ ...prev, category_id: "" }))
    }
  }, [selectedCategoryId])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.category_id || !formData.price || !formData.initial_stock) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const formDataToSend = new FormData()

      formDataToSend.append("name", formData.name)
      formDataToSend.append("category_id", formData.category_id)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("initial_stock", formData.initial_stock)

      if (formData.brand) formDataToSend.append("brand", formData.brand)
      if (formData.cost_price) formDataToSend.append("cost_price", formData.cost_price)
      if (formData.compare_at_price) formDataToSend.append("compare_at_price", formData.compare_at_price)
      if (formData.description) formDataToSend.append("description", formData.description)

      formDataToSend.append("status", formData.status)
      formDataToSend.append("is_active", String(formData.is_active))
      formDataToSend.append("is_featured", String(formData.is_featured))
      formDataToSend.append("show_discount", String(formData.show_discount))

      if (formData.tags) formDataToSend.append("tags", formData.tags)

      images.forEach((file, index) => {
        formDataToSend.append("images", file)
      })

      await createProduct.mutateAsync(formDataToSend)

      toast.success("Product created successfully!")

      // Navigate back to products page
      router.push("/products")
    } catch (error) {
      console.error("[v0] Error creating product:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product for your catalog</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={createProduct.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{createProduct.isPending ? "Creating..." : "Create Product"}</span>
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential product details and descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Detailed product description"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload high-quality images of your product</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onImagesChange={setImages} />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set your product pricing and cost information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Compare Price (₦)</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={(e) => handleInputChange("compare_at_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price (₦)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange("cost_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Track and manage product inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initial_stock">Initial Stock *</Label>
                <Input
                  id="initial_stock"
                  type="number"
                  value={formData.initial_stock}
                  onChange={(e) => handleInputChange("initial_stock", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Product is visible to customers</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show in featured products</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Discount</Label>
                  <p className="text-sm text-muted-foreground">Display discount badge</p>
                </div>
                <Switch
                  checked={formData.show_discount}
                  onCheckedChange={(checked) => handleInputChange("show_discount", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategoryId && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange("category_id", value)}
                    disabled={subcategoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={subcategoriesLoading ? "Loading subcategories..." : "Select subcategory"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriesData?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id || ""}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The subcategory ID will be used as the category ID for the product
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Product brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="Comma-separated tags"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
