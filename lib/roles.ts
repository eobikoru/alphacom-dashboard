export interface RoleFlags {
  is_admin?: boolean
  is_super_admin?: boolean
  is_blog_author?: boolean
}

export interface DashboardAccess {
  isSuperAdmin: boolean
  isAdmin: boolean
  isBlogAuthor: boolean
  blogAuthorOnly: boolean
  canManageBlog: boolean
  canModerateBlog: boolean
  canManageBlogAuthors: boolean
}

export function getDashboardAccess(info: RoleFlags | null | undefined): DashboardAccess {
  const isSuperAdmin = Boolean(info?.is_super_admin)
  const isAdmin = Boolean(info?.is_admin) || isSuperAdmin
  const isBlogAuthor = Boolean(info?.is_blog_author)
  const blogAuthorOnly = isBlogAuthor && !isAdmin

  return {
    isSuperAdmin,
    isAdmin,
    isBlogAuthor,
    blogAuthorOnly,
    canManageBlog: isAdmin || isBlogAuthor,
    canModerateBlog: isAdmin,
    canManageBlogAuthors: isSuperAdmin,
  }
}

const blockedAuthorPaths = ["/blog/categories", "/blog/comments", "/blog/authors"]

export function blogAuthorCanVisit(pathname: string) {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true
  if (blockedAuthorPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return false
  return pathname === "/blog" || pathname.startsWith("/blog/")
}
