"use client"

import { useState } from "react"
import { Eye, EyeOff, Plus } from "lucide-react"
import { toast } from "sonner"
import { BlogPageFrame } from "@/components/blog/blog-page-frame"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBlogAuthors, useCreateBlogAuthor, useUpdateBlogAuthorRole } from "@/hooks/use-blog"
import { blogAuthorKey } from "@/lib/blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import type { BlogAuthor } from "@/types/blog"

export default function BlogAuthorsPage() {
  const access = useDashboardAccess()
  const authors = useBlogAuthors(access.ready && access.canManageBlogAuthors)
  const createAuthor = useCreateBlogAuthor()
  const updateRole = useUpdateBlogAuthorRole()
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [pending, setPending] = useState<{ author: BlogAuthor; next: boolean } | null>(null)

  const save = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Username and email are required.")
      return
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    try {
      await createAuthor.mutateAsync({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setForm({ username: "", email: "", password: "" })
      setOpen(false)
    } catch {
      // The mutation hook already reports the failure.
    }
  }

  return (
    <BlogPageFrame allow={access.canManageBlogAuthors} title="Only a super admin can add or remove blog authors.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Blog authors</h1>
            <p className="text-sm text-muted-foreground">Authors can write their own posts and upload images. They do not see the rest of the dashboard.</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New author
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {authors.isLoading ? <p className="text-sm text-muted-foreground">Loading authors…</p> : null}
            {authors.isError ? <p className="text-sm text-destructive">{getApiErrorMessage(authors.error, "Could not load authors.")}</p> : null}
            {authors.data && authors.data.length === 0 ? <p className="text-sm text-muted-foreground">No blog authors yet.</p> : null}
            {authors.data && authors.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Blog author</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.data.map((author) => {
                    const id = blogAuthorKey(author)
                    const active = author.is_blog_author !== false
                    const name = [author.first_name, author.last_name].filter(Boolean).join(" ")
                    return (
                      <TableRow key={id || author.email}>
                        <TableCell>
                          <div className="font-medium">{author.username || name || "Author"}</div>
                          {name && author.username ? <div className="text-xs text-muted-foreground">{name}</div> : null}
                        </TableCell>
                        <TableCell>{author.email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={active ? "default" : "secondary"}>{active ? "Author" : "Revoked"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={active}
                            disabled={!id || updateRole.isPending}
                            aria-label={`${active ? "Revoke" : "Restore"} ${author.username || "author"}`}
                            onCheckedChange={(checked) => setPending({ author, next: checked })}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New blog author</DialogTitle>
            <DialogDescription>They sign in with this username and can only work on their own posts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author-username">Username</Label>
              <Input id="author-username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-email">Email</Label>
              <Input id="author-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-password">Password</Label>
              <div className="relative">
                <Input
                  id="author-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  minLength={8}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={createAuthor.isPending}>
              Create author
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.next ? "Restore blog access?" : "Revoke blog access?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.next
                ? `${pending.author.username || "This user"} will be able to write posts again.`
                : `${pending?.author.username || "This user"} will no longer be able to write posts.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const userId = pending ? blogAuthorKey(pending.author) : ""
                if (pending && userId) updateRole.mutate({ userId, isBlogAuthor: pending.next })
                setPending(null)
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BlogPageFrame>
  )
}
