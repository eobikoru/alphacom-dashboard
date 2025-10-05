import { api } from "../axios"
import type { Admin, CreateAdminData, UpdateAdminRoleData, GetAdminsParams } from "@/types/admin"

export const createAdmin = async (data: CreateAdminData): Promise<Admin> => {
  const response = await api.post("/api/v1/admins/create-admin", data)
  return response.data.data
}

export const getAdmins = async (params: GetAdminsParams = {}): Promise<Admin[]> => {
  const searchParams = new URLSearchParams()

  if (params.include_deactivated !== undefined) {
    searchParams.append("include_deactivated", params.include_deactivated.toString())
  }
  if (params.include_self !== undefined) {
    searchParams.append("include_self", params.include_self.toString())
  }

  const { data } = await api.get(`/api/v1/admins?${searchParams.toString()}`)
  return data.data
}

export const getAdminDetails = async (adminId: string): Promise<Admin> => {
  const { data } = await api.get(`/api/v1/admins/${adminId}`)
  return data.data
}

export const updateAdminRole = async (adminId: string, data: UpdateAdminRoleData): Promise<Admin> => {
  const { data: response } = await api.put(`/api/v1/admins/${adminId}/role`, data)
  return response.data
}

export const deactivateAdmin = async (adminId: string, reason: string): Promise<Admin> => {
  const { data } = await api.put(`/api/v1/admins/${adminId}/deactivate?reason=${encodeURIComponent(reason)}`)
  return data.data
}

export const reactivateAdmin = async (adminId: string, restoreSuperAdmin = false): Promise<Admin> => {
  const { data } = await api.put(`/api/v1/admins/${adminId}/reactivate?restore_super_admin=${restoreSuperAdmin}`)
  return data.data
}
