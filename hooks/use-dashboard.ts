import { useQuery } from "@tanstack/react-query"
import { getDashboardStats, getRevenueTrend, getOrderStatusBreakdown, getLowStockProducts } from "@/lib/api/dashboard"

export const useDashboardStats = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    enabled,
  })
}

export const useRevenueTrend = (days = 30) => {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", days],
    queryFn: () => getRevenueTrend(days),
  })
}

export const useOrderStatusBreakdown = () => {
  return useQuery({
    queryKey: ["dashboard", "order-status"],
    queryFn: getOrderStatusBreakdown,
  })
}

export const useLowStockProducts = (limit = 10) => {
  return useQuery({
    queryKey: ["dashboard", "low-stock", limit],
    queryFn: () => getLowStockProducts(limit),
  })
}
