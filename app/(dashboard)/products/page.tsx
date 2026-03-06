"use client"

import { useState, useEffect } from "react"
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
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts, useProductStats, useDownloadBulkTemplate, useDeleteProduct } from "@/hooks/use-products"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { ProductImageModal } from "@/components/product-image-modal" // Added ProductImageModal import
import { Pagination } from "@/components/pagination"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
  const searchFromUrl = searchParams.get("search") ?? ""

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [page, setPage] = useState(pageFromUrl)
  const [perPage] = useState(15)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)

  // Sync URL -> state when returning from edit or navbar search (e.g. /products?page=34 or ?search=foo)
  useEffect(() => {
    setPage(pageFromUrl)
  }, [pageFromUrl])
  useEffect(() => {
    setSearchQuery(searchFromUrl)
  }, [searchFromUrl])

  const setPageAndUpdateUrl = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams()
    params.set("page", String(newPage))
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }
  const [statusFilter, setStatusFilter] = useState<string>("all_status")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [brandFilter, setBrandFilter] = useState<string>("")
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | undefined>(undefined)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false) // Added state for image modal
  const [imageModalProductId, setImageModalProductId] = useState<string | null>(null) // Added state for product ID in image modal
  const [pageSearch, setPageSearch] = useState("")

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
    // toast.success(`${selectedProducts.length} products deleted`)
    // setSelectedProducts([])
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

  const handleManageImages = (productId: string) => {
    setImageModalProductId(productId)
    setIsImageModalOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId)
    }
  }

  const handlePageSearch = () => {
    if (!productsData) return
    const targetPage = Number(pageSearch)
    if (!Number.isFinite(targetPage) || targetPage < 1 || targetPage > productsData.pages) {
      toast.error(`Enter a page between 1 and ${productsData.pages}`)
      return
    }
    setPageAndUpdateUrl(targetPage)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={handleDownloadTemplate}
            disabled={downloadTemplate.isPending}
          >
            {downloadTemplate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download Template</span>
          </Button>
          <Link href="/products/bulk">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </Button>
          </Link>
          <Link href="/products/add">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats?.inactive_products || 0}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats?.featured_products || 0}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
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
                <SelectTrigger className="w-full sm:w-[140px]">
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
                className="w-full sm:w-[140px]"
              />

              <Input
                placeholder="Brand"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full sm:w-[140px]"
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
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">Products ({productsData?.total || 0})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">A list of all products in your catalog</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="space-y-4 min-w-[640px]">
            {/* Table Header */}
            <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg font-medium text-xs sm:text-sm">
              <div className="w-8 shrink-0">
                <Checkbox
                  checked={
                    selectedProducts.length === productsData?.data.length && (productsData?.data.length || 0) > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="w-12 sm:w-16 shrink-0">Image</div>
              <div className="flex-1 min-w-[120px]">Product</div>
              <div className="w-24 sm:w-32 shrink-0">Price</div>
              <div className="w-16 sm:w-24 shrink-0">Stock</div>
              <div className="w-20 sm:w-24 shrink-0">Status</div>
              <div className="w-20 shrink-0">Actions</div>
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
                  className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="w-8 shrink-0">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                    />
                  </div>
                  <div className="w-12 sm:w-16 shrink-0">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[120px]">
                    <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.brand && `${product.brand} • `}
                      {product.category_name || "Uncategorized"}
                    </p>
                  </div>
                 
                  <div className="w-24 sm:w-32 shrink-0">
                    <span className="font-medium text-sm">₦{Number(product.price).toLocaleString()}</span>
                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                      <p className="text-xs text-muted-foreground line-through">
                        ₦{Number(product.compare_at_price).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="w-16 sm:w-24 shrink-0">
                    <Badge variant={product.stock_available > 0 ? "default" : "destructive"}>
                      {product.stock_available}
                    </Badge>
                  </div>
                  <div className="w-20 sm:w-24 shrink-0">
                    <Badge variant={getStatusVariant(product.status)} className="capitalize text-xs">
                      {product.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="w-20 shrink-0 flex items-center gap-0.5 sm:gap-1">
                    {" "}
                    {/* Added flex container for icons */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageImages(product.id)}
                      title="Manage Images"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
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
                          <Link href={`/products/${product.id}/edit?from_page=${page}`}>
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
          </div>

          {/* Pagination */}
          {productsData && productsData.total > perPage && (
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={productsData.pages}
                  placeholder={`Go to page (1-${productsData.pages})`}
                  className="w-[160px]"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePageSearch()}
                />
                <Button variant="outline" size="sm" onClick={handlePageSearch}>
                  Go
                </Button>
              </div>
              <Pagination
                currentPage={page}
                totalPages={productsData.pages}
                totalItems={productsData.total}
                itemsPerPage={perPage}
                onPageChange={setPageAndUpdateUrl}
              />
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

      <ProductImageModal
        productId={imageModalProductId}
        open={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false)
          setImageModalProductId(null)
        }}
      />
    </div>
  )
}
