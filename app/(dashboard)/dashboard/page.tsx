"use client"

import { Newsreader } from "next/font/google"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Plus,
  Upload,
  Eye,
  Edit,
  MoreHorizontal,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDashboardStats, useLowStockProducts } from "@/hooks/use-dashboard"
import Image from "next/image"

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
})

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

  const money = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  const statsCards = stats
    ? [
        {
          title: "Products",
          value: stats.total_products.toLocaleString(),
          change: stats.products_change_percent,
          note: "In the catalogue",
        },
        {
          title: "Completed",
          value: Number(stats.completed_orders_today).toLocaleString(),
          change: stats.completed_orders_change_percent,
          note: "Orders finished today",
        },
        {
          title: "Orders",
          value: Number(stats.total_orders_today).toLocaleString(),
          change: stats.completed_orders_change_percent,
          note: "Placed today",
        },
        {
          title: "Customers",
          value: stats.total_customers.toLocaleString(),
          change: stats.customers_change_percent,
          note: "Registered accounts",
        },
      ]
    : []

  const actions = [
    { href: "/products/add", label: "Add a product", detail: "A single item, with its own description", icon: Plus },
    { href: "/products/bulk", label: "Bulk import", detail: "Bring in a spreadsheet of products", icon: Upload },
    { href: "/orders", label: "Orders", detail: "Payments, transfers, and fulfilment", icon: ShoppingCart },
    { href: "/analytics", label: "Analytics", detail: "Revenue and how the house is moving", icon: BarChart3 },
  ]

  return (
    <div className="space-y-8 text-[#1c1916]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-[#8a7352] uppercase">{today}</p>
          <h1 className={`${display.className} mt-3 text-4xl leading-none font-normal sm:text-5xl`}>The desk</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6f675f]">Catalogue, orders, and the people buying from AlphaCom.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="h-10 rounded-none border-[#e4ddd2] bg-white px-4 text-[11px] tracking-[0.18em] text-[#1c1916] uppercase shadow-none hover:bg-[#f6f3ee]"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button asChild className="h-10 rounded-none bg-[#1c1916] px-4 text-[11px] tracking-[0.18em] text-[#f6f3ee] uppercase hover:bg-[#2a2622]">
            <Link href="/products/add">
              <Plus className="size-3.5" />
              Add product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            <div className="h-44 animate-pulse bg-[#1c1916]/90 lg:col-span-2" />
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-36 animate-pulse border border-[#e7e1d8] bg-white" />
            ))}
          </>
        ) : (
          <>
            <section className="relative overflow-hidden bg-[#12110f] p-6 text-[#f4efe6] lg:col-span-2 lg:row-span-2 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(196,165,116,0.22),transparent_55%)]" />
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div>
                  <p className="text-[11px] tracking-[0.32em] text-[#c4a574] uppercase">Revenue this month</p>
                  <p className={`${display.className} mt-4 text-5xl leading-none sm:text-6xl`}>
                    {stats ? money.format(stats.revenue_this_month) : "—"}
                  </p>
                </div>
                <p className="text-sm text-[#b7aea3]">
                  <span className={stats && stats.revenue_change_percent < 0 ? "text-[#e7b2a8]" : "text-[#e7d7b8]"}>
                    {stats ? `${stats.revenue_change_percent > 0 ? "+" : ""}${stats.revenue_change_percent}%` : "—"}
                  </span>{" "}
                  against last month
                </p>
              </div>
            </section>
            {statsCards.map((stat) => (
              <section key={stat.title} className="border border-[#e7e1d8] bg-white p-5">
                <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">{stat.title}</p>
                <p className={`${display.className} mt-3 text-4xl leading-none`}>{stat.value}</p>
                <p className="mt-4 text-xs text-[#6f675f]">
                  <span className={stat.change < 0 ? "text-[#9a3b32]" : "text-[#3f6b4a]"}>
                    {stat.change > 0 ? "+" : ""}
                    {stat.change}%
                  </span>{" "}
                  · {stat.note}
                </p>
              </section>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="border border-[#e7e1d8] bg-white">
          <header className="border-b border-[#efeae3] px-5 py-4">
            <h2 className={`${display.className} text-2xl font-normal`}>Move</h2>
          </header>
          <div>
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between gap-4 border-b border-[#efeae3] px-5 py-4 last:border-b-0 hover:bg-[#faf8f5]"
              >
                <span>
                  <span className="block text-sm font-medium">{action.label}</span>
                  <span className="mt-0.5 block text-xs text-[#6f675f]">{action.detail}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-[#8a7352] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        <section className="border border-[#e7e1d8] bg-white lg:col-span-2">
          <header className="flex items-center justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
            <div>
              <h2 className={`${display.className} text-2xl font-normal`}>Latest pieces</h2>
              <p className="mt-1 text-xs text-[#6f675f]">Newest additions to the catalogue</p>
            </div>
            <Link href="/products" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
              View all
            </Link>
          </header>
          {isLoading ? (
            <p className="px-5 py-10 text-sm text-[#6f675f]">Loading the catalogue…</p>
          ) : !stats?.recent_products || stats.recent_products.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-[#6f675f]">Nothing in the catalogue yet.</p>
              <Button asChild className="mt-4 h-10 rounded-none bg-[#1c1916] text-[11px] tracking-[0.18em] uppercase hover:bg-[#2a2622]">
                <Link href="/products/add">
                  <Plus className="size-3.5" />
                  Add product
                </Link>
              </Button>
            </div>
          ) : (
            <ul>
              {stats.recent_products.map((product) => (
                <li key={product.id} className="flex items-center gap-4 border-b border-[#efeae3] px-5 py-4 last:border-b-0">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 shrink-0 bg-[#f6f3ee] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="mt-0.5 text-xs text-[#6f675f]">{product.category || "Uncategorised"}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm">{money.format(Number(product.price))}</p>
                    <p className="mt-0.5 text-xs text-[#6f675f]">{product.stock} in stock</p>
                  </div>
                  <Badge variant={getStatusVariant(product.status)} className="hidden rounded-none capitalize md:inline-flex">
                    {product.status.replaceAll("_", " ")}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0" aria-label={`Actions for ${product.name}`}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="size-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.id}/edit`}>
                          <Edit className="size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {lowStockProducts && lowStockProducts.length > 0 ? (
        <section className="border border-[#e7e1d8] border-l-[#c4a574] border-l-2 bg-white">
          <header className="border-b border-[#efeae3] px-5 py-4">
            <h2 className={`${display.className} text-2xl font-normal`}>Running low</h2>
            <p className="mt-1 text-xs text-[#6f675f]">These pieces are close to selling through.</p>
          </header>
          <ul>
            {lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 border-b border-[#efeae3] px-5 py-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="mt-0.5 text-xs text-[#6f675f]">{product.category_name}</p>
                </div>
                <p className="shrink-0 text-sm">
                  <span className="text-[#9a3b32]">{product.stock_available}</span>
                  <span className="text-[#6f675f]"> / {product.low_stock_threshold}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
