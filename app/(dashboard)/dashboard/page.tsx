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

function CountList({ entries, empty }: { entries: [string, number][]; empty: string }) {
  if (entries.length === 0) {
    return <p className="px-5 py-6 text-sm text-[#6f675f]">{empty}</p>
  }

  return (
    <ul>
      {entries.map(([key, count]) => (
        <li key={key} className="flex items-center justify-between gap-4 border-b border-[#efeae3] px-5 py-3.5 text-sm last:border-b-0">
          <span className="capitalize">{key.replaceAll("_", " ")}</span>
          <span>{count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  )
}

function StockRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-[#efeae3] px-5 py-3.5 text-sm last:border-b-0">
      <span>{label}</span>
      <span>{value.toLocaleString()}</span>
    </li>
  )
}

function JournalCount({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">{label}</p>
      <p className={`${display.className} mt-2 text-3xl leading-none`}>{value.toLocaleString()}</p>
      {detail ? <p className="mt-2 text-xs text-[#6f675f]">{detail}</p> : null}
    </div>
  )
}

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
    maximumFractionDigits: 2,
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
                <div className="space-y-1 text-sm text-[#b7aea3]">
                  <p>
                    <span className={stats && stats.revenue_change_percent < 0 ? "text-[#e7b2a8]" : "text-[#e7d7b8]"}>
                      {stats ? `${stats.revenue_change_percent > 0 ? "+" : ""}${stats.revenue_change_percent}%` : "—"}
                    </span>{" "}
                    against last month
                  </p>
                  <p>{stats ? `${stats.conversion_rate}% conversion today` : "—"}</p>
                </div>
              </div>
            </section>
            {statsCards.map((stat) => (
              <section key={stat.title} className="border border-[#e7e1d8] bg-white p-5">
                <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">{stat.title}</p>
                <p className={`${display.className} mt-3 text-4xl leading-none`}>{stat.value}</p>
                <p className="mt-4 text-xs text-[#6f675f]">
                  {"change" in stat ? (
                    <>
                      <span className={stat.change < 0 ? "text-[#9a3b32]" : "text-[#3f6b4a]"}>
                        {stat.change > 0 ? "+" : ""}
                        {stat.change}%
                      </span>{" "}
                      · {stat.note}
                    </>
                  ) : (
                    stat.note
                  )}
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

      {stats ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="border border-[#e7e1d8] bg-white">
            <header className="border-b border-[#efeae3] px-5 py-4">
              <h2 className={`${display.className} text-2xl font-normal`}>Orders</h2>
              <p className="mt-1 text-xs text-[#6f675f]">
                {stats.orders.guest_orders.toLocaleString()} guest · {stats.orders.registered_orders.toLocaleString()} registered
              </p>
            </header>
            <CountList entries={Object.entries(stats.orders.by_status)} empty="No orders in these statuses." />
          </section>

          <section className="border border-[#e7e1d8] bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
              <div>
                <h2 className={`${display.className} text-2xl font-normal`}>Payments</h2>
                <p className="mt-1 text-xs text-[#6f675f]">
                  {stats.payments.pending_transfers.orders.toLocaleString()} transfer
                  {stats.payments.pending_transfers.orders === 1 ? "" : "s"} waiting ·{" "}
                  {money.format(stats.payments.pending_transfers.amount)}
                </p>
              </div>
              <Link href="/orders" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
                Orders
              </Link>
            </header>
            <CountList entries={Object.entries(stats.payments.by_payment_status)} empty="No payments recorded." />
            <div className="border-t border-[#efeae3] px-5 py-4">
              <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">Completed this month</p>
              {Object.keys(stats.payments.completed_this_month_by_mode).length === 0 ? (
                <p className="mt-3 text-sm text-[#6f675f]">No completed payments this month.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {Object.entries(stats.payments.completed_this_month_by_mode).map(([mode, total]) => (
                    <li key={mode} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="capitalize">{mode === "unset" ? "No mode" : mode}</span>
                      <span className="text-right text-[#6f675f]">
                        {total.orders.toLocaleString()} · {money.format(total.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-[#6f675f]">
                {stats.payments.pending_paystack_orders.toLocaleString()} Paystack{" "}
                {stats.payments.pending_paystack_orders === 1 ? "order" : "orders"} still pending
              </p>
            </div>
          </section>

          <section className="border border-[#e7e1d8] bg-white">
            <header className="border-b border-[#efeae3] px-5 py-4">
              <h2 className={`${display.className} text-2xl font-normal`}>Stock</h2>
            </header>
            <ul>
              <StockRow label="Low stock" value={stats.inventory.low_stock_products} />
              <StockRow label="Out of stock" value={stats.inventory.out_of_stock_products} />
              <StockRow label="Reserved" value={stats.inventory.reserved_units} />
            </ul>
          </section>

          <section className="border border-[#e7e1d8] bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
              <div>
                <h2 className={`${display.className} text-2xl font-normal`}>Banners</h2>
                <p className="mt-1 text-xs text-[#6f675f]">Homepage</p>
              </div>
              <Link href="/banners" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
                Manage
              </Link>
            </header>
            <ul>
              <StockRow label="Active" value={stats.banners.active} />
              <StockRow label="Inactive" value={stats.banners.inactive} />
            </ul>
          </section>
        </div>
      ) : null}

      {stats ? (
        <section className="border border-[#e7e1d8] bg-white">
          <header className="flex items-start justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
            <div>
              <h2 className={`${display.className} text-2xl font-normal`}>Journal</h2>
              <p className="mt-1 text-xs text-[#6f675f]">
                {stats.blog.posts.total.toLocaleString()} posts · {stats.blog.active_categories.toLocaleString()} categories ·{" "}
                {stats.blog.authors.toLocaleString()} authors
              </p>
            </div>
            <Link href="/blog" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
              Open
            </Link>
          </header>
          <div className="grid gap-px bg-[#efeae3] sm:grid-cols-3">
            <JournalCount label="Published" value={stats.blog.posts.published} />
            <JournalCount label="Drafts" value={stats.blog.posts.draft} />
            <JournalCount label="Archived" value={stats.blog.posts.archived} />
            <JournalCount label="Comments visible" value={stats.blog.comments.visible} />
            <JournalCount label="Comments hidden" value={stats.blog.comments.hidden} />
            <JournalCount label="FAQs" value={stats.blog.faqs.active} detail={`${stats.blog.faqs.inactive.toLocaleString()} hidden`} />
          </div>
          {stats.blog.recent_posts.length > 0 ? (
            <ul className="border-t border-[#efeae3]">
              {stats.blog.recent_posts.map((post) => (
                <li key={post.id} className="border-b border-[#efeae3] last:border-b-0">
                  <Link href={`/blog/${post.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#faf8f5]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{post.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-[#6f675f]">{post.slug}</span>
                    </span>
                    <span className="shrink-0 text-xs tracking-[0.14em] text-[#8a7352] uppercase">{post.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

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
