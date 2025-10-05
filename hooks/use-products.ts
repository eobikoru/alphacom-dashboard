import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getProducts,
  getProductById,
  createProduct,
  downloadBulkTemplate,
  getProductStats,
  bulkUploadProducts,
  deleteProduct,
  updateProduct,
} from "@/lib/api/products"
import type { ProductsQueryParams } from "@/types/product"
import { toast } from "sonner"

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductsQueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
}

// Get all products
export const useProducts = (params?: ProductsQueryParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
  })
}

// Get single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  })
}

// Get product statistics
export const useProductStats = () => {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: getProductStats,
  })
}

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success("Product created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create product")
    },
  })
}

// Download bulk template
export const useDownloadBulkTemplate = () => {
  return useMutation({
    mutationFn: downloadBulkTemplate,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "product_bulk_upload_template.csv"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Template downloaded successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to download template")
    },
  })
}

// Bulk upload products
export const useBulkUploadProducts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => bulkUploadProducts(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success("Products uploaded successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to upload products")
    },
  })
}

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success("Product deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete product")
    },
  })
}

// Update product mutation
export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => updateProduct(productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success("Product updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update product")
    },
  })
}
