"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function htmlValue(editor: Editor) {
  return editor.isEmpty ? "" : editor.getHTML()
}

function normalizeHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return null
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ProductDescriptionEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const onChangeRef = useRef(onChange)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
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
      Placeholder.configure({ placeholder: "Write the product description…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-40 px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(htmlValue(current))
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

  const applyLink = () => {
    if (!editor) return
    const href = normalizeHref(linkUrl)
    if (!href) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    setLinkOpen(false)
  }

  return (
    <div className="blog-editor overflow-hidden rounded-md border bg-background">
      <div className="flex flex-wrap gap-1 border-b p-1.5">
        <ToolbarButton label="Bold" active={editor?.isActive("bold")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor?.isActive("italic")} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading" active={editor?.isActive("heading", { level: 2 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Subheading" active={editor?.isActive("heading", { level: 3 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" active={editor?.isActive("bulletList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={() => {
            setLinkUrl(editor?.getAttributes("link").href || "")
            setLinkOpen(true)
          }}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="product-description-link">Address</Label>
            <Input
              id="product-description-link"
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
    </div>
  )
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
