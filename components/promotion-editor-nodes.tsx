"use client"

import { useRef, type PointerEvent as ReactPointerEvent } from "react"
import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import type { CSSProperties, ReactNode } from "react"

function isBareUrl(value: string) {
  return /^(https?:\/\/|www\.)\S+$/i.test(value.trim())
}

function youtubeId(url: URL) {
  const host = url.hostname.replace(/^www\./, "")
  if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? ""
  if (!host.endsWith("youtube.com") && host !== "youtube-nocookie.com") return ""
  const fromQuery = url.searchParams.get("v")
  if (fromQuery) return fromQuery
  const parts = url.pathname.split("/").filter(Boolean)
  const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live" || part === "v")
  return marker >= 0 ? (parts[marker + 1] ?? "") : ""
}

function embedMedia(raw: string): { kind: "iframe" | "video"; src: string } | null {
  const trimmed = raw.trim()
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return null
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/\//, "")}`
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null
  const youtube = youtubeId(url)
  if (/^[\w-]{6,}$/.test(youtube)) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube}` }
  const host = url.hostname.replace(/^www\./, "")
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop() ?? ""
    if (/^\d+$/.test(id)) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` }
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)) return { kind: "video", src: url.href }
  return null
}

function frameStyle(width: number, height: number) {
  const size = width > 0 ? `width:${Math.round(width)}px;max-width:100%;` : "width:100%;"
  const tall = height > 0 ? `height:${Math.round(height)}px;` : "aspect-ratio:16/9;height:auto;"
  return `display:block;${size}${tall}border:0;`
}

export function ResizableFrame({
  width,
  height,
  onResize,
  children,
}: {
  width: number
  height: number
  onResize: (width: number, height: number) => void
  children: ReactNode
}) {
  const box = useRef<HTMLDivElement>(null)
  const drag = (mode: "x" | "y" | "both") => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = box.current?.getBoundingClientRect()
    const originX = event.clientX
    const originY = event.clientY
    const originW = width > 0 ? width : Math.round(rect?.width || 480)
    const originH = height > 0 ? height : Math.round(rect?.height || 270)
    const move = (pointer: PointerEvent) => {
      const nextWidth = mode === "y" ? originW : Math.max(160, Math.round(originW + pointer.clientX - originX))
      const nextHeight = mode === "x" ? originH : Math.max(90, Math.round(originH + pointer.clientY - originY))
      onResize(nextWidth, nextHeight)
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  return (
    <div
      ref={box}
      className="relative max-w-full outline outline-[#e4ddd2]"
      contentEditable={false}
      style={{
        width: width > 0 ? width : "100%",
        maxWidth: "100%",
        height: height > 0 ? height : undefined,
        aspectRatio: height > 0 ? undefined : "16 / 9",
      }}
    >
      <div className="h-full w-full overflow-hidden">{children}</div>
      <button type="button" aria-label="Drag the width" className="absolute inset-y-0 right-0 z-10 w-3 cursor-ew-resize" onPointerDown={drag("x")} onClick={(event) => event.stopPropagation()} />
      <button type="button" aria-label="Drag the height" className="absolute inset-x-0 bottom-0 z-10 h-3 cursor-ns-resize" onPointerDown={drag("y")} onClick={(event) => event.stopPropagation()} />
      <button
        type="button"
        aria-label="Drag the frame size"
        className="absolute right-1 bottom-1 z-10 size-3.5 cursor-nwse-resize border border-[#1c1916] bg-[#f6f3ee]"
        onPointerDown={drag("both")}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

function VideoLinkView({ node, updateAttributes }: ReactNodeViewProps) {
  const src = String(node.attrs.src ?? "")
  const width = num(node.attrs.width)
  const height = num(node.attrs.height)
  const media = embedMedia(src)
  return (
    <NodeViewWrapper className="my-3">
      {media ? (
        <ResizableFrame width={width} height={height} onResize={(nextWidth, nextHeight) => updateAttributes({ width: nextWidth, height: nextHeight })}>
          {media.kind === "iframe" ? (
            <iframe title="Promotion video" src={media.src} className="block h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <video src={media.src} controls className="block h-full w-full bg-black object-contain" />
          )}
        </ResizableFrame>
      ) : (
        <p className="text-sm">{src}</p>
      )}
    </NodeViewWrapper>
  )
}

function num(value: unknown, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? ""))
  return Number.isFinite(parsed) ? parsed : fallback
}

function cssColor(value: string, fallback: string) {
  const trimmed = value.trim()
  if (/^#([0-9a-f]{6})$/i.test(trimmed)) return trimmed
  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    const [red, green, blue] = trimmed.slice(1).split("")
    return `#${red}${red}${green}${green}${blue}${blue}`
  }
  const rgb = trimmed.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i)
  if (!rgb) return trimmed || fallback
  const channel = (part: string) => Number(part).toString(16).padStart(2, "0")
  return `#${channel(rgb[1])}${channel(rgb[2])}${channel(rgb[3])}`
}

function px(value: string, fallback: number) {
  const match = value.match(/-?\d+(\.\d+)?/)
  return match ? Math.round(Number(match[0])) : fallback
}

type ButtonAttrs = Record<string, unknown>

export function promotionButtonStyle(attrs: ButtonAttrs): CSSProperties {
  const width = num(attrs.width, 0)
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    textDecoration: "none",
    cursor: "grab",
    position: "relative",
    left: num(attrs.offsetX),
    top: num(attrs.offsetY),
    height: num(attrs.height, 44),
    padding: `0 ${num(attrs.paddingX, 18)}px`,
    borderRadius: num(attrs.borderRadius),
    background: String(attrs.backgroundColor || "#1c1916"),
    color: String(attrs.textColor || "#f6f3ee"),
    border: `${num(attrs.borderWidth)}px solid ${String(attrs.borderColor || "#1c1916")}`,
    width: width > 0 ? width : undefined,
    lineHeight: 1,
  }
}

function promotionButtonInlineStyle(attrs: ButtonAttrs) {
  const style = promotionButtonStyle(attrs)
  const width = typeof style.width === "number" ? `width:${style.width}px;` : ""
  return [
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "box-sizing:border-box",
    "text-decoration:none",
    "position:relative",
    `left:${num(attrs.offsetX)}px`,
    `top:${num(attrs.offsetY)}px`,
    `height:${num(attrs.height, 44)}px`,
    `padding:0 ${num(attrs.paddingX, 18)}px`,
    `border-radius:${num(attrs.borderRadius)}px`,
    `background:${String(attrs.backgroundColor || "#1c1916")}`,
    `color:${String(attrs.textColor || "#f6f3ee")}`,
    `border:${num(attrs.borderWidth)}px solid ${String(attrs.borderColor || "#1c1916")}`,
    width,
    "line-height:1",
  ]
    .filter(Boolean)
    .join(";")
}

function buttonAttrsFromElement(element: HTMLElement) {
  const style = element.style
  const paddingParts = style.padding.split(" ").filter(Boolean)
  const paddingX = paddingParts.length > 1 ? px(paddingParts[1], 18) : px(style.paddingLeft || style.padding, 18)
  return {
    href: element.getAttribute("href") ?? "",
    label: element.textContent?.trim() ?? "",
    backgroundColor: cssColor(style.backgroundColor, "#1c1916"),
    textColor: cssColor(style.color, "#f6f3ee"),
    borderColor: cssColor(style.borderColor, "#1c1916"),
    borderWidth: px(style.borderWidth, 0),
    borderRadius: px(style.borderRadius, 0),
    height: px(style.height, 44),
    width: style.width ? px(style.width, 0) : 0,
    paddingX,
    offsetX: px(style.left, 0),
    offsetY: px(style.top, 0),
  }
}

const ignoredAttr = {
  renderHTML: () => ({}),
  parseHTML: () => null,
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const picker = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : "#1c1916"
  return (
    <label className="block text-xs text-[#6f675f]" onMouseDown={(event) => event.stopPropagation()}>
      {label}
      <span className="mt-1 flex items-center gap-2">
        <input type="color" value={picker} aria-label={`${label} picker`} onChange={(event) => onChange(event.target.value)} />
        <input
          value={value}
          className="w-full bg-transparent text-sm text-[#1c1916] outline-none"
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block text-xs text-[#6f675f]" onMouseDown={(event) => event.stopPropagation()}>
      {label}
      <input
        type="number"
        value={value}
        className="mt-1 w-full bg-transparent text-sm text-[#1c1916] outline-none"
        onChange={(event) => onChange(num(event.target.value, 0))}
      />
    </label>
  )
}

function CallToActionView({ node, updateAttributes }: ReactNodeViewProps) {
  const attrs = node.attrs as ButtonAttrs
  const optionsOpen = attrs.optionsOpen !== false && attrs.optionsOpen !== "false"
  const drag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startY = event.clientY
    const originX = num(attrs.offsetX)
    const originY = num(attrs.offsetY)
    let moved = false
    const move = (pointer: PointerEvent) => {
      if (Math.abs(pointer.clientX - startX) > 3 || Math.abs(pointer.clientY - startY) > 3) moved = true
      if (!moved) return
      updateAttributes({
        offsetX: Math.round(originX + pointer.clientX - startX),
        offsetY: Math.round(originY + pointer.clientY - startY),
      })
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      if (!moved && !optionsOpen) updateAttributes({ optionsOpen: true })
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  const button = (
    <a
      href={String(attrs.href || "#")}
      className="btn"
      style={promotionButtonStyle(attrs)}
      onClick={(event) => event.preventDefault()}
      onPointerDown={drag}
    >
      {String(attrs.label || "Button")}
    </a>
  )

  if (!optionsOpen) {
    return <NodeViewWrapper className="my-2">{button}</NodeViewWrapper>
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="rounded-md border border-[#e4ddd2] bg-[#faf8f5] px-3 py-3" contentEditable={false}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] tracking-[0.16em] text-[#8a7352] uppercase">Button</span>
          <span className="flex items-center gap-3">
            <span data-drag-handle className="cursor-grab text-xs text-[#8a7352]">
              Move in text
            </span>
            <button
              type="button"
              className="text-xs text-[#1c1916]"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => updateAttributes({ optionsOpen: false })}
            >
              Done
            </button>
          </span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={String(attrs.label ?? "")}
            placeholder="Shop now"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
            onChange={(event) => updateAttributes({ label: event.target.value })}
            onMouseDown={(event) => event.stopPropagation()}
          />
          <input
            value={String(attrs.href ?? "")}
            placeholder="/shop"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
            onChange={(event) => updateAttributes({ href: event.target.value })}
            onMouseDown={(event) => event.stopPropagation()}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ColorField label="Background" value={String(attrs.backgroundColor || "#1c1916")} onChange={(backgroundColor) => updateAttributes({ backgroundColor })} />
          <ColorField label="Text" value={String(attrs.textColor || "#f6f3ee")} onChange={(textColor) => updateAttributes({ textColor })} />
          <ColorField label="Border" value={String(attrs.borderColor || "#1c1916")} onChange={(borderColor) => updateAttributes({ borderColor })} />
          <NumberField label="Radius" value={num(attrs.borderRadius)} onChange={(borderRadius) => updateAttributes({ borderRadius })} />
          <NumberField label="Height" value={num(attrs.height, 44)} onChange={(height) => updateAttributes({ height })} />
          <NumberField label="Border width" value={num(attrs.borderWidth)} onChange={(borderWidth) => updateAttributes({ borderWidth })} />
          <NumberField label="Padding" value={num(attrs.paddingX, 18)} onChange={(paddingX) => updateAttributes({ paddingX })} />
          <NumberField label="Width" value={num(attrs.width)} onChange={(width) => updateAttributes({ width })} />
        </div>
        <p className="mt-3 text-xs text-[#6f675f]">Drag the button to place it. Done leaves only the button in the text.</p>
        {button}
      </div>
    </NodeViewWrapper>
  )
}

export const PromotionVideo = Node.create({
  name: "promotionVideo",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: "", ...ignoredAttr },
      width: { default: 0, ...ignoredAttr },
      height: { default: 0, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "iframe.promo-video, video.promo-video",
        priority: 1000,
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false
          return {
            src: element.getAttribute("src") ?? "",
            width: element.style.width.endsWith("px") ? px(element.style.width, 0) : 0,
            height: element.style.height.endsWith("px") ? px(element.style.height, 0) : 0,
          }
        },
      },
      {
        tag: "p",
        priority: 1000,
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false
          const text = element.textContent?.trim() ?? ""
          if (!isBareUrl(text) || element.children.length > 0) return false
          return { src: text }
        },
      },
    ]
  },
  renderHTML({ node }) {
    const src = String(node.attrs.src ?? "").trim()
    const media = embedMedia(src)
    if (!media) {
      if (!src || /^\s*javascript:/i.test(src)) return ["p", { "data-empty-promotion": "true" }]
      const href = /^https?:\/\//i.test(src) || src.startsWith("/") ? src : `https://${src}`
      return ["p", {}, href]
    }
    const style = `${frameStyle(num(node.attrs.width), num(node.attrs.height))}object-fit:contain;`
    if (media.kind === "video") {
      return ["video", mergeAttributes({ class: "promo-video", src: media.src, controls: "true", style })]
    }
    return [
      "iframe",
      mergeAttributes({
        class: "promo-video",
        src: media.src,
        title: "Video",
        style,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: "true",
      }),
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoLinkView)
  },
})

export const PromotionButton = Node.create({
  name: "promotionButton",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      href: { default: "" },
      label: { default: "" },
      optionsOpen: { default: false, ...ignoredAttr },
      backgroundColor: { default: "#1c1916", ...ignoredAttr },
      textColor: { default: "#f6f3ee", ...ignoredAttr },
      borderColor: { default: "#1c1916", ...ignoredAttr },
      borderWidth: { default: 0, ...ignoredAttr },
      borderRadius: { default: 0, ...ignoredAttr },
      height: { default: 44, ...ignoredAttr },
      width: { default: 0, ...ignoredAttr },
      paddingX: { default: 18, ...ignoredAttr },
      offsetX: { default: 0, ...ignoredAttr },
      offsetY: { default: 0, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "a.btn",
        priority: 1000,
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false
          return buttonAttrsFromElement(element)
        },
      },
    ]
  },
  renderHTML({ node }) {
    const href = String(node.attrs.href ?? "").trim()
    const label = String(node.attrs.label ?? "").trim()
    if (!href || !label || /^\s*javascript:/i.test(href)) return ["a", { "data-empty-promotion": "true" }]
    return ["a", mergeAttributes({ href, class: "btn", style: promotionButtonInlineStyle(node.attrs) }), label]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CallToActionView)
  },
})
