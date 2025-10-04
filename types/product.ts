export interface ProductImage {
    url: string
    public_id: string
    is_primary: boolean
    alt_text: string
    sort_order: number
  }
  
  export interface Product {
    id: string
    name: string
    sku: string
    slug: string
    brand: string | null
    price: number
    cost_price: number | null
    compare_at_price: number | null
    profit_margin: number
    discount_percentage: number
    category_id: string
    category_name: string
    description: string | null
    status: "available" | "coming_soon" | "discontinued" | "out_of_stock"
    is_active: boolean
    is_featured: boolean
    show_discount: boolean
    stock_available: number
    stock_reserved: number
    is_low_stock: boolean
    is_out_of_stock: boolean
    images: ProductImage[]
    tags: string | null
    created_at: string
    updated_at: string
  }
  
  export interface ProductsResponse {
    success: boolean
    message: string
    data: Product[]
    total: number
    page: number
    per_page: number
    pages: number
  }
  
  export interface ProductDetailResponse {
    weight: any
    id: string
    name: string
    sku: string
    slug: string
    brand: string | null
    price: number
    cost_price: number | null
    compare_at_price: number | null
    profit_margin: number
    discount_percentage: number
    category_id: string
    category_name: string
    description: string | null
    status: "available" | "coming_soon" | "discontinued" | "out_of_stock"
    is_active: boolean
    is_featured: boolean
    show_discount: boolean
    stock_available: number
    stock_reserved: number
    is_low_stock: boolean
    is_out_of_stock: boolean
    images: ProductImage[]
    tags: string | null
    created_at: string
    updated_at: string
  }
  
  export interface ProductsQueryParams {
    page?: number
    per_page?: number
    category_id?: string | null
    brand?: string | null
    status?: string | null
    is_featured?: boolean | null
    search?: string | null
    include_inactive?: boolean
  }
  
  export interface CreateProductData {
    name: string
    category_id: string
    price: number | string
    initial_stock: number
    brand?: string | null
    cost_price?: number | string | null
    compare_at_price?: number | string | null
    description?: string | null
    status: "available" | "coming_soon" | "discontinued" | "out_of_stock"
    is_active: boolean
    is_featured: boolean
    show_discount: boolean
    tags?: string | null
    images?: string[] | null
  }
  
  export interface ProductStats {
    total_products: number
    active_products: number
    inactive_products: number
    featured_products: number
    out_of_stock: number
    low_stock: number
    uncategorized: number
    total_value: number
  }
  