export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  cloudinary_public_id: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ListBannersResponse {
  success?: boolean
  message?: string
  data?: Banner[]
}

export interface CreateBannerData {
  title: string
  subtitle?: string
  link_url?: string
  is_active: boolean
}

export interface UpdateBannerData {
  title?: string
  subtitle?: string
  link_url?: string
  is_active?: boolean
}

export interface ReorderBannersPayload {
  banners: Array<{
    id: string
    sort_order: number
  }>
}
