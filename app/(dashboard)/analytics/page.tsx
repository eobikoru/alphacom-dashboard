"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  ShoppingCart,
  Users,
  MousePointerClick,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
} from "lucide-react"
import { useDashboardStats, useRevenueTrend, useOrderStatusBreakdown, useLowStockProducts } from "@/hooks/use-dashboard"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<number>(30)

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: revenueTrend, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueTrend(timeRange)
  const {
    data: orderStatusData,
    isLoading: orderStatusLoading,
    refetch: refetchOrderStatus,
  } = useOrderStatusBreakdown()
  const { data: lowStockProducts, isLoading: lowStockLoading, refetch: refetchLowStock } = useLowStockProducts(5)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchStats(), refetchRevenue(), refetchOrderStatus(), refetchLowStock()])
    setRefreshing(false)
  }

  const overviewMetrics = stats
    ? [
        {
          title: "Total Revenue",
          value: `₦${(stats.revenue_this_month / 1000).toFixed(1)}K`,
          change: `${stats.revenue_change_percent > 0 ? "+" : ""}${stats.revenue_change_percent}%`,
          changeType: stats.revenue_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: DollarSign,
          description: "This month",
        },
        {
          title: "Total Orders",
          value: stats.total_orders_today.toString(),
          change: `${stats.completed_orders_change_percent > 0 ? "+" : ""}${stats.completed_orders_change_percent}%`,
          changeType: stats.completed_orders_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: ShoppingCart,
          description: "Today",
        },
        {
          title: "Total Customers",
          value: stats.total_customers.toString(),
          change: `${stats.customers_change_percent > 0 ? "+" : ""}${stats.customers_change_percent}%`,
          changeType: stats.customers_change_percent >= 0 ? ("positive" as const) : ("negative" as const),
          icon: Users,
          description: "Active users",
        },
        {
          title: "Conversion Rate",
          value: `${stats.conversion_rate.toFixed(2)}%`,
          change: "+0.5%",
          changeType: "positive" as const,
          icon: MousePointerClick,
          description: "Last 30 days",
        },
      ]
    : []

  const orderStatusChartData = orderStatusData
    ? Object.entries(orderStatusData).map(([status, count], index) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your store's performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Tabs value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
            <TabsList>
              <TabsTrigger value="7">7 Days</TabsTrigger>
              <TabsTrigger value="30">30 Days</TabsTrigger>
              <TabsTrigger value="90">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          : overviewMetrics.map((metric) => (
              <Card key={metric.title} className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">{metric.title}</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <metric.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{metric.value}</div>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <span
                      className={cn(
                        "flex items-center font-medium",
                        metric.changeType === "positive" ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {metric.changeType === "positive" ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer
                config={{
                  total_revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="total_revenue"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatusLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer
                config={{
                  count: {
                    label: "Orders",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {orderStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Products</CardTitle>
            <CardDescription>Latest products added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recent_products.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-card-foreground">₦{product.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-orange-500" />
                      <div>
                        <h4 className="font-medium text-card-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        {product.stock_available} left
                      </p>
                      <p className="text-xs text-muted-foreground">Threshold: {product.low_stock_threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All products are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Over Time */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Orders Over Time</CardTitle>
          <CardDescription>Order volume trends</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer
              config={{
                order_count: {
                  label: "Orders",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="order_count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
