import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  reorderBanners,
  updateBanner,
  uploadBannerImage,
} from "@/lib/api/banners"
import type { CreateBannerData, ReorderBannersPayload, UpdateBannerData } from "@/types/banner"

const getErrorMessage = (error: any, fallback: string): string => {
  const detail = error?.response?.data?.detail

  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (typeof first === "string") return first
    if (first && typeof first === "object" && typeof first.msg === "string") return first.msg
  }
  if (detail && typeof detail === "object" && typeof detail.msg === "string") return detail.msg

  return fallback
}

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  details: () => [...bannerKeys.all, "detail"] as const,
  detail: (id: string) => [...bannerKeys.details(), id] as const,
}

export const useBanners = () => {
  return useQuery({
    queryKey: bannerKeys.lists(),
    queryFn: getBanners,
  })
}

export const useBanner = (bannerId: string) => {
  return useQuery({
    queryKey: bannerKeys.detail(bannerId),
    queryFn: () => getBannerById(bannerId),
    enabled: !!bannerId,
  })
}

export const useCreateBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBannerData) => createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
      toast.success("Banner created successfully")
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to create banner"))
    },
  })
}

export const useUpdateBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bannerId, data }: { bannerId: string; data: UpdateBannerData }) => updateBanner(bannerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(variables.bannerId) })
      toast.success("Banner updated successfully")
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to update banner"))
    },
  })
}

export const useDeleteBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bannerId: string) => deleteBanner(bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
      toast.success("Banner deleted successfully")
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to delete banner"))
    },
  })
}

export const useReorderBanners = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReorderBannersPayload) => reorderBanners(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
      toast.success("Banner order updated")
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to reorder banners"))
    },
  })
}

export const useUploadBannerImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bannerId, file }: { bannerId: string; file: File }) => uploadBannerImage(bannerId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(variables.bannerId) })
      toast.success("Banner image uploaded successfully")
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to upload banner image"))
    },
  })
}
