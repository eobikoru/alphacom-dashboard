"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon } from "lucide-react"
import { useUploadCategoryImage } from "@/hooks/use-categories"
import Image from "next/image"

interface CategoryImageUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  categoryName: string
  currentImageUrl?: string | null
}

export function CategoryImageUploadModal({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  currentImageUrl,
}: CategoryImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const uploadImageMutation = useUploadCategoryImage()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    uploadImageMutation.mutate(
      {
        categoryId,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          // Reset form
          setSelectedFile(null)
          setPreviewUrl(null)
          onOpenChange(false)
        },
      },
    )
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Category Image</DialogTitle>
          <DialogDescription>Upload an image for "{categoryName}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Image */}
          {currentImageUrl != null && !previewUrl && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Current Image</Label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image src={currentImageUrl || "/placeholder.svg"} alt={categoryName} fill className="object-cover" />
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Preview</Label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            </div>
          )}

          {/* File Input */}
          <div>
            <Label htmlFor="image-upload" className="mb-2 block">
              Select Image
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadImageMutation.isPending}
                className="flex-1"
              />
              {!selectedFile && (
                <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploadImageMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploadImageMutation.isPending}>
            {uploadImageMutation.isPending ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
