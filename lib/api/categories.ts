import api from "../axios"
import type {
  Category,
  CategoriesResponse,
  CategoryTreeResponse,
  CreateCategoryData,
  UpdateCategoryData,
  CreateSubcategoryData,
  GetCategoriesParams,
  GetSubcategoriesParams,
  GetCategoryProductsParams,
} from "@/types/category"
import type { ProductsResponse } from "@/types/product"

// Main Categories
export const getCategories = async (params?: GetCategoriesParams): Promise<CategoriesResponse> => {
  const response = await api.get("/api/v1/admin/categories", { params })
  return response.data
}

export const getCategoryTree = async (): Promise<CategoryTreeResponse> => {
  const response = await api.get("/api/v1/admin/categories/tree")
  return response.data
}

export const getCategoryById = async (categoryId: string): Promise<Category> => {
  const response = await api.get(`/api/v1/admin/categories/${categoryId}`)
  return response.data
}

export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  const response = await api.post("/api/v1/admin/categories", data)
  return response.data
}

export const updateCategory = async (categoryId: string, data: UpdateCategoryData): Promise<Category> => {
  const response = await api.put(`/api/v1/admin/categories/${categoryId}`, data)
  return response.data
}

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/categories/${categoryId}`)
}

export const uploadCategoryImage = async (categoryId: string, file: File): Promise<{ image_url: string }> => {
  const formData = new FormData()
  formData.append("image", file)
  const response = await api.post(`/api/v1/admin/categories/${categoryId}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const getCategoryProducts = async (params: GetCategoryProductsParams): Promise<ProductsResponse> => {
  const { category_id, ...queryParams } = params
  const response = await api.get(`/api/v1/admin/categories/${category_id}/products`, {
    params: queryParams,
  })
  return response.data
}

// Subcategories
export const createSubcategory = async (parentId: string, data: CreateSubcategoryData): Promise<Category> => {
  const response = await api.post(`/api/v1/admin/categories/${parentId}/subcategories`, data)
  return response.data
}

export const getSubcategories = async (parentId: string, params?: GetSubcategoriesParams): Promise<Category[]> => {
  const response = await api.get(`/api/v1/admin/categories/${parentId}/subcategories`, { params })
  return response.data
}

export const getSubcategoryById = async (subcategoryId: string): Promise<Category> => {
  const response = await api.get(`/api/v1/admin/subcategories/${subcategoryId}`)
  return response.data
}

export const updateSubcategory = async (subcategoryId: string, data: UpdateCategoryData): Promise<Category> => {
  const response = await api.put(`/api/v1/admin/subcategories/${subcategoryId}`, data)
  return response.data
}

export const deleteSubcategory = async (subcategoryId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/subcategories/${subcategoryId}`)
}
