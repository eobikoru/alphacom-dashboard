"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BlogPageFrame } from "@/components/blog/blog-page-frame"
import { ListPager } from "@/components/blog/list-pager"
import { useDashboardAccess } from "@/components/dashboard-access"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBlogComments, useBlogPosts, useDeleteBlogComment, useHideBlogComment, useUnhideBlogComment } from "@/hooks/use-blog"
import { commentBody, formatBlogDate } from "@/lib/blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import type { BlogComment } from "@/types/blog"

const PER_PAGE = 20

function BlogCommentsPage() {
  const access = useDashboardAccess()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [postId, setPostId] = useState(searchParams.get("post_id") || "all")
  const [includeHidden, setIncludeHidden] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<BlogComment | null>(null)
  const allowed = access.ready && access.canModerateBlog

  const posts = useBlogPosts({ page: 1, per_page: 50 }, allowed)
  const comments = useBlogComments(
    {
      page,
      per_page: PER_PAGE,
      include_hidden: includeHidden,
      post_id: postId === "all" ? undefined : postId,
    },
    allowed,
  )
  const hide = useHideBlogComment()
  const unhide = useUnhideBlogComment()
  const remove = useDeleteBlogComment()

  return (
    <BlogPageFrame allow={access.canModerateBlog} title="Comment moderation is for admins.">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground">Hidden comments stay out of the public post. Hiding one that is already hidden is rejected.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="space-y-2 md:w-80">
            <Label>Post</Label>
            <Select
              value={postId}
              onValueChange={(value) => {
                setPostId(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All posts</SelectItem>
                {postId !== "all" && !(posts.data?.items ?? []).some((post) => post.id === postId) ? (
                  <SelectItem value={postId}>Selected post</SelectItem>
                ) : null}
                {(posts.data?.items ?? []).map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Switch
              id="include-hidden"
              checked={includeHidden}
              onCheckedChange={(checked) => {
                setIncludeHidden(checked)
                setPage(1)
              }}
            />
            <Label htmlFor="include-hidden">Show hidden comments</Label>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {comments.isLoading ? <p className="text-sm text-muted-foreground">Loading comments…</p> : null}
            {comments.isError ? (
              <p className="text-sm text-destructive">{getApiErrorMessage(comments.error, "Could not load comments.")}</p>
            ) : null}
            {comments.data && comments.data.items.length === 0 ? <p className="text-sm text-muted-foreground">No comments match this filter.</p> : null}
            {comments.data && comments.data.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comment</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.data.items.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-md whitespace-normal">
                        <p className="line-clamp-3">{commentBody(comment) || "—"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {comment.post_title || comment.post_id || "Post"} · {formatBlogDate(comment.created_at)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div>{comment.author_name || "Reader"}</div>
                        <div className="text-xs text-muted-foreground">{comment.author_email || "—"}</div>
                        <div className="text-xs text-muted-foreground">{comment.ip_address || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={comment.is_hidden ? "secondary" : "default"}>{comment.is_hidden ? "Hidden" : "Visible"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {comment.is_hidden ? (
                            <Button size="sm" variant="outline" disabled={unhide.isPending} onClick={() => unhide.mutate(comment.id)}>
                              Unhide
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled={hide.isPending} onClick={() => hide.mutate(comment.id)}>
                              Hide
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(comment)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
            <ListPager result={comments.data} page={page} perPage={PER_PAGE} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>The comment is removed rather than hidden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) remove.mutate(deleteTarget.id)
                setDeleteTarget(null)
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

export default function BlogCommentsRoute() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading comments…</p>}>
      <BlogCommentsPage />
    </Suspense>
  )
}
