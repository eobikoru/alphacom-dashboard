"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MoreHorizontal, Plus, Search, Star } from "lucide-react"
import { BlogPageFrame } from "@/components/blog/blog-page-frame"
import { ListPager } from "@/components/blog/list-pager"
import { useDashboardAccess } from "@/components/dashboard-access"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBlogCategories, useBlogPostStatus, useBlogPosts, useDeleteBlogPost } from "@/hooks/use-blog"
import { coverImageUrl, formatBlogDate, postStatusLabel } from "@/lib/blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import type { BlogPost, BlogPostStatus } from "@/types/blog"

const PER_PAGE = 20

function statusVariant(post: BlogPost) {
  if (postStatusLabel(post) === "Scheduled") return "outline" as const
  if (post.status === "published") return "default" as const
  if (post.status === "archived") return "secondary" as const
  return "outline" as const
}

function BlogPostsPage() {
  const access = useDashboardAccess()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const searchFromUrl = searchParams.get("search") ?? ""
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [search, setSearch] = useState(searchFromUrl.trim())
  const [status, setStatus] = useState<BlogPostStatus | "all">("all")
  const [categoryId, setCategoryId] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setSearchInput(searchFromUrl)
  }, [searchFromUrl])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const posts = useBlogPosts(
    {
      page,
      per_page: PER_PAGE,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      category_id: categoryId === "all" ? undefined : categoryId,
    },
    access.ready && access.canManageBlog,
  )
  const categories = useBlogCategories(access.ready && access.canModerateBlog)
  const changeStatus = useBlogPostStatus()
  const deletePost = useDeleteBlogPost()

  return (
    <BlogPageFrame allow={access.canManageBlog} title="Blog posts are available to blog authors and admins.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Blog posts</h1>
            <p className="text-sm text-muted-foreground">
              {access.blogAuthorOnly ? "You can write and edit your own posts." : "Drafts, scheduled posts, and the live archive."}
            </p>
          </div>
          <Button asChild>
            <Link href="/blog/new">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search posts" className="pl-9" />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as BlogPostStatus | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {access.canModerateBlog ? (
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories.data ?? []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <Card>
          <CardContent className="pt-6">
            {posts.isLoading ? <p className="text-sm text-muted-foreground">Loading posts…</p> : null}
            {posts.isError ? <p className="text-sm text-destructive">{getApiErrorMessage(posts.error, "Could not load posts.")}</p> : null}
            {posts.data && posts.data.items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium">No posts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a draft and it will show up here.</p>
              </div>
            ) : null}
            {posts.data && posts.data.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.data.items.map((post) => {
                    const cover = coverImageUrl(post)
                    return (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-12 overflow-hidden rounded-md bg-muted">
                              {cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link href={`/blog/${post.id}`} className="truncate font-medium hover:underline">
                                  {post.title}
                                </Link>
                                {post.is_featured ? <Star className="size-3.5 fill-current text-amber-500" /> : null}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">{post.author_name || "Alphacom Team"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(post)}>{postStatusLabel(post)}</Badge>
                        </TableCell>
                        <TableCell>{post.category?.name || "—"}</TableCell>
                        <TableCell>{formatBlogDate(post.published_at)}</TableCell>
                        <TableCell className="text-right">
                          <div>{post.view_count ?? 0}</div>
                          {access.canModerateBlog ? (
                            <Link href={`/blog/comments?post_id=${post.id}`} className="text-xs text-muted-foreground hover:underline">
                              {post.comment_count ?? 0} comments
                            </Link>
                          ) : (
                            <div className="text-xs text-muted-foreground">{post.comment_count ?? 0} comments</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`Actions for ${post.title}`}>
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/blog/${post.id}`}>View</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/blog/${post.id}/edit`}>Edit</Link>
                              </DropdownMenuItem>
                              {post.status === "published" ? (
                                <DropdownMenuItem onSelect={() => changeStatus.mutate({ id: post.id, action: "draft" })}>
                                  Move to draft
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={() => changeStatus.mutate({ id: post.id, action: "enable" })}>
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {post.status === "archived" ? (
                                <DropdownMenuItem onSelect={() => changeStatus.mutate({ id: post.id, action: "draft" })}>
                                  Move to draft
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={() => changeStatus.mutate({ id: post.id, action: "disable" })}>
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteId(post.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
            <ListPager result={posts.data} page={page} perPage={PER_PAGE} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This removes the post. The action cannot be undone from the dashboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deletePost.mutate(deleteId)
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BlogPageFrame>
  )
}

export default function BlogPostsRoute() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading posts…</p>}>
      <BlogPostsPage />
    </Suspense>
  )
}
