import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createAdmin,
  getAdmins,
  getAdminDetails,
  updateAdminRole,
  deactivateAdmin,
  reactivateAdmin,
} from "@/lib/api/admins"
import type { CreateAdminData, UpdateAdminRoleData, GetAdminsParams } from "@/types/admin"
import { toast } from "sonner"

export const useAdmins = (params: GetAdminsParams = {}) => {
  return useQuery({
    queryKey: ["admins", params],
    queryFn: () => getAdmins(params),
  })
}

export const useAdmin = (adminId: string) => {
  return useQuery({
    queryKey: ["admins", adminId],
    queryFn: () => getAdminDetails(adminId),
    enabled: !!adminId,
  })
}

export const useCreateAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAdminData) => createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create admin")
    },
  })
}

export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ adminId, data }: { adminId: string; data: UpdateAdminRoleData }) => updateAdminRole(adminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin role updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update admin role")
    },
  })
}

export const useDeactivateAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ adminId, reason }: { adminId: string; reason: string }) => deactivateAdmin(adminId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin deactivated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to deactivate admin")
    },
  })
}

export const useReactivateAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ adminId, restoreSuperAdmin }: { adminId: string; restoreSuperAdmin: boolean }) =>
      reactivateAdmin(adminId, restoreSuperAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin reactivated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to reactivate admin")
    },
  })
}
