"use client"

import { useEffect, useRef, useState } from "react"
import { ImageIcon, Loader2, Trash2 } from "lucide-react"
import { blogImageError } from "@/lib/blog"
import { useDeleteCoverImage, useUploadCoverImage } from "@/hooks/use-blog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CoverImageFieldProps {
  postId?: string
  imageUrl: string | null
  pendingFile: File | null
  onPendingFile: (file: File | null) => void
  onImageUrlChange: (url: string | null) => void
}

export function CoverImageField({
  postId,
  imageUrl,
  pendingFile,
  onPendingFile,
  onImageUrlChange,
}: CoverImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadCoverImage()
  const remove = useDeleteCoverImage()
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!pendingFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const shown = preview || imageUrl
  const busy = upload.isPending || remove.isPending

  const chooseFile = async (file: File | undefined) => {
    if (!file) return
    const error = blogImageError(file)
    if (error) {
      toast.error(error)
      return
    }
    if (!postId) {
      onPendingFile(file)
      return
    }
    const uploaded = await upload.mutateAsync({ id: postId, file })
    onPendingFile(null)
    if (uploaded.url) onImageUrlChange(uploaded.url)
  }

  const clear = async () => {
    if (pendingFile) {
      onPendingFile(null)
      return
    }
    if (!postId || !imageUrl) {
      onImageUrlChange(null)
      return
    }
    await remove.mutateAsync(postId)
    onImageUrlChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-muted/40">
        {shown ? (
          <img src={shown} alt="" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-5" />
            <span className="text-xs">No cover image</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          void chooseFile(file)
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {shown ? "Replace" : "Upload"}
        </Button>
        {shown ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void clear()}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP, up to 5 MB. This is separate from images inside the post.
        {pendingFile ? " It uploads when you save." : ""}
      </p>
    </div>
  )
}
