"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductBulkActions } from "@/components/product-bulk-actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Package, Plus, Upload, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: "1",
    name: "MacBook Pro 16-inch",
    sku: "MBP-16-001",
    category: "Laptops",
    brand: "Apple",
    price: 1200000,
    stock: 5,
    status: "active",
    image: "/silver-macbook-on-desk.png",
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max",
    sku: "IP15-PRO-001",
    category: "Smartphones",
    brand: "Apple",
    price: 850000,
    stock: 12,
    status: "active",
    image: "/modern-smartphone.png",
    createdAt: "2025-01-14",
  },
  {
    id: "3",
    name: "Dell XPS 13",
    sku: "DELL-XPS-001",
    category: "Laptops",
    brand: "Dell",
    price: 650000,
    stock: 0,
    status: "out_of_stock",
    image: "/dell-laptop.png",
    createdAt: "2025-01-13",
  },
  {
    id: "4",
    name: "AirPods Pro",
    sku: "APP-001",
    category: "Accessories",
    brand: "Apple",
    price: 120000,
    stock: 25,
    status: "active",
    image: "/wireless-earbuds.png",
    createdAt: "2025-01-12",
  },
]

export default function ProductsPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id))
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

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || product.status === statusFilter
      const matchesCategory = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return b.price - a.price
        case "stock":
          return b.stock - a.stock
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
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
                <p className="text-2xl font-bold">{products.length}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  {products.filter((p) => p.status === "active").length}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">{products.filter((p) => p.stock < 10).length}</p>
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
                <p className="text-2xl font-bold text-red-600">{products.filter((p) => p.stock === 0).length}</p>
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="created">Date Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
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
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>A list of all products in your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
              <div className="w-8">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
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

            {/* Product Rows */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
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
            ) : (
              filteredProducts.map((product) => (
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
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="w-32">
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <div className="w-32">
                    <span className="font-medium">₦{product.price.toLocaleString()}</span>
                  </div>
                  <div className="w-24">
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock}</Badge>
                  </div>
                  <div className="w-24">
                    <Badge variant={product.status === "active" ? "default" : "destructive"} className="capitalize">
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
