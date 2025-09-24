"use client"

import type React from "react"

interface AdminAuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  return <>{children}</>
}
