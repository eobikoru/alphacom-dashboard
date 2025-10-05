import { api } from "../axios"
import type { User, UserDetails, UsersResponse, GetUsersParams, UpdateUserStatusData } from "@/types/user"

export const getUsers = async (params: GetUsersParams = {}): Promise<UsersResponse> => {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append("page", params.page.toString())
  if (params.per_page) searchParams.append("per_page", params.per_page.toString())
  if (params.search) searchParams.append("search", params.search)
  if (params.is_admin !== undefined) searchParams.append("is_admin", params.is_admin.toString())

  const { data } = await api.get(`/api/v1/users?${searchParams.toString()}`)
  return data.data
}

export const getUserDetails = async (userId: string): Promise<UserDetails> => {
  const { data } = await api.get(`/api/v1/users/${userId}`)
  return data.data
}

export const updateUserStatus = async (userId: string, data: UpdateUserStatusData): Promise<User> => {
  const response = await api.put(`/api/v1/users/${userId}/status`, data)
  return response.data.data
}
