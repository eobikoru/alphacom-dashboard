"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleHelp, MessageSquare, Newspaper, Tags, UserPlus, type LucideIcon } from "lucide-react"
import { useDashboardAccess } from "@/components/dashboard-access"
import { cn } from "@/lib/utils"

interface BlogTab {
  name: string
  href: string
  icon: LucideIcon
  active: (pathname: string) => boolean
}

function isPostsPath(pathname: string) {
  return (
    pathname === "/blog" ||
    pathname === "/blog/new" ||
    (pathname.startsWith("/blog/") &&
      !pathname.startsWith("/blog/categories") &&
      !pathname.startsWith("/blog/comments") &&
      !pathname.startsWith("/blog/faqs") &&
      !pathname.startsWith("/blog/authors"))
  )
}

export function BlogShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const access = useDashboardAccess()

  const tabs: BlogTab[] = [
    { name: "Posts", href: "/blog", icon: Newspaper, active: isPostsPath },
    ...(access.canModerateBlog
      ? [
          {
            name: "Categories",
            href: "/blog/categories",
            icon: Tags,
            active: (path: string) => path.startsWith("/blog/categories"),
          },
          {
            name: "Comments",
            href: "/blog/comments",
            icon: MessageSquare,
            active: (path: string) => path.startsWith("/blog/comments"),
          },
          {
            name: "FAQs",
            href: "/blog/faqs",
            icon: CircleHelp,
            active: (path: string) => path.startsWith("/blog/faqs"),
          },
        ]
      : []),
    ...(access.canManageBlogAuthors
      ? [
          {
            name: "Authors",
            href: "/blog/authors",
            icon: UserPlus,
            active: (path: string) => path.startsWith("/blog/authors"),
          },
        ]
      : []),
  ]

  if (tabs.length < 2) return <>{children}</>

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <nav aria-label="Blog sections" className="md:sticky md:top-6 md:w-48 md:shrink-0">
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1.5 md:flex-col">
          {tabs.map((tab) => {
            const active = tab.active(pathname)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.name}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
