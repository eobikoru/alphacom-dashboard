import { api } from "../axios"
import type { DashboardStats, RevenueTrendData, OrderStatusBreakdown, LowStockProduct } from "@/types/dashboard"

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/api/v1/dashboard/stats")
  return data.data
}

export const getRevenueTrend = async (days = 30): Promise<RevenueTrendData[]> => {
  const { data } = await api.get(`/api/v1/dashboard/revenue-trend?days=${days}`)
  return data.data
}

export const getOrderStatusBreakdown = async (): Promise<OrderStatusBreakdown> => {
  const { data } = await api.get("/api/v1/dashboard/order-status-breakdown")
  return data.data
}

export const getLowStockProducts = async (limit = 10): Promise<LowStockProduct[]> => {
  const { data } = await api.get(`/api/v1/dashboard/low-stock-products?limit=${limit}`)
  return data.data
}
