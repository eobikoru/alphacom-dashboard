"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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

function normalizeHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return null
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean
  disabled?: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 px-2"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange)
  const fileRef = useRef<HTMLInputElement>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
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
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          isAllowedUri: (url, { defaultValidate }) => {
            if (/^\s*javascript:/i.test(url)) return false
            return defaultValidate(url)
          },
        },
      }),
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

  const openLink = () => {
    if (!editor) return
    const previous = editor.getAttributes("link").href
    setLinkUrl(typeof previous === "string" ? previous : "")
    setLinkOpen(true)
  }

  const applyLink = () => {
    if (!editor) return
    const href = normalizeHref(linkUrl)
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      setLinkOpen(false)
      return
    }
    if (!href) {
      toast.error("That link can't be used.")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    setLinkOpen(false)
  }

  return (
    <div className="blog-editor rounded-lg border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <ToolbarButton label="Heading 2" active={editor?.isActive("heading", { level: 2 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor?.isActive("heading", { level: 3 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading 4" active={editor?.isActive("heading", { level: 4 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}>
          <Heading4 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Bold" active={editor?.isActive("bold")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor?.isActive("italic")} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor?.isActive("underline")} disabled={!editor} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor?.isActive("strike")} disabled={!editor} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Bulleted list" active={editor?.isActive("bulletList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor?.isActive("blockquote")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Inline code" active={editor?.isActive("code")} disabled={!editor} onClick={() => editor?.chain().focus().toggleCode().run()}>
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor?.isActive("link")} disabled={!editor} onClick={openLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <TableMenu editor={editor} />
        <ToolbarButton label="Upload image" disabled={!editor || uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
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
      </div>
      <EditorContent editor={editor} />
      <p className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">
        Headings 2–4, lists, links, bold, italic, underline, strike, quotes, code, and tables are kept. The post title is the page heading. Upload images here, or drop and paste JPEG, PNG, or WebP files up to 5 MB. Pictures from other sites are removed on save.
      </p>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
            <DialogDescription>Leave the address blank to remove the link. javascript: links are discarded.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="blog-link">Address</Label>
            <Input
              id="blog-link"
              value={linkUrl}
              placeholder="https://"
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  applyLink()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyLink}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {uploading ? "Uploading…" : "Insert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TableMenu({ editor }: { editor: Editor | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={editor?.isActive("table") ? "secondary" : "ghost"}
          size="sm"
          className={cn("h-8 px-2")}
          disabled={!editor}
          onMouseDown={(event) => event.preventDefault()}
        >
          Table
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          Insert table
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => editor?.chain().focus().addRowAfter().run()}>Add row</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => editor?.chain().focus().deleteRow().run()}>Delete row</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => editor?.chain().focus().addColumnAfter().run()}>Add column</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => editor?.chain().focus().deleteColumn().run()}>Delete column</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => editor?.chain().focus().deleteTable().run()}>Delete table</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
