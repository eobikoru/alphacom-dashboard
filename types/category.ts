export interface Category {
  subcategories: any
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  level: number
  sort_order: number
  is_active: boolean
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  product_count: number
  created_at: string
  updated_at: string
  direct_products?: number
  total_products?: number
  subcategory_count?: number
  is_leaf?: boolean
}

export interface CategoryTree {
  id: string
  name: string
  slug: string
  level: number
  image_url: string | null
  is_featured: boolean
  product_count: number
  children: CategoryTree[]
}

export interface CategoriesResponse {
  success: boolean
  message: string
  data: Category[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface CategoryTreeResponse {
  success: boolean
  message: string
  data: CategoryTree[]
}

export interface CategoryDetailResponse {
  success: boolean
  message: string
  data: Category
}

export interface CreateCategoryData {
  name: string
  description?: string | null
  image_url?: string | null
  sort_order?: number
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  is_featured?: boolean
}

export interface UpdateCategoryData {
  name?: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  is_featured?: boolean
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
}

export interface CreateSubcategoryData {
  name: string
  description?: string | null
  image_url?: string | null
  sort_order?: number
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
}

export interface GetCategoriesParams {
  page?: number
  per_page?: number
  include_inactive?: boolean
}

export interface GetSubcategoriesParams {
  include_inactive?: boolean
}

export interface GetCategoryProductsParams {
  category_id: string
  include_subcategories?: boolean
  page?: number
  per_page?: number
}
