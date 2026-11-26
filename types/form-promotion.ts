export interface PromotionProduct {
  id: string
  name: string
  sku?: string
  slug?: string
}

export interface Promotion {
  id: string
  title: string
  html: string
  video_url: string
  video_embed_url: string
  video_type: string
  whatsapp_message: string
  product_ids: string[]
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  products: PromotionProduct[]
  created_at?: string
  updated_at?: string
}

export interface PromotionWrite {
  title?: string | null
  html?: string | null
  video_url?: string | null
  whatsapp_message?: string | null
  product_ids?: string[]
  is_active?: boolean
  starts_at?: string | null
  ends_at?: string | null
}

export interface PromotionLead {
  id: string
  promotion_id: string
  promotion_title: string
  name: string
  phone: string
  email: string | null
  address: string | null
  note: string | null
  whatsapp_status: string
  whatsapp_error: string | null
  sent_at: string | null
  created_at: string | null
}

export interface PromotionLeadList {
  data: PromotionLead[]
  total: number
  page: number
  per_page: number
}

export interface PromotionLeadQuery {
  page: number
  per_page: number
  promotion_id?: string
}
