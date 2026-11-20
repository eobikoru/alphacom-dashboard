export interface PromotionProduct {
  id: string
  name: string
}

export interface Promotion {
  id: string
  title: string
  html: string
  product_ids: string[]
  is_active: boolean
  products: PromotionProduct[]
  created_at?: string
  updated_at?: string
}

export interface PromotionWrite {
  title: string
  html: string
  product_ids: string[]
  is_active: boolean
}
