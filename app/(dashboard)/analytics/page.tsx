"use client"

import { Newsreader } from "next/font/google"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { RefreshCw } from "lucide-react"
import { useDashboardStats, useLowStockProducts, useRevenueTrend } from "@/hooks/use-dashboard"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
})

const ranges = [7, 30, 90] as const

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
})

function axisMoney(value: number) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ""
  if (Math.abs(amount) >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`
  if (Math.abs(amount) >= 1_000) return `₦${Math.round(amount / 1_000)}k`
  return `₦${Math.round(amount)}`
}

function shortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function modeLabel(mode: string) {
  if (mode === "unset") return "No mode"
  return mode.replaceAll("_", " ")
}

function TrendChart({
  data,
  dataKey,
  stroke,
  formatAxis,
  formatValue,
}: {
  data: { date: string; total_revenue: number; order_count: number }[]
  dataKey: "total_revenue" | "order_count"
  stroke: string
  formatAxis: (value: number) => string
  formatValue: (value: number) => string
}) {
  const fillId = `trend-${dataKey}`

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e7e1d8" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            minTickGap={32}
            tick={{ fill: "#6f675f", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={58}
            allowDecimals={dataKey !== "order_count"}
            tickFormatter={(value) => formatAxis(Number(value))}
            tick={{ fill: "#6f675f", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke, strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="border border-[#e4ddd2] bg-[#12110f] px-3 py-2 text-[#f4efe6]">
                  <p className="text-[11px] tracking-[0.16em] text-[#c4a574] uppercase">{shortDate(String(label))}</p>
                  <p className={`${display.className} mt-1 text-lg`}>{formatValue(Number(payload[0].value))}</p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${fillId})`}
            activeDot={{ r: 4, fill: stroke, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CountList({ entries, empty }: { entries: [string, number][]; empty: string }) {
  if (entries.length === 0) {
    return <p className="px-5 py-6 text-sm text-[#6f675f]">{empty}</p>
  }

  return (
    <ul>
      {entries.map(([key, count]) => (
        <li key={key} className="flex items-center justify-between gap-4 border-b border-[#efeae3] px-5 py-3.5 text-sm capitalize last:border-b-0">
          <span>{key.replaceAll("_", " ")}</span>
          <span>{count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  )
}

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<number>(30)

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: revenueTrend, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueTrend(timeRange)
  const { data: lowStockProducts, isLoading: lowStockLoading, refetch: refetchLowStock } = useLowStockProducts(5)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchStats(), refetchRevenue(), refetchLowStock()])
    setRefreshing(false)
  }

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
  const orderStatuses = Object.entries(stats?.orders.by_status ?? {})
  const paymentStatuses = Object.entries(stats?.payments.by_payment_status ?? {})
  const paymentModes = Object.entries(stats?.payments.completed_this_month_by_mode ?? {}).map(([mode, total]) => ({
    mode: modeLabel(mode),
    orders: total.orders,
    revenue: total.revenue,
  }))
  const trend = revenueTrend ?? []

  const figures = stats
    ? [
        { title: "Products", value: stats.total_products.toLocaleString(), change: stats.products_change_percent, note: "In the catalogue" },
        { title: "Completed", value: stats.completed_orders_today.toLocaleString(), change: stats.completed_orders_change_percent, note: "Orders finished today" },
        { title: "Orders", value: stats.total_orders_today.toLocaleString(), note: "Placed today" },
        { title: "Customers", value: stats.total_customers.toLocaleString(), change: stats.customers_change_percent, note: "Registered accounts" },
      ]
    : []

  return (
    <div className="space-y-8 text-[#1c1916]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-[#8a7352] uppercase">{today}</p>
          <h1 className={`${display.className} mt-3 text-4xl leading-none font-normal sm:text-5xl`}>The figures</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6f675f]">Revenue, payments, stock, and the journal, from the live desk.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-[#e4ddd2] bg-white">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={timeRange === range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "h-10 px-3 text-[11px] tracking-[0.16em] uppercase",
                  timeRange === range ? "bg-[#1c1916] text-[#f6f3ee]" : "text-[#6f675f] hover:bg-[#f6f3ee]",
                )}
              >
                {range} days
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || statsLoading || revenueLoading}
            className="h-10 rounded-none border-[#e4ddd2] bg-white px-4 text-[11px] tracking-[0.18em] text-[#1c1916] uppercase shadow-none hover:bg-[#f6f3ee]"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {statsLoading ? (
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
            {figures.map((figure) => (
              <section key={figure.title} className="border border-[#e7e1d8] bg-white p-5">
                <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">{figure.title}</p>
                <p className={`${display.className} mt-3 text-4xl leading-none`}>{figure.value}</p>
                <p className="mt-4 text-xs text-[#6f675f]">
                  {"change" in figure ? (
                    <>
                      <span className={figure.change < 0 ? "text-[#9a3b32]" : "text-[#3f6b4a]"}>
                        {figure.change > 0 ? "+" : ""}
                        {figure.change}%
                      </span>{" "}
                      · {figure.note}
                    </>
                  ) : (
                    figure.note
                  )}
                </p>
              </section>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-[#e7e1d8] bg-white">
          <header className="border-b border-[#efeae3] px-5 py-4">
            <h2 className={`${display.className} text-2xl font-normal`}>Revenue</h2>
            <p className="mt-1 text-xs text-[#6f675f]">
              {trend.length > 0 ? `${money.format(trend.reduce((sum, day) => sum + Number(day.total_revenue || 0), 0))} · ` : ""}
              the last {timeRange} days
            </p>
          </header>
          <div className="px-2 py-4 sm:px-3">
            {revenueLoading ? (
              <div className="h-[300px] animate-pulse bg-[#f6f3ee]" />
            ) : trend.length === 0 ? (
              <p className="px-3 py-16 text-sm text-[#6f675f]">No revenue in this range.</p>
            ) : (
              <TrendChart
                data={trend}
                dataKey="total_revenue"
                stroke="#8a6232"
                formatAxis={axisMoney}
                formatValue={(value) => money.format(value)}
              />
            )}
          </div>
        </section>

        <section className="border border-[#e7e1d8] bg-white">
          <header className="border-b border-[#efeae3] px-5 py-4">
            <h2 className={`${display.className} text-2xl font-normal`}>Orders over time</h2>
            <p className="mt-1 text-xs text-[#6f675f]">
              {trend.length > 0
                ? `${trend.reduce((sum, day) => sum + Number(day.order_count || 0), 0).toLocaleString()} orders · `
                : ""}
              the last {timeRange} days
            </p>
          </header>
          <div className="px-2 py-4 sm:px-3">
            {revenueLoading ? (
              <div className="h-[300px] animate-pulse bg-[#f6f3ee]" />
            ) : trend.length === 0 ? (
              <p className="px-3 py-16 text-sm text-[#6f675f]">No orders in this range.</p>
            ) : (
              <TrendChart
                data={trend}
                dataKey="order_count"
                stroke="#1c1916"
                formatAxis={(value) => Math.round(value).toLocaleString()}
                formatValue={(value) => `${Math.round(value).toLocaleString()} orders`}
              />
            )}
          </div>
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
            {orderStatuses.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6f675f]">No orders in these statuses.</p>
            ) : (
              <div className="px-3 py-4">
                <ChartContainer config={{ count: { label: "Orders", color: "#1c1916" } }} className="h-[240px] w-full aspect-auto">
                  <BarChart data={orderStatuses.map(([status, count]) => ({ status: status.replaceAll("_", " "), count }))} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#efeae3" vertical={false} />
                    <XAxis dataKey="status" tick={{ fill: "#8a7352", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fill: "#8a7352", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#1c1916" radius={0} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </section>

          <section className="border border-[#e7e1d8] bg-white">
            <header className="border-b border-[#efeae3] px-5 py-4">
              <h2 className={`${display.className} text-2xl font-normal`}>Payments</h2>
              <p className="mt-1 text-xs text-[#6f675f]">
                {stats.payments.pending_transfers.orders.toLocaleString()} transfer
                {stats.payments.pending_transfers.orders === 1 ? "" : "s"} waiting · {money.format(stats.payments.pending_transfers.amount)}
              </p>
            </header>
            <CountList entries={paymentStatuses} empty="No payments recorded." />
            <div className="border-t border-[#efeae3] px-5 py-4">
              <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">Completed this month</p>
              {paymentModes.length === 0 ? (
                <p className="mt-3 text-sm text-[#6f675f]">No completed payments this month.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {paymentModes.map((mode) => (
                    <li key={mode.mode} className="flex items-baseline justify-between gap-4 text-sm capitalize">
                      <span>{mode.mode}</span>
                      <span className="text-right text-[#6f675f]">
                        {mode.orders.toLocaleString()} · {money.format(mode.revenue)}
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
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-[#e7e1d8] bg-white">
          <header className="border-b border-[#efeae3] px-5 py-4">
            <h2 className={`${display.className} text-2xl font-normal`}>Stock</h2>
            {stats ? (
              <p className="mt-1 text-xs text-[#6f675f]">
                {stats.inventory.low_stock_products.toLocaleString()} low · {stats.inventory.out_of_stock_products.toLocaleString()} out ·{" "}
                {stats.inventory.reserved_units.toLocaleString()} reserved
              </p>
            ) : null}
          </header>
          {lowStockLoading ? (
            <p className="px-5 py-10 text-sm text-[#6f675f]">Loading stock…</p>
          ) : lowStockProducts && lowStockProducts.length > 0 ? (
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
          ) : (
            <p className="px-5 py-10 text-sm text-[#6f675f]">Nothing is running low.</p>
          )}
        </section>

        <section className="border border-[#e7e1d8] bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
            <div>
              <h2 className={`${display.className} text-2xl font-normal`}>Latest pieces</h2>
              <p className="mt-1 text-xs text-[#6f675f]">Newest additions to the catalogue</p>
            </div>
            <Link href="/products" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
              View all
            </Link>
          </header>
          {statsLoading ? (
            <p className="px-5 py-10 text-sm text-[#6f675f]">Loading the catalogue…</p>
          ) : !stats?.recent_products.length ? (
            <p className="px-5 py-10 text-sm text-[#6f675f]">Nothing in the catalogue yet.</p>
          ) : (
            <ul>
              {stats.recent_products.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <Link href={`/products/${product.id}`} className="flex items-center gap-4 border-b border-[#efeae3] px-5 py-4 last:border-b-0 hover:bg-[#faf8f5]">
                    <Image src={product.image_url || "/placeholder.svg"} alt="" width={48} height={48} className="size-12 shrink-0 bg-[#f6f3ee] object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{product.name}</span>
                      <span className="mt-0.5 block text-xs text-[#6f675f]">{product.category || "Uncategorised"}</span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block">{money.format(product.price)}</span>
                      <span className="mt-0.5 block text-xs text-[#6f675f]">{product.stock} in stock</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {stats ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="border border-[#e7e1d8] bg-white lg:col-span-2">
            <header className="flex items-start justify-between gap-3 border-b border-[#efeae3] px-5 py-4">
              <div>
                <h2 className={`${display.className} text-2xl font-normal`}>Journal</h2>
                <p className="mt-1 text-xs text-[#6f675f]">
                  {stats.blog.posts.total.toLocaleString()} posts · {stats.blog.active_categories.toLocaleString()} categories · {stats.blog.authors.toLocaleString()} authors
                </p>
              </div>
              <Link href="/blog" className="text-[11px] tracking-[0.18em] text-[#8a7352] uppercase hover:text-[#1c1916]">
                Open
              </Link>
            </header>
            <div className="grid gap-px bg-[#efeae3] sm:grid-cols-3">
              {[
                ["Published", stats.blog.posts.published],
                ["Drafts", stats.blog.posts.draft],
                ["Archived", stats.blog.posts.archived],
                ["Comments visible", stats.blog.comments.visible],
                ["Comments hidden", stats.blog.comments.hidden],
                ["FAQs active", stats.blog.faqs.active],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-white px-5 py-4">
                  <p className="text-[11px] tracking-[0.22em] text-[#8a7352] uppercase">{label}</p>
                  <p className={`${display.className} mt-2 text-3xl leading-none`}>{Number(value).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {stats.blog.faqs.inactive > 0 ? (
              <p className="border-t border-[#efeae3] px-5 py-3 text-xs text-[#6f675f]">{stats.blog.faqs.inactive.toLocaleString()} hidden FAQs</p>
            ) : null}
            {stats.blog.recent_posts.length > 0 ? (
              <ul className="border-t border-[#efeae3]">
                {stats.blog.recent_posts.map((post) => (
                  <li key={post.id} className="border-b border-[#efeae3] last:border-b-0">
                    <Link href={`/blog/${post.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#faf8f5]">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{post.title}</span>
                        <span className="mt-0.5 block text-xs text-[#6f675f]">{shortDate(post.created_at)}</span>
                      </span>
                      <span className="shrink-0 text-xs tracking-[0.14em] text-[#8a7352] uppercase">{post.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
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
              <li className="flex items-center justify-between border-b border-[#efeae3] px-5 py-4 text-sm">
                <span>Active</span>
                <span>{stats.banners.active.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between px-5 py-4 text-sm">
                <span>Inactive</span>
                <span>{stats.banners.inactive.toLocaleString()}</span>
              </li>
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  )
}
