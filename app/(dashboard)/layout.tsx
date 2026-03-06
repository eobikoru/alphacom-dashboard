"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { AdminAuthGuard } from "@/components/admin-auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Mobile sidebar backdrop */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }}
          onClick={() => setSidebarOpen(false)}
        />
        <AdminSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col md:ml-64 min-h-screen">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 bg-muted/20">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
