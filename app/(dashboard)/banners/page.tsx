"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Edit, ImageUp, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useBanner, useBanners, useCreateBanner, useDeleteBanner, useReorderBanners, useUpdateBanner, useUploadBannerImage } from "@/hooks/use-banners"
import type { Banner, CreateBannerData } from "@/types/banner"
import { toast } from "sonner"

interface BannerFormState {
  title: string
  subtitle: string
  link_url: string
  is_active: boolean
}

const defaultFormState: BannerFormState = {
  title: "",
  subtitle: "",
  link_url: "",
  is_active: true,
}

const MAX_BANNER_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export default function BannersPage() {
  const { data, isLoading, isError } = useBanners()
  const banners = useMemo(() => data ?? [], [data])
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const deleteBanner = useDeleteBanner()
  const reorderBanners = useReorderBanners()
  const uploadBannerImage = useUploadBannerImage()

  const [localBanners, setLocalBanners] = useState<Banner[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null)
  const [imageUploadBannerId, setImageUploadBannerId] = useState<string | null>(null)
  const [form, setForm] = useState<BannerFormState>(defaultFormState)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const { data: editingBanner } = useBanner(editingBannerId || "")

  useEffect(() => {
    const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)
    setLocalBanners(sorted)
  }, [banners])

  useEffect(() => {
    if (!editingBanner) return
    setForm({
      title: editingBanner.title || "",
      subtitle: editingBanner.subtitle || "",
      link_url: editingBanner.link_url || "",
      is_active: editingBanner.is_active ?? true,
    })
  }, [editingBanner])

  const hasReorderChanges = useMemo(() => {
    return localBanners.some((banner, index) => banner.sort_order !== index)
  }, [localBanners])

  const moveBanner = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= localBanners.length) return

    const next = [...localBanners]
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp

    const withUpdatedOrder = next.map((banner, idx) => ({
      ...banner,
      sort_order: idx,
    }))

    setLocalBanners(withUpdatedOrder)
  }

  const resetForm = () => {
    setForm(defaultFormState)
  }

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error("Banner title is required")
      return
    }

    const payload: CreateBannerData = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      link_url: form.link_url.trim() || undefined,
      is_active: form.is_active,
    }

    await createBanner.mutateAsync(payload)
    setIsCreateOpen(false)
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingBannerId) return
    if (!form.title.trim()) {
      toast.error("Banner title is required")
      return
    }

    await updateBanner.mutateAsync({
      bannerId: editingBannerId,
      data: {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        link_url: form.link_url.trim() || undefined,
        is_active: form.is_active,
      },
    })

    setEditingBannerId(null)
    resetForm()
  }

  const handleDelete = async () => {
    if (!deleteBannerId) return
    await deleteBanner.mutateAsync(deleteBannerId)
    setDeleteBannerId(null)
  }

  const handleSaveOrder = async () => {
    await reorderBanners.mutateAsync({
      banners: localBanners.map((banner, index) => ({
        id: banner.id,
        sort_order: index,
      })),
    })
  }

  const handleImageUpload = async () => {
    if (!imageUploadBannerId || !selectedImageFile) {
      toast.error("Please choose an image file")
      return
    }

    if (selectedImageFile.size > MAX_BANNER_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Maximum allowed size is 10MB.")
      return
    }

    await uploadBannerImage.mutateAsync({
      bannerId: imageUploadBannerId,
      file: selectedImageFile,
    })

    setImageUploadBannerId(null)
    setSelectedImageFile(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">Create, edit, reorder, and manage homepage banners</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Banner
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveOrder}
            disabled={!hasReorderChanges || reorderBanners.isPending}
            className="flex items-center gap-2"
          >
            {reorderBanners.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banner List</CardTitle>
          <CardDescription>Reorder with arrows and click Save Order to persist changes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}

          {isError && !isLoading && <p className="text-sm text-destructive">Failed to load banners.</p>}

          {!isLoading && !isError && localBanners.length === 0 && (
            <p className="text-sm text-muted-foreground">No banners found. Create one to get started.</p>
          )}

          <div className="space-y-3">
            {localBanners.map((banner, index) => (
              <div
                key={banner.id}
                className="border rounded-lg p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-28 h-16 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{banner.title}</p>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Order: {index}</Badge>
                    </div>
                    {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                    <p className="text-xs text-muted-foreground">{banner.link_url || "No link URL"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <Button variant="outline" size="icon" onClick={() => moveBanner(index, "up")} disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveBanner(index, "down")}
                    disabled={index === localBanners.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setImageUploadBannerId(banner.id)}>
                    <ImageUp className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setEditingBannerId(banner.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setDeleteBannerId(banner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Banner</DialogTitle>
            <DialogDescription>Add banner title, subtitle, link, and active status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Summer Sale - Up to 50% Off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-subtitle">Subtitle</Label>
              <Input
                id="create-subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Shop the best deals on electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-link">Link URL</Label>
              <Input
                id="create-link"
                value={form.link_url}
                onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
                placeholder="/categories/electronics"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="create-active">Active</Label>
              <Switch
                id="create-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createBanner.isPending}>
              {createBanner.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingBannerId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBannerId(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Update banner details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subtitle">Subtitle</Label>
              <Input
                id="edit-subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Link URL</Label>
              <Input
                id="edit-link"
                value={form.link_url}
                onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBannerId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateBanner.isPending}>
              {updateBanner.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!imageUploadBannerId}
        onOpenChange={(open) => {
          if (!open) {
            setImageUploadBannerId(null)
            setSelectedImageFile(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Banner Image</DialogTitle>
            <DialogDescription>Upload an image file for this banner.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                if (file && file.size > MAX_BANNER_IMAGE_SIZE_BYTES) {
                  toast.error("Image is too large. Maximum allowed size is 10MB.")
                  setSelectedImageFile(null)
                  return
                }
                setSelectedImageFile(file)
              }}
            />
            {selectedImageFile && <p className="text-xs text-muted-foreground">{selectedImageFile.name}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageUploadBannerId(null)}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload} disabled={uploadBannerImage.isPending || !selectedImageFile}>
              {uploadBannerImage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Upload Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteBannerId} onOpenChange={(open) => !open && setDeleteBannerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBannerId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteBanner.isPending}>
              {deleteBanner.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
