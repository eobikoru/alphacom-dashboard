export type BlogPostStatus = "draft" | "published" | "archived"

export interface BlogCategoryRef {
  id: string
  name: string
  slug: string
}

export interface BlogTag {
  name: string
  slug?: string
}

export interface BlogPost {
  id: string
  title: string
  content: string
  status: BlogPostStatus
  published_at?: string | null
  excerpt?: string | null
  slug?: string
  author_name?: string | null
  author_id?: string
  category_id?: string | null
  category?: BlogCategoryRef | null
  tags?: Array<BlogTag | string>
  is_featured?: boolean
  meta_title?: string | null
  meta_description?: string | null
  cover_image_url?: string | null
  cover_image_public_id?: string | null
  view_count?: number
  comment_count?: number
  faqs?: BlogFaq[]
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface BlogPostWrite {
  title?: string
  content?: string
  status?: BlogPostStatus
  published_at?: string | null
  excerpt?: string
  slug?: string
  author_name?: string
  category_id?: string | null
  tags?: string[]
  is_featured?: boolean
  meta_title?: string
  meta_description?: string
}

export interface GetBlogPostsParams {
  page?: number
  per_page?: number
  status?: BlogPostStatus
  search?: string
  category_id?: string
}

export interface BlogCategory {
  id: string
  name: string
  slug?: string
  description?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface BlogCategoryWrite {
  name?: string
  slug?: string
  description?: string
  is_active?: boolean
  sort_order?: number
}

export interface BlogFaq {
  id: string
  question: string
  answer: string
  is_active?: boolean
  sort_order?: number | null
  created_at?: string
  updated_at?: string
}

export interface BlogFaqWrite {
  question?: string
  answer?: string
  is_active?: boolean
  sort_order?: number
}

export interface BlogComment {
  id: string
  post_id?: string
  post_title?: string
  author_name?: string | null
  author_email?: string | null
  ip_address?: string | null
  is_hidden?: boolean
  content?: string
  body?: string
  comment?: string
  created_at?: string
  [key: string]: unknown
}

export interface GetBlogCommentsParams {
  page?: number
  per_page?: number
  post_id?: string
  include_hidden?: boolean
}

export interface BlogAuthor {
  id?: string
  user_id?: string
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  is_blog_author?: boolean
  created_at?: string
}

export interface CreateBlogAuthorData {
  username: string
  email: string
  password: string
}

export interface BlogListResult<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
  totalKnown: boolean
}

export interface UploadedBlogImage {
  url: string
  public_id: string
}
