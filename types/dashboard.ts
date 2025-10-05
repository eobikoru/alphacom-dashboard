export interface DashboardStats {
    total_products: number
    products_change_percent: number
    orders_today: number
    orders_change_percent: number
    total_customers: number
    customers_change_percent: number
    revenue_this_month: number
    revenue_change_percent: number
    recent_products: RecentProduct[]
  }
  
  export interface RecentProduct {
    id: string
    name: string
    price: number
    stock: number
    status: string
    category: string
    image_url: string | null
    created_at: string
  }
  
  export interface RevenueTrendData {
    date: string
    order_count: number
    total_revenue: number
  }
  
  export interface OrderStatusBreakdown {
    [status: string]: number
  }
  
  export interface LowStockProduct {
    id: string
    name: string
    sku: string
    stock_available: number
    low_stock_threshold: number
    category_name: string
    price: number
  }
  