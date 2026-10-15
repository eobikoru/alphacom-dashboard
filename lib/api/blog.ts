import api from "../axios"
import type {
  BlogAuthor,
  BlogCategory,
  BlogCategoryWrite,
  BlogComment,
  BlogFaq,
  BlogFaqWrite,
  BlogListResult,
  BlogPost,
  BlogPostStatus,
  BlogPostWrite,
  CreateBlogAuthorData,
  GetBlogCommentsParams,
  GetBlogPostsParams,
  UploadedBlogImage,
} from "@/types/blog"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>
  return null
}

function numberFrom(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "number" && !Number.isNaN(value)) return value
  }
  return undefined
}

export function normalizeList<T>(payload: unknown, keys: string[]): BlogListResult<T> {
  const root = asRecord(payload) ?? {}
  const data = root.data
  let items: T[] = []
  let meta = root

  if (Array.isArray(data)) {
    items = data as T[]
  } else if (Array.isArray(payload)) {
    items = payload as T[]
  } else {
    const nested = asRecord(data) ?? root
    meta = nested
    for (const key of keys) {
      if (Array.isArray(nested[key])) {
        items = nested[key] as T[]
        break
      }
    }
  }

  const pagination = asRecord(meta.pagination) ?? asRecord(root.pagination) ?? meta
  const per_page = numberFrom(pagination, ["per_page", "page_size"]) ?? numberFrom(root, ["per_page", "page_size"]) ?? 20
  const page = numberFrom(pagination, ["page"]) ?? numberFrom(root, ["page"]) ?? 1
  const totalValue = numberFrom(pagination, ["total", "total_count", "count"]) ?? numberFrom(root, ["total", "total_count", "count"])
  const totalKnown = totalValue !== undefined
  const total = totalValue ?? items.length
  const pages =
    numberFrom(pagination, ["pages", "total_pages"]) ??
    numberFrom(root, ["pages", "total_pages"]) ??
    Math.max(1, Math.ceil(total / Math.max(per_page, 1)))

  return { items, total, page, per_page, pages, totalKnown }
}

export function normalizeEntity<T>(payload: unknown, keys: string[]): T {
  const root = asRecord(payload) ?? {}
  const data = root.data
  const nested = asRecord(data)
  if (nested) {
    for (const key of keys) {
      const value = nested[key]
      if (value && typeof value === "object" && !Array.isArray(value)) return value as T
    }
    return nested as T
  }
  if (Array.isArray(data)) return data as T
  if (data && typeof data === "object") return data as T
  return root as T
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { status?: number; data?: { detail?: unknown; message?: unknown } } })?.response
  const detail = response?.data?.detail
  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object" && "msg" in item) return String((item as { msg: unknown }).msg)
        return ""
      })
      .filter(Boolean)
      .join(" ")
    if (text) return text
  }
  if (typeof response?.data?.message === "string" && response.data.message.trim()) return response.data.message
  if (response?.status === 403) return "You don't have permission to do that."
  return fallback
}

async function postImage(url: string, file: File) {
  const formData = new FormData()
  formData.append("image", file)
  const response = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return normalizeEntity<UploadedBlogImage>(response.data, ["image"])
}

export const getBlogPosts = async (params: GetBlogPostsParams = {}): Promise<BlogListResult<BlogPost>> => {
  const response = await api.get("/api/v1/admin/blog/posts", { params })
  return normalizeList<BlogPost>(response.data, ["posts", "items", "results"])
}

function faqsFromPayload(payload: unknown): BlogFaq[] | undefined {
  const root = asRecord(payload) ?? {}
  const data = asRecord(root.data) ?? root
  const post = asRecord(data.post)
  const candidates = [post?.faqs, data.faqs, root.faqs]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as BlogFaq[]
  }
  return undefined
}

export const getBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await api.get(`/api/v1/admin/blog/posts/${id}`)
  const post = normalizeEntity<BlogPost>(response.data, ["post"])
  if (!Array.isArray(post.faqs)) {
    const faqs = faqsFromPayload(response.data)
    if (faqs) post.faqs = faqs
  }
  return post
}

export const createBlogPost = async (data: BlogPostWrite): Promise<BlogPost> => {
  const response = await api.post("/api/v1/admin/blog/posts", data)
  return normalizeEntity<BlogPost>(response.data, ["post"])
}

export const updateBlogPost = async (id: string, data: BlogPostWrite): Promise<BlogPost> => {
  const response = await api.put(`/api/v1/admin/blog/posts/${id}`, data)
  return normalizeEntity<BlogPost>(response.data, ["post"])
}

export const deleteBlogPost = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/blog/posts/${id}`)
}

export const updateBlogPostStatus = async (id: string, status: BlogPostStatus): Promise<BlogPost> => {
  const response = await api.put(`/api/v1/admin/blog/posts/${id}/status`, { status })
  return normalizeEntity<BlogPost>(response.data, ["post"])
}

export const disableBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await api.put(`/api/v1/admin/blog/posts/${id}/disable`)
  return normalizeEntity<BlogPost>(response.data, ["post"])
}

export const enableBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await api.put(`/api/v1/admin/blog/posts/${id}/enable`)
  return normalizeEntity<BlogPost>(response.data, ["post"])
}

export const uploadBlogImage = async (file: File): Promise<UploadedBlogImage> => {
  return postImage("/api/v1/admin/blog/images", file)
}

export const uploadBlogCover = async (id: string, file: File): Promise<UploadedBlogImage> => {
  return postImage(`/api/v1/admin/blog/posts/${id}/cover-image`, file)
}

export const deleteBlogCover = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/blog/posts/${id}/cover-image`)
}

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await api.get("/api/v1/admin/blog/categories", { params: { include_inactive: true } })
  return normalizeList<BlogCategory>(response.data, ["categories", "items", "results"]).items
}

export const createBlogCategory = async (data: BlogCategoryWrite): Promise<BlogCategory> => {
  const response = await api.post("/api/v1/admin/blog/categories", data)
  return normalizeEntity<BlogCategory>(response.data, ["category"])
}

export const updateBlogCategory = async (id: string, data: BlogCategoryWrite): Promise<BlogCategory> => {
  const response = await api.put(`/api/v1/admin/blog/categories/${id}`, data)
  return normalizeEntity<BlogCategory>(response.data, ["category"])
}

export const deleteBlogCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/blog/categories/${id}`)
}

export const getBlogFaqs = async (postId: string): Promise<BlogFaq[]> => {
  const response = await api.get(`/api/v1/admin/blog/posts/${postId}/faqs`)
  return normalizeList<BlogFaq>(response.data, ["faqs", "items", "results"]).items
}

export const getBlogFaq = async (postId: string, faqId: string): Promise<BlogFaq> => {
  const response = await api.get(`/api/v1/admin/blog/posts/${postId}/faqs/${faqId}`)
  return normalizeEntity<BlogFaq>(response.data, ["faq"])
}

export const createBlogFaq = async (postId: string, data: BlogFaqWrite): Promise<BlogFaq> => {
  const response = await api.post(`/api/v1/admin/blog/posts/${postId}/faqs`, data)
  return normalizeEntity<BlogFaq>(response.data, ["faq"])
}

export const updateBlogFaq = async (postId: string, faqId: string, data: BlogFaqWrite): Promise<BlogFaq> => {
  const response = await api.put(`/api/v1/admin/blog/posts/${postId}/faqs/${faqId}`, data)
  return normalizeEntity<BlogFaq>(response.data, ["faq"])
}

export const deleteBlogFaq = async (postId: string, faqId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/blog/posts/${postId}/faqs/${faqId}`)
}

export const getBlogComments = async (params: GetBlogCommentsParams = {}): Promise<BlogListResult<BlogComment>> => {
  const response = await api.get("/api/v1/admin/blog/comments", { params })
  return normalizeList<BlogComment>(response.data, ["comments", "items", "results"])
}

export const hideBlogComment = async (id: string): Promise<void> => {
  await api.put(`/api/v1/admin/blog/comments/${id}/hide`)
}

export const unhideBlogComment = async (id: string): Promise<void> => {
  await api.put(`/api/v1/admin/blog/comments/${id}/unhide`)
}

export const deleteBlogComment = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/blog/comments/${id}`)
}

export const getBlogAuthors = async (): Promise<BlogAuthor[]> => {
  const response = await api.get("/api/v1/admin/blog/authors")
  return normalizeList<BlogAuthor>(response.data, ["authors", "items", "results"]).items
}

export const createBlogAuthor = async (data: CreateBlogAuthorData): Promise<BlogAuthor> => {
  const response = await api.post("/api/v1/admin/blog/authors", data)
  return normalizeEntity<BlogAuthor>(response.data, ["author", "user"])
}

export const updateBlogAuthorRole = async (userId: string, isBlogAuthor: boolean): Promise<void> => {
  await api.put(`/api/v1/admin/blog/authors/${userId}/role`, { is_blog_author: isBlogAuthor })
}
