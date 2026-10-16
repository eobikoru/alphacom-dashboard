import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"

export const textColors = [
  { name: "Default", value: "" },
  { name: "Black", value: "#1c1916" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Gold", value: "#ca8a04" },
  { name: "Green", value: "#15803d" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
]

export const highlightColors = [
  { name: "None", value: "" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Red", value: "#fecaca" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Orange", value: "#fed7aa" },
]

export function formattingExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
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
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
  ]
}
