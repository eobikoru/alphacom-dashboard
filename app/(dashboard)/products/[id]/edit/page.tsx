"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useProduct, useUpdateProduct } from "@/hooks/use-products"
import { useCategories, useSubcategories } from "@/hooks/use-categories"
import { ImageUpload } from "@/components/image-upload"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { data: product, isLoading: isLoadingProduct } = useProduct(productId)
  const updateProduct = useUpdateProduct(productId)
  const { data: categoriesData } = useCategories({ page: 1, per_page: 100 })

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const { data: subcategoriesData } = useSubcategories(selectedCategoryId)

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand: "",
    price: "",
    cost_price: "",
    compare_at_price: "",
    description: "",
    status: "available" as "available" | "coming_soon" | "discontinued" | "out_of_stock",
    is_active: true,
    is_featured: false,
    show_discount: false,
  })

  const [images, setImages] = useState<File[]>([])

  // Populate form when product data loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category_id: product.category_id || "",
        brand: product.brand || "",
        price: product.price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        description: product.description || "",
        status: product.status || "available",
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        show_discount: product.show_discount ?? false,
      })

      // Find the parent category for the subcategory
      if (product.category_id && categoriesData) {
        const parentCategory = categoriesData.data.find((cat) =>
          cat.subcategories?.some((sub: { id: string }) => sub.id === product.category_id),
        )
        if (parentCategory) {
          setSelectedCategoryId(parentCategory.id)
        }
      }
    }
  }, [product, categoriesData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = new FormData()

    // Only append fields that have values
    if (formData.name) data.append("name", formData.name)
    if (formData.category_id) data.append("category_id", formData.category_id)
    if (formData.brand) data.append("brand", formData.brand)
    if (formData.price) data.append("price", formData.price)
    if (formData.cost_price) data.append("cost_price", formData.cost_price)
    if (formData.compare_at_price) data.append("compare_at_price", formData.compare_at_price)
    if (formData.description) data.append("description", formData.description)
    if (formData.status) data.append("status", formData.status)

    data.append("is_active", formData.is_active.toString())
    data.append("is_featured", formData.is_featured.toString())
    data.append("show_discount", formData.show_discount.toString())

    // Append images if any
    images.forEach((image) => {
      data.append("images", image)
    })

    updateProduct.mutate(data, {
      onSuccess: () => {
        router.push("/products")
      },
    })
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the basic details of your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.data.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  disabled={!selectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoriesData?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id || ""}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Update product pricing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price (₦) (Optional)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compare_at_price">Compare at Price (₦) (Optional)</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Add new images (existing images will be kept)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />

            {product.images && product.images.length > 0 && (
              <div className="mt-4">
                <Label>Current Images</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Visibility</CardTitle>
            <CardDescription>Update product status and visibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Featured</Label>
                <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_discount">Show Discount</Label>
                <p className="text-sm text-muted-foreground">Display discount badge on product</p>
              </div>
              <Switch
                id="show_discount"
                checked={formData.show_discount}
                onCheckedChange={(checked) => setFormData({ ...formData, show_discount: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
