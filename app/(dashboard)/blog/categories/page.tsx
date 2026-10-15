"use client"

import { useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useBlogCategories, useCreateBlogCategory, useDeleteBlogCategory, useUpdateBlogCategory } from "@/hooks/use-blog"
import { BLOG_SLUG_PATTERN } from "@/lib/blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import type { BlogCategory } from "@/types/blog"
import { toast } from "sonner"

interface CategoryFormState {
  name: string
  slug: string
  description: string
  is_active: boolean
  sort_order: string
}

const emptyForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  sort_order: "0",
}

export default function BlogCategoriesPage() {
  const access = useDashboardAccess()
  const categories = useBlogCategories(access.ready && access.canModerateBlog)
  const createCategory = useCreateBlogCategory()
  const updateCategory = useUpdateBlogCategory()
  const deleteCategory = useDeleteBlogCategory()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BlogCategory | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null)

  const startCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const startEdit = (category: BlogCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      slug: category.slug ?? "",
      description: category.description ?? "",
      is_active: category.is_active !== false,
      sort_order: String(category.sort_order ?? 0),
    })
    setOpen(true)
  }

  const save = async () => {
    const name = form.name.trim()
    if (!name) {
      toast.error("Category name is required.")
      return
    }
    const slug = form.slug.trim().toLowerCase()
    if (slug && !BLOG_SLUG_PATTERN.test(slug)) {
      toast.error("Slugs use lowercase letters, digits, and single hyphens.")
      return
    }
    const sortOrder = Number(form.sort_order)
    if (!Number.isFinite(sortOrder)) {
      toast.error("Sort order needs to be a number.")
      return
    }
    const payload = {
      name,
      description: form.description.trim(),
      is_active: form.is_active,
      sort_order: sortOrder,
      ...(slug ? { slug } : {}),
    }
    try {
      if (editing) await updateCategory.mutateAsync({ id: editing.id, data: payload })
      else await createCategory.mutateAsync(payload)
      setOpen(false)
    } catch {
      // The mutation hook already reports the failure.
    }
  }

  const rows = [...(categories.data ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name))

  return (
    <BlogPageFrame allow={access.canModerateBlog} title="Blog categories are for admins.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Blog categories</h1>
            <p className="text-sm text-muted-foreground">Inactive categories stay off the public site. Deleting one leaves its posts uncategorised.</p>
          </div>
          <Button onClick={startCreate}>
            <Plus className="size-4" />
            New category
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {categories.isLoading ? <p className="text-sm text-muted-foreground">Loading categories…</p> : null}
            {categories.isError ? (
              <p className="text-sm text-destructive">{getApiErrorMessage(categories.error, "Could not load categories.")}</p>
            ) : null}
            {categories.data && rows.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : null}
            {rows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                        {category.description ? <div className="text-xs text-muted-foreground">{category.description}</div> : null}
                      </TableCell>
                      <TableCell>{category.slug || "—"}</TableCell>
                      <TableCell>{category.sort_order ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active === false ? "secondary" : "default"}>
                          {category.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => startEdit(category)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => setDeleteTarget(category)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>Slug is optional. Leave it blank and the name is used to build one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input id="category-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input id="category-slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-order">Sort order</Label>
              <Input
                id="category-order"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="category-active">Active</Label>
              <Switch
                id="category-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={createCategory.isPending || updateCategory.isPending}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={createCategory.isPending || updateCategory.isPending}>
              {createCategory.isPending || updateCategory.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {createCategory.isPending || updateCategory.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deleteCategory.isPending && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Posts in this category stay up. They just lose the category.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteCategory.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!deleteTarget || deleteCategory.isPending) return
                deleteCategory.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }}
            >
              {deleteCategory.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BlogPageFrame>
  )
}
