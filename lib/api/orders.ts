import { api } from "../axios"
import type {
  OrderDetails,
  OrdersResponse,
  ShipOrderRequest,
  CancelOrderRequest,
  RefundOrderRequest,
  ReleaseExpiredResponse,
} from "@/types/order"

export const getOrders = async (params?: {
  page?: number
  per_page?: number
  status?: string
  payment_status?: string
  search?: string
}): Promise<OrdersResponse> => {
  const { data } = await api.get("/api/v1/orders", { params })
  return data.data
}

export const getOrderDetails = async (orderId: string): Promise<OrderDetails> => {
  const { data } = await api.get(`/api/v1/orders/${orderId}`)
  return data.data || data
}

export const shipOrder = async (orderId: string, requestData: ShipOrderRequest): Promise<OrderDetails> => {
  const { data } = await api.put(`/api/v1/orders/${orderId}/ship`, requestData)
  return data.data
}

export const deliverOrder = async (orderId: string): Promise<OrderDetails> => {
  const { data } = await api.put(`/api/v1/orders/${orderId}/deliver`)
  return data.data
}

export const cancelOrder = async (orderId: string, requestData: CancelOrderRequest): Promise<OrderDetails> => {
  const { data } = await api.put(`/api/v1/orders/${orderId}/cancel`, requestData)
  return data.data
}

export const refundOrder = async (orderId: string, requestData: RefundOrderRequest): Promise<OrderDetails> => {
  const { data } = await api.post(`/api/v1/orders/${orderId}/refund`, requestData)
  return data.data
}

export const releaseExpiredReservations = async (): Promise<ReleaseExpiredResponse> => {
  const { data } = await api.post("/api/v1/orders/release-expired")
  return data
}
