import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getCategoryProducts,
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/api/categories"
import type {
  GetCategoriesParams,
  CreateCategoryData,
  UpdateCategoryData,
  CreateSubcategoryData,
  GetSubcategoriesParams,
  GetCategoryProductsParams,
} from "@/types/category"

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: GetCategoriesParams) => [...categoryKeys.lists(), params] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  subcategories: (parentId: string) => [...categoryKeys.all, "subcategories", parentId] as const,
  products: (categoryId: string) => [...categoryKeys.all, "products", categoryId] as const,
}

// Get all categories
export const useCategories = (params?: GetCategoriesParams) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
  })
}

// Get category tree
export const useCategoryTree = () => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: getCategoryTree,
  })
}

// Get single category
export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => getCategoryById(categoryId),
    enabled: !!categoryId,
  })
}

// Get subcategories
export const useSubcategories = (parentId: string, params?: GetSubcategoriesParams) => {
  return useQuery({
    queryKey: categoryKeys.subcategories(parentId),
    queryFn: () => getSubcategories(parentId, params),
    enabled: !!parentId,
  })
}

// Get subcategory details
export const useSubcategory = (subcategoryId: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(subcategoryId),
    queryFn: () => getSubcategoryById(subcategoryId),
    enabled: !!subcategoryId,
  })
}

// Get category products
export const useCategoryProducts = (params: GetCategoryProductsParams) => {
  return useQuery({
    queryKey: categoryKeys.products(params.category_id),
    queryFn: () => getCategoryProducts(params),
    enabled: !!params.category_id,
  })
}

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryData) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      toast.success("Category created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create category")
    },
  })
}

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryData }) =>
      updateCategory(categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.categoryId) })
      toast.success("Category updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update category")
    },
  })
}

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      toast.success("Category deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete category")
    },
  })
}

// Upload category image
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, file }: { categoryId: string; file: File }) => uploadCategoryImage(categoryId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.categoryId) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Image uploaded successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to upload image")
    },
  })
}

// Create subcategory
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: CreateSubcategoryData }) =>
      createSubcategory(parentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.subcategories(variables.parentId) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Subcategory created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create subcategory")
    },
  })
}

// Update subcategory
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subcategoryId, data }: { subcategoryId: string; data: UpdateCategoryData }) =>
      updateSubcategory(subcategoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.subcategoryId) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Subcategory updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update subcategory")
    },
  })
}

// Delete subcategory
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subcategoryId: string) => deleteSubcategory(subcategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Subcategory deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete subcategory")
    },
  })
}
