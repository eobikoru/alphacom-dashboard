"use client"

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react"
import { getAdminInfo, refreshAdminInfo, type AdminInfo } from "@/lib/auth"
import { getDashboardAccess, type DashboardAccess } from "@/lib/roles"

interface DashboardAccessValue extends DashboardAccess {
  info: AdminInfo | null
  ready: boolean
}

const emptyAccess = getDashboardAccess(null)

const DashboardAccessContext = createContext<DashboardAccessValue>({
  ...emptyAccess,
  info: null,
  ready: false,
})

export function DashboardAccessProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<AdminInfo | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const cached = getAdminInfo()
    setInfo(cached)
    setReady(true)
    let cancelled = false
    refreshAdminInfo()
      .then((fresh) => {
        if (!cancelled && fresh) setInfo(fresh)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const access = getDashboardAccess(info)

  return (
    <DashboardAccessContext.Provider value={{ ...access, info, ready }}>{children}</DashboardAccessContext.Provider>
  )
}

export function useDashboardAccess() {
  return useContext(DashboardAccessContext)
}
