"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  maxSize?: number // in MB
}

export function ImageUpload({ images, onImagesChange, maxImages = 10, maxSize = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      setUploading(true)

      try {
        const newImages: File[] = []

        for (const file of acceptedFiles) {
          if (file.size > maxSize * 1024 * 1024) {
            toast.error(`${file.name} is too large. Maximum size is ${maxSize}MB`)
            continue
          }

          newImages.push(file)
          console.log("[v0] File added:", file.name)
        }

        onImagesChange([...images, ...newImages])
        toast.success(`${newImages.length} image(s) added successfully`)
      } catch (error) {
        toast.error("Failed to add images")
        console.error("[v0] Upload error:", error)
      } finally {
        setUploading(false)
      }
    },
    [images, onImagesChange, maxImages, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages,
  })

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          uploading && "opacity-50 cursor-not-allowed",
          images.length >= maxImages && "opacity-50 cursor-not-allowed",
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-muted rounded-full">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : isDragActive
                    ? "Drop images here"
                    : "Drag & drop images here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP up to {maxSize}MB each. Maximum {maxImages} images.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Primary Image Badge */}
              {index === 0 && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Primary</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>
              {images.length} of {maxImages} images uploaded
            </span>
          </div>
          {images.length >= maxImages && (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>Maximum images reached</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
