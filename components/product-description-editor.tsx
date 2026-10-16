"use client"

import { useEffect, useRef } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { formattingExtensions } from "@/components/editor-formatting"
import { EditorToolbar } from "@/components/editor-toolbar"

function htmlValue(editor: Editor) {
  return editor.isEmpty ? "" : editor.getHTML()
}

export function ProductDescriptionEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      ...formattingExtensions(),
      Placeholder.configure({ placeholder: "Write the product description…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
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

  return (
    <div className="blog-editor overflow-hidden rounded-md border bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
