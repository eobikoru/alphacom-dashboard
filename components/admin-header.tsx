"use client"

import type React from "react"

import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export function AdminHeader() {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications] = useState([
    { id: 1, title: "Low stock alert", message: "Dell XPS 13 is running low", time: "2 min ago", type: "warning" },
    { id: 2, title: "New order", message: "Order #1234 received", time: "5 min ago", type: "info" },
    { id: 3, title: "Product updated", message: "MacBook Pro price updated", time: "10 min ago", type: "success" },
  ])

  const handleLogout = async () => {
    try {
      // TODO: Replace with your actual API endpoint
      await fetch("https://your-api-domain.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      dispatch(logout())
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Still logout locally even if API call fails
      dispatch(logout())
      toast.success("Logged out successfully")
      router.push("/login")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <div className="flex items-center space-x-4 flex-1">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-muted-foreground/20"
          />
        </form>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                <div className="flex items-center justify-between w-full">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              <span className="text-sm text-muted-foreground">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "Admin"}</span>
                {user?.role && <div className="text-xs text-muted-foreground capitalize">{user.role}</div>}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user ? `${user.firstName} ${user.lastName}` : "Admin User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || "admin@alphacom.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
