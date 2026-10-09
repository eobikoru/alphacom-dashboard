"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { BlogPageFrame } from "@/components/blog/blog-page-frame"
import { PostForm } from "@/components/blog/post-form"
import { useDashboardAccess } from "@/components/dashboard-access"
import { Button } from "@/components/ui/button"
import { useBlogPost } from "@/hooks/use-blog"
import { getApiErrorMessage } from "@/lib/api/blog"

export default function EditBlogPostPage() {
  const access = useDashboardAccess()
  const params = useParams<{ id: string }>()
  const id = params.id
  const post = useBlogPost(access.ready && access.canManageBlog ? id : "")

  return (
    <BlogPageFrame allow={access.canManageBlog} title="Blog posts are available to blog authors and admins.">
      {post.isLoading ? <p className="text-sm text-muted-foreground">Loading post…</p> : null}
      {post.isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{getApiErrorMessage(post.error, "Could not open this post.")}</p>
          <Button variant="outline" asChild>
            <Link href="/blog">Back to posts</Link>
          </Button>
        </div>
      ) : null}
      {post.data ? <PostForm key={post.data.id} mode="edit" post={post.data} /> : null}
    </BlogPageFrame>
  )
}
