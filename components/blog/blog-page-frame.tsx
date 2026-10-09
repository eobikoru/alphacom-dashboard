"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { useDashboardAccess } from "@/components/dashboard-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BlogPageFrame({
  allow,
  title,
  children,
}: {
  allow: boolean
  title: string
  children: ReactNode
}) {
  const access = useDashboardAccess()
  const router = useRouter()

  useEffect(() => {
    if (access.ready && !isAuthenticated()) router.replace("/login")
  }, [access.ready, router])

  if (!access.ready || !isAuthenticated()) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!allow) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>This section is locked</CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={access.canManageBlog ? "/blog" : "/dashboard"}>Back</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
