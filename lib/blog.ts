import type { BlogComment, BlogPost, BlogTag } from "@/types/blog"

export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const BLOG_IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}
const BLOG_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function blogImageError(file: File): string | null {
  if (!BLOG_IMAGE_TYPES.has(file.type)) return "Use a JPEG, PNG, or WebP image."
  if (file.size > BLOG_IMAGE_MAX_BYTES) return "Images must be 5 MB or smaller."
  return null
}

export function formatBlogDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export function toDatetimeLocal(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function isScheduledPost(post: Pick<BlogPost, "status" | "published_at">) {
  if (post.status !== "published" || !post.published_at) return false
  const time = new Date(post.published_at).getTime()
  return !Number.isNaN(time) && time > Date.now()
}

export function postStatusLabel(post: Pick<BlogPost, "status" | "published_at">) {
  if (isScheduledPost(post)) return "Scheduled"
  if (post.status === "published") return "Published"
  if (post.status === "archived") return "Archived"
  return "Draft"
}

export function tagNames(tags: BlogPost["tags"]): string[] {
  if (!Array.isArray(tags)) return []
  return tags
    .map((tag) => (typeof tag === "string" ? tag : (tag as BlogTag).name))
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
}

export function coverImageUrl(post?: Partial<BlogPost> | null): string | null {
  if (!post) return null
  const record = post as Record<string, unknown>
  const direct = [record.cover_image_url, record.cover_url, record.image_url]
  for (const value of direct) {
    if (typeof value === "string" && value) return value
  }
  const cover = record.cover_image
  if (typeof cover === "string" && cover) return cover
  if (cover && typeof cover === "object" && "url" in cover && typeof cover.url === "string") return cover.url
  return null
}

export function commentBody(comment: BlogComment) {
  const record = comment as Record<string, unknown>
  const value = comment.content ?? comment.body ?? comment.comment ?? record.text ?? record.message
  return typeof value === "string" ? value : ""
}

export function blogAuthorKey(author: { user_id?: string; id?: string }) {
  return author.user_id || author.id || ""
}

export function plainTextFromHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
