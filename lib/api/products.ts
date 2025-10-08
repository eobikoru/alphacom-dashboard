import { api } from "../axios"
import type { ProductsResponse, ProductDetailResponse, ProductsQueryParams, ProductStats } from "@/types/product"

// Get all products with query parameters
export const getProducts = async (params?: ProductsQueryParams): Promise<ProductsResponse> => {
  const { data } = await api.get("/api/v1/admin/products", { params })
  return data
}

// Get single product by ID
export const getProductById = async (productId: string): Promise<ProductDetailResponse> => {
  const { data } = await api.get(`/api/v1/admin/products/${productId}`)
  return data
}

// Create a new product
export const createProduct = async (formData: FormData): Promise<ProductDetailResponse> => {
  const { data } = await api.post("/api/v1/admin/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}

// Download bulk upload template
export const downloadBulkTemplate = async (): Promise<{ blob: Blob; filename: string }> => {
  const response = await api.get("/api/v1/admin/products/bulk/template", {
    responseType: "blob",
  })

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers["content-disposition"]
  let filename = "template.xlsx" // fallback filename

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "")
    }
  }

  return { blob: response.data, filename }
}

// Get product statistics
export const getProductStats = async (): Promise<ProductStats> => {
  const { data } = await api.get("/api/v1/admin/products/stats/overview")
  return data
}

// Bulk upload products
export const bulkUploadProducts = async (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post("/api/v1/admin/products/bulk/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/products/${productId}`)
}

// Update a product
export const updateProduct = async (productId: string, formData: FormData): Promise<ProductDetailResponse> => {
  const { data } = await api.put(`/api/v1/admin/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}

// Delete a product image
export const deleteProductImage = async (productId: string, publicId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/products/${productId}/images/${publicId}`)
}

// Add product images
export const addProductImages = async (productId: string, images: File[]): Promise<ProductDetailResponse> => {
  const formData = new FormData()
  images.forEach((image) => {
    formData.append("images", image)
  })

  const { data } = await api.put(`/api/v1/admin/products/${productId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}
