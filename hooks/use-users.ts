import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUsers, getUserDetails, updateUserStatus } from "@/lib/api/users"
import type { GetUsersParams, UpdateUserStatusData } from "@/types/user"
import { toast } from "sonner"

export const useUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  })
}

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserDetails(userId),
    enabled: !!userId,
  })
}

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserStatusData }) => updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user status")
    },
  })
}
