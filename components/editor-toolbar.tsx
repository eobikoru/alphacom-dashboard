"use client"

import { useState, type ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Highlighter,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"
import { highlightColors, textColors } from "@/components/editor-formatting"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Table2 } from "lucide-react"

function normalizeHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return null
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function EditorToolbar({ editor, extra }: { editor: Editor | null; extra?: ReactNode }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const activeColor = (editor?.getAttributes("textStyle").color as string | undefined) || ""
  const activeHighlight = (editor?.getAttributes("highlight").color as string | undefined) || ""

  const applyLink = () => {
    if (!editor) return
    const href = normalizeHref(linkUrl)
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      setLinkOpen(false)
      return
    }
    if (!href) return
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    setLinkOpen(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled={!editor}>
              {editor?.isActive("heading", { level: 2 })
                ? "Heading 2"
                : editor?.isActive("heading", { level: 3 })
                  ? "Heading 3"
                  : editor?.isActive("heading", { level: 4 })
                    ? "Heading 4"
                    : "Paragraph"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => editor?.chain().focus().setParagraph().run()}>Paragraph</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading 2</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>Heading 3</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}>Heading 4</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 h-5 w-px bg-border" />

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
        <ToolbarButton label="Subscript" active={editor?.isActive("subscript")} disabled={!editor} onClick={() => editor?.chain().focus().toggleSubscript().run()}>
          <SubscriptIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Superscript" active={editor?.isActive("superscript")} disabled={!editor} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>
          <SuperscriptIcon className="size-4" />
        </ToolbarButton>

        <ColorMenu
          label="Text color"
          icon={<span className="block h-3.5 w-3.5 rounded-full border" style={{ background: activeColor || "#1c1916" }} />}
          colors={textColors}
          active={activeColor}
          disabled={!editor}
          onPick={(color) => {
            if (!color) editor?.chain().focus().unsetColor().run()
            else editor?.chain().focus().setColor(color).run()
          }}
        />
        <ColorMenu
          label="Highlight"
          icon={<Highlighter className="size-4" style={{ color: activeHighlight || undefined }} />}
          colors={highlightColors}
          active={activeHighlight}
          disabled={!editor}
          onPick={(color) => {
            if (!color) editor?.chain().focus().unsetHighlight().run()
            else editor?.chain().focus().setHighlight({ color }).run()
          }}
        />

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton label="Align left" active={editor?.isActive({ textAlign: "left" })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align center" active={editor?.isActive({ textAlign: "center" })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align right" active={editor?.isActive({ textAlign: "right" })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Justify" active={editor?.isActive({ textAlign: "justify" })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton label="Bulleted list" active={editor?.isActive("bulletList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Checklist" active={editor?.isActive("taskList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
          <ListChecks className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor?.isActive("blockquote")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Code" active={editor?.isActive("code")} disabled={!editor} onClick={() => editor?.chain().focus().toggleCode().run()}>
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor?.isActive("codeBlock")} disabled={!editor} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          <span className="px-0.5 text-[11px] font-semibold">{"</>"}</span>
        </ToolbarButton>
        <ToolbarButton label="Divider" disabled={!editor} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <Minus className="size-4" />
        </ToolbarButton>
        <TableMenu editor={editor} />
        <ToolbarButton
          label="Link"
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={() => {
            const previous = editor?.getAttributes("link").href
            setLinkUrl(typeof previous === "string" ? previous : "")
            setLinkOpen(true)
          }}
        >
          <Link2 className="size-4" />
        </ToolbarButton>

        {extra}

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Clear formatting"
          disabled={!editor}
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <RemoveFormatting className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
            <DialogDescription>Leave the address blank to remove the link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="editor-link">Address</Label>
            <Input
              id="editor-link"
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
    </>
  )
}

function ColorMenu({
  label,
  icon,
  colors,
  active,
  disabled,
  onPick,
}: {
  label: string
  icon: ReactNode
  colors: { name: string; value: string }[]
  active: string
  disabled?: boolean
  onPick: (color: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" disabled={disabled} aria-label={label}>
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            aria-label={color.name}
            className={cn(
              "size-6 rounded-full border",
              active === color.value && "ring-2 ring-foreground ring-offset-1",
            )}
            style={{ background: color.value || "transparent" }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(color.value)}
          />
        ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
          className="h-8 px-2"
          disabled={!editor}
          aria-label="Table"
          onMouseDown={(event) => event.preventDefault()}
        >
          <Table2 className="size-4" />
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
  children: ReactNode
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
