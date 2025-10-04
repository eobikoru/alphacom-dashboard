"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { useProduct, useDeleteProduct } from "@/hooks/use-products"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { data: product, isLoading } = useProduct(productId)
  const deleteProductMutation = useDeleteProduct()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId, {
        onSuccess: () => {
          router.push("/products")
        },
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "out_of_stock":
        return "destructive"
      case "coming_soon":
        return "secondary"
      case "discontinued":
        return "outline"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/products/${productId}/edit`}>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="flex items-center space-x-2"
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleteProductMutation.isPending ? "Deleting..." : "Delete"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description || "No description available"}
              </p>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{product.sku || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{product.brand || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category_name || "Uncategorized"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{product.weight ? `${product.weight} kg` : "N/A"}</p>
                </div>
              </div>

              {product.tags && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(typeof product.tags === "string"
                      ? product.tags.split(",")
                      : Array.isArray(product.tags)
                        ? product.tags
                        : []
                    ).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {typeof tag === "string" ? tag.trim() : tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Product Status</p>
                <Badge variant={getStatusVariant(product.status)} className="capitalize">
                  {product.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Visibility</p>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {product.is_featured && (
                <div>
                  <Badge variant="secondary">Featured Product</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Selling Price</p>
                <p className="text-2xl font-bold">₦{Number(product.price).toLocaleString()}</p>
              </div>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                <div>
                  <p className="text-sm text-muted-foreground">Compare Price</p>
                  <p className="text-lg font-medium line-through text-muted-foreground">
                    ₦{Number(product.compare_at_price).toLocaleString()}
                  </p>
                </div>
              )}
              {product.cost_price && (
                <div>
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="text-lg font-medium">₦{Number(product.cost_price).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Stock</p>
                <p className="text-2xl font-bold">{product.stock_available}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reserved Stock</p>
                <p className="text-lg font-medium">{product.stock_reserved || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
