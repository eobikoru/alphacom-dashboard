"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { toast } from "sonner"
import { formattingExtensions } from "@/components/editor-formatting"
import { EditorToolbar } from "@/components/editor-toolbar"
import { PromotionButton, PromotionVideo, promotionFromAddress } from "@/components/promotion-editor-nodes"
import { PromotionBadge, PromotionImage, PromotionNote, PromotionSlides } from "@/components/promotion-extras"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage, uploadBlogImage } from "@/lib/api/blog"
import { blogImageError } from "@/lib/blog"

function hasPromotion(editor: Editor) {
  let found = false
  editor.state.doc.descendants((node) => {
    if (node.type.name.startsWith("promotion")) found = true
  })
  return found
}

function htmlValue(editor: Editor) {
  if (!hasPromotion(editor) && editor.isEmpty) return ""
  return editor.getHTML()
}

function pastedImage(event: ClipboardEvent) {
  const files = event.clipboardData?.files
  if (files) {
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) return file
    }
  }
  const items = event.clipboardData?.items
  if (!items) return null
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) return item.getAsFile()
  }
  return null
}

function promotionSource(value: string) {
  if (typeof document === "undefined") return value
  let html = value
  for (let pass = 0; pass < 2 && html.trim().startsWith("&lt;"); pass += 1) {
    const area = document.createElement("textarea")
    area.innerHTML = html
    html = area.value
  }
  return html
}

export function ProductDescriptionEditor({
  value,
  onChange,
  placeholder = "Write the product description…",
  promotionTools = false,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  promotionTools?: boolean
}) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const linkFieldRef = useRef<HTMLInputElement>(null)
  const [linkPrompt, setLinkPrompt] = useState<{ top: number; left: number; from: number } | null>(null)
  const [linkDraft, setLinkDraft] = useState("")

  const source = promotionTools ? promotionSource(value) : value

  const emitted = useRef<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      ...formattingExtensions(),
      ...(promotionTools ? [PromotionVideo, PromotionButton, PromotionSlides, PromotionBadge, PromotionNote, PromotionImage] : []),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: source || "",
    editorProps: {
      attributes: {
        class: "min-h-40 px-4 py-3 focus:outline-none",
      },
      handlePaste: (view, event) => {
        if (!promotionTools) return false
        const target = event.target
        if (target instanceof Element && target.closest("input, textarea")) return false
        const file = pastedImage(event)
        if (file) {
          event.preventDefault()
          const imageError = blogImageError(file)
          if (imageError) {
            toast.error(imageError)
            return true
          }
          const from = view.state.selection.from
          void uploadBlogImage(file)
            .then((uploaded) => {
              const nodeType = view.state.schema.nodes.promotionImage
              if (!uploaded.url || view.isDestroyed || !nodeType) return
              view.dispatch(view.state.tr.insert(from, nodeType.create({ src: uploaded.url })))
            })
            .catch((error) => toast.error(getApiErrorMessage(error, "Could not upload that image.")))
          return true
        }
        const block = promotionFromAddress(event.clipboardData?.getData("text/plain") ?? "")
        if (!block) return false
        const nodeType = view.state.schema.nodes[block.type]
        if (!nodeType) return false
        view.dispatch(view.state.tr.replaceSelectionWith(nodeType.create(block.attrs)))
        return true
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = htmlValue(current)
      emitted.current = html
      onChangeRef.current(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = (promotionTools ? promotionSource(value) : value) || ""
    if (next === emitted.current || next === editor.getHTML()) return
    if (!next && hasPromotion(editor)) return
    emitted.current = next
    editor.commands.setContent(next, { emitUpdate: false })
  }, [editor, promotionTools, value])

  useEffect(() => {
    if (!linkPrompt) return
    linkFieldRef.current?.focus()
  }, [linkPrompt])

  const openVideoLink = () => {
    if (!editor) return
    const from = editor.state.selection.from
    const coords = editor.view.coordsAtPos(from)
    setLinkDraft("")
    setLinkPrompt({ top: coords.bottom + 6, left: coords.left, from })
  }

  const placeVideoLink = () => {
    if (!editor || !linkPrompt) return
    const raw = linkDraft.trim()
    if (!raw || /^\s*javascript:/i.test(raw)) return
    const src = /^https?:\/\//i.test(raw) || raw.startsWith("/") ? raw : `https://${raw}`
    editor.chain().focus().insertContentAt(linkPrompt.from, { type: "promotionVideo", attrs: { src } }).run()
    setLinkPrompt(null)
    setLinkDraft("")
  }

  return (
    <>
    <div className="blog-editor overflow-visible rounded-md border bg-background">
      <EditorToolbar
        editor={editor}
        extra={
          promotionTools ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={openVideoLink}
              >
                Video
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().insertContent({ type: "promotionImage", attrs: { optionsOpen: true } }).run()}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().insertContent({ type: "promotionButton", attrs: { optionsOpen: true } }).run()}
              >
                Button
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().insertContent({ type: "promotionSlides", attrs: { optionsOpen: true } }).run()}
              >
                Slides
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().insertContent({ type: "promotionBadge", attrs: { optionsOpen: true } }).run()}
              >
                Badge
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().insertContent({ type: "promotionNote", attrs: { optionsOpen: true } }).run()}
              >
                Note
              </Button>
            </>
          ) : null
        }
      />
      <EditorContent editor={editor} />
    </div>
    {linkPrompt ? (
      <div
        className="fixed z-50 flex w-72 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-md border border-[#e4ddd2] bg-white p-2 shadow-lg"
        style={{ top: linkPrompt.top, left: Math.max(8, Math.min(linkPrompt.left, window.innerWidth - 296)) }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <input
          ref={linkFieldRef}
          value={linkDraft}
          placeholder="Paste the video link"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
          onChange={(event) => setLinkDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              placeVideoLink()
            }
            if (event.key === "Escape") {
              event.preventDefault()
              setLinkPrompt(null)
            }
          }}
        />
        <Button type="button" size="sm" className="h-7 px-2 text-xs" disabled={!linkDraft.trim()} onClick={placeVideoLink}>
          Add
        </Button>
      </div>
    ) : null}
    </>
  )
}
