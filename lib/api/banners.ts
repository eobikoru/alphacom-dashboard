import api from "../axios"
import type { Banner, CreateBannerData, ListBannersResponse, ReorderBannersPayload, UpdateBannerData } from "@/types/banner"

const normalizeBannerList = (payload: ListBannersResponse | Banner[]): Banner[] => {
  if (Array.isArray(payload)) return payload
  return payload.data ?? []
}

export const getBanners = async (): Promise<Banner[]> => {
  const response = await api.get("/api/v1/admin/banners")
  return normalizeBannerList(response.data)
}

export const getBannerById = async (bannerId: string): Promise<Banner> => {
  const response = await api.get(`/api/v1/admin/banners/${bannerId}`)
  const payload = response.data
  return payload?.data ?? payload
}

export const createBanner = async (data: CreateBannerData): Promise<Banner> => {
  const response = await api.post("/api/v1/admin/banners", data)
  const payload = response.data
  return payload?.data ?? payload
}

export const updateBanner = async (bannerId: string, data: UpdateBannerData): Promise<Banner> => {
  const response = await api.put(`/api/v1/admin/banners/${bannerId}`, data)
  const payload = response.data
  return payload?.data ?? payload
}

export const deleteBanner = async (bannerId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/banners/${bannerId}`)
}

export const reorderBanners = async (payload: ReorderBannersPayload): Promise<void> => {
  await api.put("/api/v1/admin/banners/reorder", payload)
}

export const uploadBannerImage = async (bannerId: string, file: File): Promise<Banner> => {
  const formData = new FormData()
  formData.append("image", file)

  const response = await api.post(`/api/v1/admin/banners/${bannerId}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  const payload = response.data
  return payload?.data ?? payload
}
