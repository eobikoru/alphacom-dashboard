"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { ImageIcon, Loader2 } from "lucide-react"
import { formattingExtensions } from "@/components/editor-formatting"
import { EditorToolbar } from "@/components/editor-toolbar"
import { toast } from "sonner"
import { blogImageError } from "@/lib/blog"
import { getApiErrorMessage, uploadBlogImage } from "@/lib/api/blog"
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

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

interface PendingImage {
  file: File
  preview: string
  alt: string
  pos?: number
  usePos: boolean
}

function imageFilesFrom(list: ArrayLike<File | DataTransferItem> | null | undefined) {
  if (!list) return []
  const files: File[] = []
  for (const entry of Array.from(list)) {
    if (entry instanceof File) {
      if (entry.type.startsWith("image/")) files.push(entry)
      continue
    }
    if (entry.kind === "file") {
      const file = entry.getAsFile()
      if (file && file.type.startsWith("image/")) files.push(file)
    }
  }
  return files
}

function altFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange)
  const fileRef = useRef<HTMLInputElement>(null)
  const [queue, setQueue] = useState<PendingImage[]>([])
  const [uploading, setUploading] = useState(false)
  onChangeRef.current = onChange

  const queueImages = (files: File[], pos?: number) => {
    const accepted: PendingImage[] = []
    files.forEach((file, index) => {
      const error = blogImageError(file)
      if (error) {
        toast.error(`${file.name}: ${error}`)
        return
      }
      accepted.push({
        file,
        preview: URL.createObjectURL(file),
        alt: altFromFile(file),
        pos,
        usePos: index === 0 && typeof pos === "number",
      })
    })
    if (accepted.length === 0) return
    setQueue((current) => [...current, ...accepted])
  }

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      ...formattingExtensions(),
      Image.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder: "Write the post…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[360px] px-4 py-3 focus:outline-none",
      },
      transformPastedHTML(html) {
        if (!html.includes("<img")) return html
        const doc = new DOMParser().parseFromString(html, "text/html")
        let removed = false
        doc.querySelectorAll("img").forEach((image) => {
          const src = image.getAttribute("src") || ""
          if (!src.includes("res.cloudinary.com")) {
            image.remove()
            removed = true
          }
        })
        if (removed) {
          toast.info("Pictures from other sites were left out. Upload them with the image button, or drop the file in.")
        }
        return doc.body.innerHTML
      },
      handlePaste(_view, event) {
        const files = imageFilesFrom(event.clipboardData?.items)
        if (files.length === 0) return false
        event.preventDefault()
        queueImages(files)
        return true
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false
        const files = imageFilesFrom(event.dataTransfer?.files)
        if (files.length === 0) return false
        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        queueImages(files, coords?.pos)
        return true
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (!value) {
      if (editor.isEmpty) return
      editor.commands.setContent("", { emitUpdate: false })
      return
    }
    if (value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  const queueRef = useRef(queue)
  queueRef.current = queue
  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => URL.revokeObjectURL(item.preview))
    }
  }, [])

  const currentImage = queue[0]

  const closeImage = () => {
    setQueue((items) => {
      const [first, ...rest] = items
      if (first) URL.revokeObjectURL(first.preview)
      return rest
    })
  }

  const insertCurrentImage = async () => {
    if (!editor || !currentImage) return
    setUploading(true)
    try {
      const uploaded = await uploadBlogImage(currentImage.file)
      const chain = editor.chain().focus()
      if (currentImage.usePos && typeof currentImage.pos === "number") chain.setTextSelection(currentImage.pos)
      chain.setImage({ src: uploaded.url, alt: currentImage.alt.trim() }).run()
      closeImage()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not upload that image."))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="blog-editor rounded-lg border bg-background">
      <EditorToolbar
        editor={editor}
        extra={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              aria-label="Upload image"
              disabled={!editor || uploading}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                event.target.value = ""
                queueImages(files)
              }}
            />
          </>
        }
      />
      <EditorContent editor={editor} />
      <p className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">
        Use the toolbar for headings, color, highlight, alignment, lists, quotes, code, and tables. The post title is the page heading. Upload images here, or drop and paste JPEG, PNG, or WebP files up to 5 MB.
      </p>

      <Dialog open={Boolean(currentImage)} onOpenChange={(open) => !open && !uploading && closeImage()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add image</DialogTitle>
            <DialogDescription>
              {queue.length > 1 ? `${queue.length} images waiting. ` : ""}
              Add a short description. The file uploads before it is placed in the post.
            </DialogDescription>
          </DialogHeader>
          {currentImage && (
            <div className="space-y-3">
              <img src={currentImage.preview} alt="" className="max-h-48 w-full rounded-md object-contain bg-muted" />
              <div className="space-y-2">
                <Label htmlFor="blog-image-alt">Description</Label>
                <Input
                  id="blog-image-alt"
                  value={currentImage.alt}
                  onChange={(event) =>
                    setQueue((items) => items.map((item, index) => (index === 0 ? { ...item, alt: event.target.value } : item)))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImage} disabled={uploading}>
              Skip
            </Button>
            <Button type="button" onClick={insertCurrentImage} disabled={uploading || !currentImage}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : null}
              {uploading ? "Uploading..." : "Insert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
