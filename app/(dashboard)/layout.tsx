"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { DashboardAccessProvider, useDashboardAccess } from "@/components/dashboard-access"
import { blogAuthorCanVisit } from "@/lib/roles"
import { usePathname, useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardShell({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const access = useDashboardAccess()
  const pathname = usePathname()
  const router = useRouter()
  const blocked = access.ready && access.blogAuthorOnly && !blogAuthorCanVisit(pathname)

  useEffect(() => {
    if (!access.ready || !access.blogAuthorOnly) return
    if (!blogAuthorCanVisit(pathname)) router.replace("/blog")
  }, [access.ready, access.blogAuthorOnly, pathname, router])

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
          <main className="flex-1 p-4 sm:p-6 bg-muted/20">{blocked ? null : children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardAccessProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAccessProvider>
  )
}
