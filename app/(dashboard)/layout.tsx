"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { AdminAuthGuard } from "@/components/admin-auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <AdminHeader />
            <main className="flex-1 p-6 bg-muted/20">{children}</main>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
