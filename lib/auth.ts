import axiosInstance from "./axios"

export interface AdminInfo {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  department: string
  is_super_admin: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  admin_info: AdminInfo
}

export const loginAdmin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/api/v1/auth/login", credentials)
  return response.data
}

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
}

export const setAdminInfo = (adminInfo: AdminInfo) => {
  localStorage.setItem("admin_info", JSON.stringify(adminInfo))
}

export const getAdminInfo = (): AdminInfo | null => {
  const adminInfo = localStorage.getItem("admin_info")
  return adminInfo ? JSON.parse(adminInfo) : null
}

export const logoutAdmin = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("admin_info")
}

export const clearAuthData = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("admin_info")
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token")
}
