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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Total Products",
    value: "124",
    change: "+12%",
    changeType: "positive" as const,
    icon: Package,
    description: "Active products in catalog",
  },
  {
    title: "Orders Today",
    value: "23",
    change: "+5%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "New orders received",
  },
  {
    title: "Total Customers",
    value: "1,429",
    change: "+18%",
    changeType: "positive" as const,
    icon: Users,
    description: "Registered customers",
  },
  {
    title: "Revenue",
    value: "₦2.4M",
    change: "+23%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "This month's revenue",
  },
]

const recentProducts = [
  {
    id: 1,
    name: "MacBook Pro 16-inch",
    category: "Laptops",
    price: "₦1,200,000",
    stock: 5,
    status: "active",
    image: "/silver-macbook-on-desk.png",
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    category: "Smartphones",
    price: "₦850,000",
    stock: 12,
    status: "active",
    image: "/modern-smartphone.png",
  },
  {
    id: 3,
    name: "Dell XPS 13",
    category: "Laptops",
    price: "₦650,000",
    stock: 0,
    status: "out_of_stock",
    image: "/dell-laptop.png",
  },
  {
    id: 4,
    name: "AirPods Pro",
    category: "Accessories",
    price: "₦120,000",
    stock: 25,
    status: "active",
    image: "/wireless-earbuds.png",
  },
]

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    // setRefreshing(true)
    // // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    // setRefreshing(false)
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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

      {/* Quick Actions Section */}
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
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-card-foreground">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-card-foreground">{product.price}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                    <Badge variant={product.status === "active" ? "default" : "destructive"} className="capitalize">
                      {product.status.replace("_", " ")}
                    </Badge>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
