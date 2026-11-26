import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createPromotion,
  deletePromotion,
  getPromotion,
  getPromotionLeads,
  getPromotions,
  resendPromotionLead,
  updatePromotion,
} from "@/lib/api/form-promotions"
import type { PromotionLeadList, PromotionLeadQuery, PromotionWrite } from "@/types/form-promotion"
import { productKeys } from "@/hooks/use-products"

export const promotionKeys = {
  all: ["form-promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  detail: (id: string) => [...promotionKeys.all, "detail", id] as const,
  leads: () => [...promotionKeys.all, "leads"] as const,
  leadList: (params: PromotionLeadQuery) => [...promotionKeys.leads(), params] as const,
}

function errorMessage(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: unknown; message?: unknown } } })?.response?.data
  if (typeof detail?.message === "string" && detail.message.trim()) return detail.message
  const field = detail?.detail
  if (typeof field === "string" && field.trim()) return field
  if (Array.isArray(field) && field.length > 0) {
    const first = field[0] as { msg?: string } | string
    if (typeof first === "string") return first
    if (first && typeof first.msg === "string") return first.msg
  }
  return fallback
}

export const usePromotions = () => {
  return useQuery({
    queryKey: promotionKeys.lists(),
    queryFn: getPromotions,
  })
}

export const usePromotion = (promotionId: string) => {
  return useQuery({
    queryKey: promotionKeys.detail(promotionId),
    queryFn: () => getPromotion(promotionId),
    enabled: !!promotionId,
  })
}

export const usePromotionLeads = (params: PromotionLeadQuery, enabled: boolean) => {
  return useQuery({
    queryKey: promotionKeys.leadList(params),
    queryFn: () => getPromotionLeads(params),
    enabled,
  })
}

function refreshPromotions(queryClient: ReturnType<typeof useQueryClient>, promotionId?: string) {
  queryClient.invalidateQueries({ queryKey: promotionKeys.lists() })
  if (promotionId) queryClient.invalidateQueries({ queryKey: promotionKeys.detail(promotionId) })
  queryClient.invalidateQueries({ queryKey: productKeys.details() })
}

export const useCreatePromotion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PromotionWrite) => createPromotion(data),
    onSuccess: () => {
      refreshPromotions(queryClient)
      toast.success("Promotion created")
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Could not create this promotion"))
    },
  })
}

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ promotionId, data }: { promotionId: string; data: PromotionWrite }) => updatePromotion(promotionId, data),
    onSuccess: (_, variables) => {
      refreshPromotions(queryClient, variables.promotionId)
      toast.success("Promotion updated")
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Could not update this promotion"))
    },
  })
}

export const useDeletePromotion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (promotionId: string) => deletePromotion(promotionId),
    onSuccess: (_, promotionId) => {
      refreshPromotions(queryClient, promotionId)
      toast.success("Promotion deleted")
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Could not delete this promotion"))
    },
  })
}

export const useResendPromotionLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (leadId: string) => resendPromotionLead(leadId),
    onSuccess: (lead) => {
      queryClient.setQueriesData<PromotionLeadList>({ queryKey: promotionKeys.leads() }, (current) => {
        if (!current) return current
        return { ...current, data: current.data.map((item) => (item.id === lead.id ? lead : item)) }
      })
      toast.success("WhatsApp message sent again")
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Could not send that WhatsApp message again"))
    },
  })
}
