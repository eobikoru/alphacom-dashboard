import axiosInstance from "./axios"

export interface AdminInfo {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  department: string
  is_admin?: boolean
  is_super_admin: boolean
  is_blog_author?: boolean
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

function pickAdminInfo(value: unknown): Partial<AdminInfo> | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (record.admin_info && typeof record.admin_info === "object") return record.admin_info as Partial<AdminInfo>
  if ("data" in record) return pickAdminInfo(record.data)
  if ("username" in record || "email" in record || "is_admin" in record || "is_blog_author" in record) {
    return record as Partial<AdminInfo>
  }
  return null
}

export const refreshAdminInfo = async (): Promise<AdminInfo | null> => {
  const response = await axiosInstance.get("/api/v1/auth/me")
  const raw = pickAdminInfo(response.data)
  if (!raw) return getAdminInfo()

  const current = getAdminInfo()
  const next: AdminInfo = {
    id: raw.id ?? current?.id ?? "",
    username: raw.username ?? current?.username ?? "",
    email: raw.email ?? current?.email ?? "",
    first_name: raw.first_name ?? current?.first_name ?? "",
    last_name: raw.last_name ?? current?.last_name ?? "",
    department: raw.department ?? current?.department ?? "",
    is_admin: Boolean(raw.is_admin ?? current?.is_admin),
    is_super_admin: Boolean(raw.is_super_admin ?? current?.is_super_admin),
    is_blog_author: Boolean(raw.is_blog_author ?? current?.is_blog_author),
  }
  setAdminInfo(next)
  return next
}
