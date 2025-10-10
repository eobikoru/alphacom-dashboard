export type OrderStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "shipped"
  | "delivered"
  | "cancelled"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "partially_refunded"

export interface ShippingAddress {
  street: string
  city: string
  state: string
  country: string
  postal_code: string | null
  phone: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_attributes: Record<string, any> | null
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  customer_email: string
  customer_name: string
  customer_phone: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  tracking_number: string | null
  shipping_method: string | null
  created_at: string
  updated_at: string
}

export interface OrderDetails extends Order {
  shipping_address: ShippingAddress
  items: OrderItem[]
  notes: string | null
}

export interface OrdersResponse {
  orders: Order[]
  pagination: {
    total: number
    page: number
    per_page: number
    pages: number
  }
}

export interface ShipOrderRequest {
  tracking_number?: string
  shipping_method: string
  notes?: string
}

export interface CancelOrderRequest {
  reason: string
}

export interface RefundOrderRequest {
  reason: string
  amount?: number | null
}

export interface ReleaseExpiredResponse {
  cancelled_count: number
  cancelled_orders: string[]
  failed_count: number
  timestamp: string
}
