"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductBulkActions } from "@/components/product-bulk-actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Package,
  Plus,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Download,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts, useProductStats, useDownloadBulkTemplate, useDeleteProduct } from "@/hooks/use-products"
import { ProductDetailModal } from "@/components/product-detail-modal"

export default function ProductsPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all_status")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [brandFilter, setBrandFilter] = useState<string>("")
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | undefined>(undefined)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useProducts({
    page,
    per_page: perPage,
    search: searchQuery || undefined,
    status: statusFilter === "all_status" ? undefined : statusFilter,
    category_id: categoryFilter || undefined,
    brand: brandFilter || undefined,
    is_featured: isFeaturedFilter,
    include_inactive: includeInactive,
  })

  const { data: stats } = useProductStats()

  const downloadTemplate = useDownloadBulkTemplate()

  const deleteProductMutation = useDeleteProduct()

  const handleSelectAll = (checked: boolean) => {
    if (checked && productsData?.data) {
      setSelectedProducts(productsData.data.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleBulkDelete = () => {
    toast.success(`${selectedProducts.length} products deleted`)
    setSelectedProducts([])
  }

  const handleBulkStatusChange = (status: string) => {
    toast.success(`${selectedProducts.length} products updated to ${status}`)
    setSelectedProducts([])
  }

  const handleDownloadTemplate = () => {
    downloadTemplate.mutate()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "out_of_stock":
        return "destructive"
      case "coming_soon":
        return "secondary"
      case "discontinued":
        return "outline"
      default:
        return "default"
    }
  }

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId)
    setIsDetailModalOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2 bg-transparent"
            onClick={handleDownloadTemplate}
            disabled={downloadTemplate.isPending}
          >
            {downloadTemplate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Template</span>
          </Button>
          <Link href="/products/bulk">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Upload className="w-4 h-4" />
              <span>Bulk Upload</span>
            </Button>
          </Link>
          <Link href="/products/add">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_products || 0}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats?.active_products || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats?.low_stock || 0}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats?.out_of_stock || 0}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_status">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Category ID"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-[140px]"
              />

              <Input
                placeholder="Brand"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-[140px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-transparent"
                onClick={() => setIncludeInactive(!includeInactive)}
              >
                <Filter className="w-4 h-4" />
                <span>{includeInactive ? "Hide Inactive" : "Show Inactive"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <ProductBulkActions
          selectedCount={selectedProducts.length}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
        />
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({productsData?.total || 0})</CardTitle>
          <CardDescription>A list of all products in your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
              <div className="w-8">
                <Checkbox
                  checked={
                    selectedProducts.length === productsData?.data.length && (productsData?.data.length || 0) > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="w-16">Image</div>
              <div className="flex-1">Product</div>
              <div className="w-32">Category</div>
              <div className="w-32">Price</div>
              <div className="w-24">Stock</div>
              <div className="w-24">Status</div>
              <div className="w-16">Actions</div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Error loading products</h3>
                <p className="text-muted-foreground mb-4">{error?.message || "Something went wrong"}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!productsData?.data || productsData.data.length === 0) && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all_status" || categoryFilter || brandFilter
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"}
                </p>
                <Link href="/products/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            )}

            {/* Product Rows */}
            {!isLoading &&
              !isError &&
              productsData?.data &&
              productsData.data.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="w-8">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                    />
                  </div>
                  <div className="w-16">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.brand && `${product.brand} • `}
                      {product.category_name || "Uncategorized"}
                    </p>
                  </div>
                  <div className="w-32">
                    <Badge variant="outline">{product.category_name || "N/A"}</Badge>
                  </div>
                  <div className="w-32">
                    <span className="font-medium">₦{Number(product.price).toLocaleString()}</span>
                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                      <p className="text-xs text-muted-foreground line-through">
                        ₦{Number(product.compare_at_price).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="w-24">
                    <Badge variant={product.stock_available > 0 ? "default" : "destructive"}>
                      {product.stock_available}
                    </Badge>
                  </div>
                  <div className="w-24">
                    <Badge variant={getStatusVariant(product.status)} className="capitalize">
                      {product.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="w-16">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>

          {/* Pagination */}
          {productsData && productsData.total > perPage && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, productsData.total)} of{" "}
                {productsData.total} products
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {productsData.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === productsData.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={selectedProductId}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedProductId(null)
        }}
      />
    </div>
  )
}
