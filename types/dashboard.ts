export interface DashboardStats {
  total_products: number
  products_change_percent: number
  completed_orders_today: number
  completed_orders_change_percent: number
  total_orders_today: number
  total_customers: number
  customers_change_percent: number
  revenue_this_month: number
  revenue_change_percent: number
  conversion_rate: number
  recent_products: RecentProduct[]
  payments: DashboardPayments
  inventory: DashboardInventory
  blog: DashboardBlog
  banners: DashboardBanners
  orders: DashboardOrders
}

export interface ModeRevenue {
  orders: number
  revenue: number
}

export interface DashboardPayments {
  by_payment_status: Record<string, number>
  completed_this_month_by_mode: Record<string, ModeRevenue>
  pending_transfers: {
    orders: number
    amount: number
  }
  pending_paystack_orders: number
}

export interface DashboardInventory {
  low_stock_products: number
  out_of_stock_products: number
  reserved_units: number
}

export interface DashboardBlog {
  posts: {
    draft: number
    published: number
    archived: number
    total: number
  }
  comments: {
    visible: number
    hidden: number
  }
  faqs: {
    active: number
    inactive: number
  }
  active_categories: number
  authors: number
  recent_posts: RecentBlogPost[]
}

export interface RecentBlogPost {
  id: string
  title: string
  slug: string
  status: string
  created_at: string
}

export interface DashboardBanners {
  active: number
  inactive: number
}

export interface DashboardOrders {
  by_status: Record<string, number>
  guest_orders: number
  registered_orders: number
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
