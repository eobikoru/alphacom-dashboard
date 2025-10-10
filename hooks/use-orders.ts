import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getOrders,
  getOrderDetails,
  shipOrder,
  deliverOrder,
  cancelOrder,
  refundOrder,
  releaseExpiredReservations,
} from "@/lib/api/orders"
import type { ShipOrderRequest, CancelOrderRequest, RefundOrderRequest } from "@/types/order"
import { toast } from "sonner"

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

export const useOrders = (params?: {
  page?: number
  per_page?: number
  status?: string
  payment_status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => getOrders(params),
  })
}

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId,
  })
}

export const useShipOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: ShipOrderRequest }) => shipOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      toast.success("Order shipped successfully")
    },
    onError: () => {
      toast.error("Failed to ship order")
    },
  })
}

export const useDeliverOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => deliverOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      toast.success("Order marked as delivered")
    },
    onError: () => {
      toast.error("Failed to deliver order")
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: CancelOrderRequest }) => cancelOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      toast.success("Order cancelled successfully")
    },
    onError: () => {
      toast.error("Failed to cancel order")
    },
  })
}

export const useRefundOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: RefundOrderRequest }) => refundOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      toast.success("Order refunded successfully")
    },
    onError: () => {
      toast.error("Failed to refund order")
    },
  })
}

export const useReleaseExpiredReservations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: releaseExpiredReservations,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success(`Released ${data.cancelled_count} expired reservations`)
    },
    onError: () => {
      toast.error("Failed to release expired reservations")
    },
  })
}
