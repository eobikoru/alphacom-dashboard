"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  PackagePlus,
  FolderTree,
} from "lucide-react"
import { getAdminInfo } from "@/lib/auth"
import { useDashboardStats } from "@/hooks/use-dashboard"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    current: false,
    badge: "dynamic", // Will be replaced with actual count
  },
  {
    name: "Add Product",
    href: "/products/add",
    icon: Plus,
    current: false,
  },
  {
    name: "Bulk Upload",
    href: "/products/bulk",
    icon: PackagePlus,
    current: false,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: FolderTree,
    current: false,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    current: false,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    current: false,
  },
]

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const pathname = usePathname()

  const { data: dashboardStats } = useDashboardStats()

  useEffect(() => {
    setAdminInfo(getAdminInfo())
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 fixed left-0 top-0",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-sidebar-foreground">AlphaCom</h2>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const badgeValue = item.badge === "dynamic" ? dashboardStats?.total_products : item.badge

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group relative",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("flex-shrink-0 w-4 h-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {badgeValue && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto text-xs font-semibold">
                        {badgeValue}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    {badgeValue && (
                      <span className="ml-2 px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {badgeValue}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group relative",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("flex-shrink-0 w-4 h-4", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && adminInfo && (
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-white">{adminInfo.username?.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{adminInfo.username}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{adminInfo.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
