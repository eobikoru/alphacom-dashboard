"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Upload,
  Eye,
  Edit,
  MoreHorizontal,
  RefreshCw,
  TrendingDown,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDashboardStats, useLowStockProducts } from "@/hooks/use-dashboard"
import Image from "next/image"

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: stats, isLoading, refetch } = useDashboardStats()
  const { data: lowStockProducts } = useLowStockProducts(5)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
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

  const statsCards = stats
    ? [
        {
          title: "Total Products",
          value: stats.total_products.toString(),
          change: `${stats.products_change_percent > 0 ? "+" : ""}${stats.products_change_percent}%`,
          changeType: stats.products_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: Package,
          description: "Active products in catalog",
        },
        {
          title: "Completed Orders",
          value: stats.completed_orders_today.toString(),
          change: `${stats.completed_orders_change_percent > 0 ? "+" : ""}${stats.completed_orders_change_percent}%`,
          changeType: stats.completed_orders_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: ShoppingCart,
          description: "Completed orders today",
        },
        {
          title: "Total Orders",
          value: stats.total_orders_today.toString(),
          change: `${stats.completed_orders_change_percent > 0 ? "+" : ""}${stats.completed_orders_change_percent}%`,
          changeType: stats.completed_orders_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: BarChart3,
          description: "All orders today",
        },
        {
          title: "Total Customers",
          value: stats.total_customers.toString(),
          change: `${stats.customers_change_percent > 0 ? "+" : ""}${stats.customers_change_percent}%`,
          changeType: stats.customers_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: Users,
          description: "Registered customers",
        },
        {
          title: "Revenue",
          value: `₦${(stats.revenue_this_month / 1000).toFixed(1)}K`,
          change: `${stats.revenue_change_percent > 0 ? "+" : ""}${stats.revenue_change_percent}%`,
          changeType: stats.revenue_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: TrendingUp,
          description: "This month's revenue",
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-transparent"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span>Refresh</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((stat) => (
              <Card key={stat.title} className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "flex items-center",
                        stat.changeType === "positive" ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span>from last month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions and Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/products/add" className="block">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/products/bulk" className="block">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </Link>
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/analytics" className="block">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Recent Products</CardTitle>
                <CardDescription>Latest products added to your catalog</CardDescription>
              </div>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading products...</p>
              </div>
            ) : !stats?.recent_products || stats.recent_products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No products found</p>
                <Link href="/products/add">
                  <Button size="sm" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-card-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-card-foreground">₦{Number(product.price).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <Badge variant={getStatusVariant(product.status)} className="capitalize">
                        {product.status.replace("_", " ")}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="bg-card border-border border-orange-500/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-card-foreground">Low Stock Alert</CardTitle>
            </div>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                >
                  <div>
                    <h4 className="font-medium text-card-foreground">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.category_name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {product.stock_available} / {product.low_stock_threshold}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Stock remaining</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
