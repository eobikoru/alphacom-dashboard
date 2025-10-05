export interface User {
    id: string
    username: string
    email: string
    is_active: boolean
    is_admin: boolean
    is_super_admin: boolean
    created_at: string
    updated_at: string
  }
  
  export interface UserDetails extends User {
    order_stats: {
      registered: OrderStats
      guest: OrderStats
    }
  }
  
  export interface OrderStats {
    total_orders: number
    total_spent: number
    last_order_date: string | null
    order_breakdown: Record<string, number>
  }
  
  export interface UsersResponse {
    items: User[]
    total: number
    page: number
    per_page: number
    pages: number
  }
  
  export interface GetUsersParams {
    page?: number
    per_page?: number
    search?: string
    is_admin?: boolean
  }
  
  export interface UpdateUserStatusData {
    is_active: boolean
  }
  