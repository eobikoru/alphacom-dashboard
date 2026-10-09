"use client"

import { BlogPageFrame } from "@/components/blog/blog-page-frame"
import { PostForm } from "@/components/blog/post-form"
import { useDashboardAccess } from "@/components/dashboard-access"

export default function NewBlogPostPage() {
  const access = useDashboardAccess()

  return (
    <BlogPageFrame allow={access.canManageBlog} title="Blog posts are available to blog authors and admins.">
      <PostForm mode="create" />
    </BlogPageFrame>
  )
}
