"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProduct } from "@/hooks/use-products"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ProductDetailModalProps {
  productId: string | null
  open: boolean
  onClose: () => void
}

export function ProductDetailModal({ productId, open, onClose }: ProductDetailModalProps) {
  const { data: product, isLoading, isError } = useProduct(productId || "")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load product details</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {product && (
          <div className="space-y-6">
            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url || "/placeholder.svg"}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {product.status.replace("_", " ")}
                </Badge>
                {product.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              {product.description && <p className="text-muted-foreground">{product.description}</p>}
            </div>

            <Separator />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-2xl font-bold">₦{Number(product.price).toLocaleString()}</p>
              </div>
              {product.compare_at_price && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Compare at Price</p>
                  <p className="text-xl font-semibold line-through text-muted-foreground">
                    ₦{Number(product.compare_at_price).toLocaleString()}
                  </p>
                </div>
              )}
              {product.cost_price && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cost Price</p>
                  <p className="text-lg font-medium">₦{Number(product.cost_price).toLocaleString()}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Stock & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stock Available</p>
                <p className="text-lg font-semibold">{product.stock_available}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="text-lg font-medium">{product.category_name || "Uncategorized"}</p>
              </div>
              {product.brand && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Brand</p>
                  <p className="text-lg font-medium">{product.brand}</p>
                </div>
              )}
            </div>

            {product.tags && (
              <>
                <Separator />
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
              </>
            )}

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(product.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{new Date(product.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
