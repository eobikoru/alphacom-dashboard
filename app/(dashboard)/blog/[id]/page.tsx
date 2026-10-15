"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Pencil, Star } from "lucide-react"
import { BlogPageFrame } from "@/components/blog/blog-page-frame"
import { PostFaqs } from "@/components/blog/post-faqs"
import { useDashboardAccess } from "@/components/dashboard-access"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBlogPost } from "@/hooks/use-blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import { coverImageUrl, formatBlogDate, postStatusLabel, tagNames } from "@/lib/blog"

export default function ViewBlogPostPage() {
  const access = useDashboardAccess()
  const params = useParams<{ id: string }>()
  const id = params.id
  const postQuery = useBlogPost(access.ready && access.canManageBlog ? id : "")
  const post = postQuery.data
  const cover = coverImageUrl(post)
  const tags = tagNames(post?.tags)

  return (
    <BlogPageFrame allow={access.canManageBlog} title="Blog posts are available to blog authors and admins.">
      {postQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading post…</p> : null}
      {postQuery.isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{getApiErrorMessage(postQuery.error, "Could not open this post.")}</p>
          <Button variant="outline" asChild>
            <Link href="/blog">Back to posts</Link>
          </Button>
        </div>
      ) : null}
      {post ? (
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/blog">
                <ArrowLeft className="size-4" />
                All posts
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/blog/${post.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
          </div>

          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={post.status === "published" ? "default" : "secondary"}>{postStatusLabel(post)}</Badge>
              {post.is_featured ? (
                <Badge variant="outline" className="gap-1">
                  <Star className="size-3 fill-current" />
                  Featured
                </Badge>
              ) : null}
              {post.category?.name ? <Badge variant="outline">{post.category.name}</Badge> : null}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-sm text-muted-foreground">
              {post.author_name || "Alphacom Team"}
              {post.published_at ? ` · ${formatBlogDate(post.published_at)}` : ""}
              {post.slug ? ` · /${post.slug}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {post.view_count ?? 0} views · {post.comment_count ?? 0} comments
            </p>
          </header>

          {cover ? <img src={cover} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" /> : null}
          {post.excerpt ? <p className="text-lg text-muted-foreground">{post.excerpt}</p> : null}

          {post.content ? (
            <div className="blog-article" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-sm text-muted-foreground">This post has no body yet.</p>
          )}

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <PostFaqs postId={post.id} initialFaqs={post.faqs} />
        </article>
      ) : null}
    </BlogPageFrame>
  )
}
