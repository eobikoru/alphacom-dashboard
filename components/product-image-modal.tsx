"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Loader2 } from "lucide-react"
import { useProduct, useDeleteProductImage, useAddProductImages } from "@/hooks/use-products"
import { ImageUpload } from "@/components/image-upload"

interface ProductImageModalProps {
  productId: string | null
  open: boolean
  onClose: () => void
}

export function ProductImageModal({ productId, open, onClose }: ProductImageModalProps) {
  const [images, setImages] = useState<File[]>([])

  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || "")
  const deleteImage = useDeleteProductImage(productId || "")
  const addImages = useAddProductImages(productId || "")

  const handleDeleteImage = (publicId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate(publicId)
    }
  }

  const handleAddImages = () => {
    if (images.length === 0 || !productId) {
      return
    }
    addImages.mutate(images, {
      onSuccess: () => {
        setImages([])
      },
    })
  }

  const handleClose = () => {
    setImages([])
    onClose()
  }

  if (!productId) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Product Images</DialogTitle>
          <DialogDescription>Add new images or delete existing ones for {product?.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Images */}
          {isLoadingProduct ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : product?.images && product.images.length > 0 ? (
            <div>
              <Label className="mb-2 block">Current Images ({product.images.length})</Label>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.public_id)}
                      disabled={deleteImage.isPending}
                    >
                      {deleteImage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No images yet. Add some below.</p>
            </div>
          )}

          {/* Add New Images */}
          <div>
            <Label className="mb-2 block">Add New Images</Label>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
            {images.length > 0 && (
              <Button type="button" onClick={handleAddImages} disabled={addImages.isPending} className="mt-3 w-full">
                {addImages.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {images.length} Image{images.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
