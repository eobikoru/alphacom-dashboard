"use client"

import { useState } from "react"
import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import { domElement, isImageAddress, linkedAddress, ResizableFrame } from "@/components/promotion-editor-nodes"
import { toast } from "sonner"
import { blogImageError } from "@/lib/blog"
import { getApiErrorMessage, uploadBlogImage } from "@/lib/api/blog"

const ignoredAttr = {
  renderHTML: () => ({}),
  parseHTML: () => null,
}

function optionsAreOpen(value: unknown) {
  return value === true || value === "true"
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

function safeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return ""
  return trimmed
}

type Slide = { image: string; title: string; text: string }

const starterSlides: Slide[] = [
  { image: "", title: "This weekend", text: "Free delivery on every order." },
  { image: "", title: "Shop the edit", text: "A short note for the next slide." },
]

function parseSlides(value: unknown): Slide[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"))
    if (!Array.isArray(parsed)) return starterSlides
    const slides = parsed
      .map((item) => {
        const slide = item as Partial<Slide>
        return {
          image: safeUrl(String(slide.image ?? "")),
          title: cleanText(slide.title).slice(0, 80),
          text: cleanText(slide.text).slice(0, 180),
        }
      })
      .filter((slide) => slide.title || slide.text || slide.image)
    return slides.length > 0 ? slides.slice(0, 8) : starterSlides
  } catch {
    return starterSlides
  }
}

const slideTrackStyle =
  "display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 10px;scrollbar-width:thin;"
const slideCardStyle =
  "flex:0 0 100%;scroll-snap-align:start;box-sizing:border-box;padding:16px;border-radius:12px;background:#ffffff;color:#1c1916;"

function slideNodes(slides: Slide[]) {
  return slides.map((slide) => {
    const children: unknown[] = []
    const image = safeUrl(slide.image)
    if (image) {
      children.push([
        "img",
        {
          src: image,
          alt: "",
          style: "display:block;width:100%;height:160px;object-fit:cover;border-radius:8px;margin:0 0 12px;",
        },
      ])
    }
    if (slide.title) children.push(["strong", { style: "display:block;font-size:18px;line-height:1.3;" }, slide.title])
    if (slide.text) children.push(["p", { style: "margin:8px 0 0;line-height:1.5;" }, slide.text])
    return ["div", { class: "promo-slide", style: slideCardStyle }, ...children]
  })
}

function SlidesView({ node, updateAttributes }: ReactNodeViewProps) {
  const slides = parseSlides(node.attrs.slides)
  const open = optionsAreOpen(node.attrs.optionsOpen)
  const write = (next: Slide[]) => updateAttributes({ slides: JSON.stringify(next) })

  const track = (
    <div className="promo-slides" style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8 }}>
      {slides.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          className="promo-slide"
          style={{ flex: "0 0 100%", scrollSnapAlign: "start", boxSizing: "border-box", padding: 16, borderRadius: 12, background: "#fff", color: "#1c1916" }}
        >
          {slide.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.image} alt="" style={{ display: "block", width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
          ) : null}
          {slide.title ? <strong style={{ display: "block", fontSize: 18, lineHeight: 1.3 }}>{slide.title}</strong> : null}
          {slide.text ? <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>{slide.text}</p> : null}
        </div>
      ))}
    </div>
  )

  if (!open) {
    return (
      <NodeViewWrapper className="my-3" onMouseDown={(event) => event.stopPropagation()} onClick={() => updateAttributes({ optionsOpen: true })}>
        {track}
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="rounded-md border border-[#e4ddd2] bg-[#faf8f5] px-3 py-3" contentEditable={false} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] tracking-[0.16em] text-[#8a7352] uppercase">Slides</span>
          <button type="button" className="text-xs text-[#1c1916]" onClick={() => updateAttributes({ optionsOpen: false })}>
            Done
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {slides.map((slide, index) => (
            <div key={`edit-${index}`} className="space-y-2 border-t border-[#e7e1d8] pt-3">
              {safeUrl(slide.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={safeUrl(slide.image)} alt="" style={{ display: "block", width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
              ) : null}
              <input
                value={slide.image}
                placeholder="Image address"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
                onChange={(event) => {
                  const next = slides.slice()
                  next[index] = { ...slide, image: event.target.value }
                  write(next)
                }}
              />
              <input
                value={slide.title}
                placeholder="Slide title"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
                onChange={(event) => {
                  const next = slides.slice()
                  next[index] = { ...slide, title: event.target.value }
                  write(next)
                }}
              />
              <input
                value={slide.text}
                placeholder="Short text"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
                onChange={(event) => {
                  const next = slides.slice()
                  next[index] = { ...slide, text: event.target.value }
                  write(next)
                }}
              />
              <div className="flex gap-3 text-xs text-[#8a7352]">
                <button type="button" disabled={index === 0} onClick={() => {
                  const next = slides.slice()
                  const [item] = next.splice(index, 1)
                  next.splice(index - 1, 0, item)
                  write(next)
                }}>
                  Earlier
                </button>
                <button type="button" disabled={index === slides.length - 1} onClick={() => {
                  const next = slides.slice()
                  const [item] = next.splice(index, 1)
                  next.splice(index + 1, 0, item)
                  write(next)
                }}>
                  Later
                </button>
                <button type="button" disabled={slides.length < 2} onClick={() => write(slides.filter((_, item) => item !== index))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-xs text-[#1c1916]"
          disabled={slides.length >= 8}
          onClick={() => write([...slides, { image: "", title: "New slide", text: "" }])}
        >
          Add slide
        </button>
        <div className="mt-3">{track}</div>
      </div>
    </NodeViewWrapper>
  )
}

export const PromotionSlides = Node.create({
  name: "promotionSlides",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      slides: { default: JSON.stringify(starterSlides), ...ignoredAttr },
      optionsOpen: { default: false, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "div",
        priority: 1000,
        getAttrs: (element) => {
          const el = domElement(element)
          if (!el || (!el.classList.contains("promo-slides") && !el.querySelector(".promo-slide"))) return false
          const slides = [...el.querySelectorAll(".promo-slide")].map((slide) => ({
            image: slide.querySelector("img")?.getAttribute("src") ?? "",
            title: slide.querySelector("strong")?.textContent ?? "",
            text: slide.querySelector("p")?.textContent ?? "",
          }))
          el.replaceChildren()
          return { slides: JSON.stringify(slides.length > 0 ? slides : starterSlides), optionsOpen: false }
        },
      },
    ]
  },
  renderHTML({ node }) {
    return ["div", mergeAttributes({ class: "promo-slides", style: slideTrackStyle }), ...slideNodes(parseSlides(node.attrs.slides))]
  },
  addNodeView() {
    return ReactNodeViewRenderer(SlidesView)
  },
})

function BadgeView({ node, updateAttributes }: ReactNodeViewProps) {
  const open = optionsAreOpen(node.attrs.optionsOpen)
  const text = String(node.attrs.text ?? "Sale")
  const background = String(node.attrs.backgroundColor || "#1c1916")
  const color = String(node.attrs.textColor || "#f6f3ee")
  const radius = Number(node.attrs.borderRadius) || 999
  const badge = (
    <span className="promo-badge" style={{ display: "inline-flex", alignItems: "center", background, color, borderRadius: radius, padding: "6px 12px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {text || "Sale"}
    </span>
  )
  if (!open) {
    return (
      <NodeViewWrapper as="span" className="my-2 inline-block" onMouseDown={(event) => event.stopPropagation()} onClick={() => updateAttributes({ optionsOpen: true })}>
        {badge}
      </NodeViewWrapper>
    )
  }
  return (
    <NodeViewWrapper as="span" className="my-3 block w-full">
      <div className="rounded-md border border-[#e4ddd2] bg-[#faf8f5] px-3 py-3" contentEditable={false} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.16em] text-[#8a7352] uppercase">Badge</span>
          <button type="button" className="text-xs" onClick={() => updateAttributes({ optionsOpen: false })}>Done</button>
        </div>
        <input value={text} className="mt-2 w-full bg-transparent text-sm outline-none" onChange={(event) => updateAttributes({ text: event.target.value })} />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-[#6f675f]">Background
            <input type="color" className="mt-1 block" value={/^#[0-9a-f]{6}$/i.test(background) ? background : "#1c1916"} onChange={(event) => updateAttributes({ backgroundColor: event.target.value })} />
          </label>
          <label className="text-xs text-[#6f675f]">Text
            <input type="color" className="mt-1 block" value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#f6f3ee"} onChange={(event) => updateAttributes({ textColor: event.target.value })} />
          </label>
        </div>
        <div className="mt-3">{badge}</div>
      </div>
    </NodeViewWrapper>
  )
}

export const PromotionBadge = Node.create({
  name: "promotionBadge",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      text: { default: "Sale", ...ignoredAttr },
      backgroundColor: { default: "#1c1916", ...ignoredAttr },
      textColor: { default: "#f6f3ee", ...ignoredAttr },
      borderRadius: { default: 999, ...ignoredAttr },
      optionsOpen: { default: false, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "span",
        priority: 1000,
        getAttrs: (element) => {
          const el = domElement(element)
          if (!el || !el.classList.contains("promo-badge")) return false
          const attrs = {
            text: el.textContent?.trim() || "Sale",
            backgroundColor: el.style.backgroundColor || "#1c1916",
            textColor: el.style.color || "#f6f3ee",
            borderRadius: Number.parseFloat(el.style.borderRadius) || 999,
            optionsOpen: false,
          }
          el.replaceChildren()
          return attrs
        },
      },
    ]
  },
  renderHTML({ node }) {
    const text = cleanText(node.attrs.text) || "Sale"
    const style = `display:inline-flex;align-items:center;background:${node.attrs.backgroundColor};color:${node.attrs.textColor};border-radius:${node.attrs.borderRadius}px;padding:6px 12px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;`
    return ["span", mergeAttributes({ class: "promo-badge", style }), text]
  },
  addNodeView() {
    return ReactNodeViewRenderer(BadgeView)
  },
})

function NoteView({ node, updateAttributes }: ReactNodeViewProps) {
  const open = optionsAreOpen(node.attrs.optionsOpen)
  const text = String(node.attrs.text ?? "")
  const note = (
    <div className="promo-note" style={{ borderLeft: `3px solid ${node.attrs.borderColor || "#c4a574"}`, background: String(node.attrs.backgroundColor || "#f6f3ee"), padding: "12px 14px", color: "#1c1916" }}>
      {text || "A short note"}
    </div>
  )
  if (!open) {
    return (
      <NodeViewWrapper className="my-2" onMouseDown={(event) => event.stopPropagation()} onClick={() => updateAttributes({ optionsOpen: true })}>
        {note}
      </NodeViewWrapper>
    )
  }
  return (
    <NodeViewWrapper className="my-3">
      <div className="rounded-md border border-[#e4ddd2] bg-[#faf8f5] px-3 py-3" contentEditable={false} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.16em] text-[#8a7352] uppercase">Note</span>
          <button type="button" className="text-xs" onClick={() => updateAttributes({ optionsOpen: false })}>Done</button>
        </div>
        <textarea
          value={text}
          rows={3}
          className="mt-2 w-full resize-none bg-transparent text-sm outline-none"
          onChange={(event) => updateAttributes({ text: event.target.value })}
        />
        <div className="mt-3">{note}</div>
      </div>
    </NodeViewWrapper>
  )
}

export const PromotionNote = Node.create({
  name: "promotionNote",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      text: { default: "Ends Sunday. Free delivery this weekend.", ...ignoredAttr },
      backgroundColor: { default: "#f6f3ee", ...ignoredAttr },
      borderColor: { default: "#c4a574", ...ignoredAttr },
      optionsOpen: { default: false, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "div",
        priority: 1000,
        getAttrs: (element) => {
          const el = domElement(element)
          if (!el || !el.classList.contains("promo-note")) return false
          const attrs = {
            text: el.textContent?.trim() ?? "",
            backgroundColor: el.style.backgroundColor || "#f6f3ee",
            borderColor: el.style.borderLeftColor || "#c4a574",
            optionsOpen: false,
          }
          el.replaceChildren()
          return attrs
        },
      },
    ]
  },
  renderHTML({ node }) {
    const style = `border-left:3px solid ${node.attrs.borderColor};background:${node.attrs.backgroundColor};padding:12px 14px;color:#1c1916;`
    return ["div", mergeAttributes({ class: "promo-note", style }), cleanText(node.attrs.text)]
  },
  addNodeView() {
    return ReactNodeViewRenderer(NoteView)
  },
})

function imageStyle(width: number, height: number, radius: number) {
  const size = width > 0 ? `width:${Math.round(width)}px;max-width:100%;` : "width:100%;"
  const tall = height > 0 ? `height:${Math.round(height)}px;` : "aspect-ratio:16/9;height:auto;"
  return `display:block;${size}${tall}object-fit:cover;border-radius:${Math.round(radius)}px;`
}

function ImageView({ node, updateAttributes }: ReactNodeViewProps) {
  const open = optionsAreOpen(node.attrs.optionsOpen)
  const src = safeUrl(String(node.attrs.src ?? ""))
  const alt = String(node.attrs.alt ?? "")
  const width = Number(node.attrs.width) || 0
  const height = Number(node.attrs.height) || 0
  const radius = Number(node.attrs.radius) || 0
  const [uploading, setUploading] = useState(false)
  const picture = src ? (
    <ResizableFrame width={width} height={height} onResize={(nextWidth, nextHeight) => updateAttributes({ width: nextWidth, height: nextHeight })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="promo-image" src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: radius }} />
    </ResizableFrame>
  ) : (
    <span className="text-sm text-[#8a7352]">Add an image</span>
  )

  const upload = async (file: File | undefined) => {
    if (!file) return
    const error = blogImageError(file)
    if (error) {
      toast.error(error)
      return
    }
    setUploading(true)
    try {
      const uploaded = await uploadBlogImage(file)
      if (uploaded.url) updateAttributes({ src: uploaded.url })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not upload that image."))
    } finally {
      setUploading(false)
    }
  }

  if (!open) {
    return (
      <NodeViewWrapper as="span" className="my-3 inline-block w-full align-top" onMouseDown={(event) => event.stopPropagation()} onClick={() => updateAttributes({ optionsOpen: true })}>
        {picture}
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="span" className="my-3 block w-full">
      <div className="rounded-md border border-[#e4ddd2] bg-[#faf8f5] px-3 py-3" contentEditable={false} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.16em] text-[#8a7352] uppercase">Image</span>
          <button type="button" className="text-xs" onClick={() => updateAttributes({ optionsOpen: false })}>
            Done
          </button>
        </div>
        <label className="mt-3 inline-flex cursor-pointer text-xs text-[#1c1916]">
          {uploading ? "Uploading…" : "Choose a file"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              void upload(file)
            }}
          />
        </label>
        <input
          value={String(node.attrs.src ?? "")}
          placeholder="Or paste an image address"
          className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
          onChange={(event) => updateAttributes({ src: event.target.value })}
        />
        <input
          value={alt}
          placeholder="Description"
          className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-[#b3aaa0]"
          onChange={(event) => updateAttributes({ alt: event.target.value })}
        />
        <p className="mt-3 text-xs text-[#6f675f]">Drag the edges or the corner to set the frame.</p>
        <label className="mt-2 block text-xs text-[#6f675f]">
          Corners
          <input
            type="number"
            min={0}
            value={radius || ""}
            placeholder="0"
            className="mt-1 block w-full bg-transparent text-sm text-[#1c1916] outline-none"
            onChange={(event) => updateAttributes({ radius: Number(event.target.value) || 0 })}
          />
        </label>
        <div className="mt-3">{picture}</div>
      </div>
    </NodeViewWrapper>
  )
}

export const PromotionImage = Node.create({
  name: "promotionImage",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: "", ...ignoredAttr },
      alt: { default: "", ...ignoredAttr },
      width: { default: 0, ...ignoredAttr },
      height: { default: 0, ...ignoredAttr },
      radius: { default: 0, ...ignoredAttr },
      optionsOpen: { default: false, ...ignoredAttr },
    }
  },
  parseHTML() {
    return [
      {
        tag: "img",
        priority: 1000,
        getAttrs: (element) => {
          const el = domElement(element)
          if (!el?.getAttribute("src")) return false
          const width = Number.parseFloat(el.style.width)
          return {
            src: el.getAttribute("src") ?? "",
            alt: el.getAttribute("alt") ?? "",
            width: Number.isFinite(width) && el.style.width.endsWith("px") ? width : 0,
            height: el.style.height.endsWith("px") ? Number.parseFloat(el.style.height) || 0 : 0,
            radius: Number.parseFloat(el.style.borderRadius) || 0,
            optionsOpen: false,
          }
        },
      },
      {
        tag: "p",
        priority: 1000,
        getAttrs: (element) => {
          const el = domElement(element)
          if (!el) return false
          const src = linkedAddress(el)
          if (!isImageAddress(src)) return false
          el.replaceChildren()
          return { src, alt: "", width: 0, height: 0, radius: 0, optionsOpen: false }
        },
      },
    ]
  },
  renderHTML({ node }) {
    const src = safeUrl(String(node.attrs.src ?? ""))
    if (!src) return ["span", { "data-empty-promotion": "image" }]
    const width = Number(node.attrs.width) || 0
    const height = Number(node.attrs.height) || 0
    const radius = Number(node.attrs.radius) || 0
    return ["img", mergeAttributes({ class: "promo-image", src, alt: cleanText(node.attrs.alt), style: imageStyle(width, height, radius) })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView)
  },
})
