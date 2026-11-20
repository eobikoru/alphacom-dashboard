"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Eye, Loader2, Megaphone, Plus, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductDescriptionEditor } from "@/components/product-description-editor"
import { Switch } from "@/components/ui/switch"
import { usePromotion, usePromotions, useCreatePromotion, useDeletePromotion, useUpdatePromotion } from "@/hooks/use-promotions"
import { productKeys } from "@/hooks/use-products"
import { getProducts } from "@/lib/api/products"
import type { PromotionProduct } from "@/types/promotion"

interface PromotionForm {
  title: string
  html: string
  is_active: boolean
  products: PromotionProduct[]
}

const emptyForm: PromotionForm = {
  title: "",
  html: "",
  is_active: true,
  products: [],
}

function savedPromotionHtml(html: string) {
  if (!html.trim() || typeof document === "undefined") return html.trim()
  const template = document.createElement("template")
  template.innerHTML = html
  template.content.querySelectorAll("[data-empty-promotion]").forEach((node) => node.remove())
  return template.innerHTML.trim()
}

export default function PromotionsPage() {
  const promotions = usePromotions()
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const deletePromotion = useDeletePromotion()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionForm>(emptyForm)
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const editing = usePromotion(editingId ?? "")
  const viewing = usePromotion(viewId ?? "")
  const productQuery = useQuery({
    queryKey: productKeys.list({ search: debouncedSearch || undefined, per_page: 8, page: 1 }),
    queryFn: () => getProducts({ search: debouncedSearch || undefined, per_page: 8, page: 1 }),
    enabled: formOpen,
  })
  const saving = createPromotion.isPending || updatePromotion.isPending

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(productSearch.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [productSearch])

  useEffect(() => {
    if (!editing.data || !editingId || hydratedId === editingId) return
    const promotion = editing.data
    const named = promotion.products.length
      ? promotion.products
      : promotion.product_ids.map((id) => ({ id, name: id }))
    setForm({
      title: promotion.title,
      html: promotion.html,
      is_active: promotion.is_active,
      products: named,
    })
    setHydratedId(editingId)
  }, [editing.data, editingId, hydratedId])

  const results = useMemo(() => productQuery.data?.data ?? [], [productQuery.data])
  const viewed = viewing.data ?? promotions.data?.find((promotion) => promotion.id === viewId)

  const openCreate = () => {
    setEditingId(null)
    setHydratedId(null)
    setForm(emptyForm)
    setProductSearch("")
    setFormOpen(true)
  }

  const openEdit = (promotionId: string) => {
    setEditingId(promotionId)
    setHydratedId(null)
    setForm(emptyForm)
    setProductSearch("")
    setFormOpen(true)
  }

  const closeForm = () => {
    if (saving) return
    setFormOpen(false)
    setEditingId(null)
    setHydratedId(null)
  }

  const toggleProduct = (product: PromotionProduct) => {
    setForm((current) => {
      const exists = current.products.some((item) => item.id === product.id)
      return {
        ...current,
        products: exists ? current.products.filter((item) => item.id !== product.id) : [...current.products, product],
      }
    })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const title = form.title.trim()
    const html = savedPromotionHtml(form.html)
    if (!title || !html || saving) return
    const body = {
      title,
      html,
      product_ids: form.products.map((product) => product.id),
      is_active: form.is_active,
    }
    const onSuccess = () => closeForm()
    if (editingId) {
      updatePromotion.mutate({ promotionId: editingId, data: body }, { onSuccess })
      return
    }
    createPromotion.mutate(body, { onSuccess })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground">HTML shown on the products you attach.</p>
        </div>
        <Button onClick={openCreate} disabled={formOpen && !editingId}>
          <Plus className="size-4" />
          New promotion
        </Button>
      </div>

      {formOpen ? (
        <section className="rounded-lg border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{editingId ? "Edit promotion" : "New promotion"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">The HTML is saved on each selected product.</p>
          </div>
          {editingId && hydratedId !== editingId && !editing.isError ? (
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading promotion…
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promotion-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="promotion-title"
                  value={form.title}
                  placeholder="Weekend launch"
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>HTML</Label>
                <ProductDescriptionEditor
                  key={editingId ?? "new"}
                  value={form.html}
                  placeholder="Write the promotion…"
                  promotionTools
                  onChange={(html) => setForm((current) => ({ ...current, html }))}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
                <Label htmlFor="promotion-active">Active</Label>
                <Switch
                  id="promotion-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion-products">Products</Label>
                {form.products.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {form.products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                        onClick={() => toggleProduct(product)}
                      >
                        {product.name} ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Choose the products that should show this promotion.</p>
                )}
                <Input
                  id="promotion-products"
                  value={productSearch}
                  placeholder="Search products"
                  onChange={(event) => setProductSearch(event.target.value)}
                />
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {productQuery.isLoading ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No products found.</p>
                  ) : (
                    <ul>
                      {results.map((product) => {
                        const checked = form.products.some((item) => item.id === product.id)
                        return (
                          <li key={product.id} className="border-b last:border-b-0">
                            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                              <Checkbox checked={checked} onCheckedChange={() => toggleProduct({ id: product.id, name: product.name })} />
                              <span className="min-w-0 flex-1 truncate">{product.name}</span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !form.title.trim() || !savedPromotionHtml(form.html)}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Saving..." : editingId ? "Save promotion" : "Create promotion"}
                </Button>
              </div>
            </form>
          )}
        </section>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        {promotions.isLoading ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">Loading promotions…</p>
        ) : promotions.isError ? (
          <p className="px-5 py-10 text-sm text-destructive">Could not load promotions.</p>
        ) : !promotions.data?.length ? (
          <div className="px-5 py-10">
            <p className="text-sm text-muted-foreground">No promotions yet.</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="size-4" />
              New promotion
            </Button>
          </div>
        ) : (
          <ul>
            {promotions.data.map((promotion) => (
              <li key={promotion.id} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0">
                <Megaphone className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{promotion.title || "Untitled"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {promotion.product_ids.length.toLocaleString()} product{promotion.product_ids.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant={promotion.is_active ? "default" : "secondary"}>{promotion.is_active ? "Active" : "Hidden"}</Badge>
                <Button variant="outline" size="sm" onClick={() => setViewId(promotion.id)}>
                  <Eye className="size-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(promotion.id)}>
                  Edit
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${promotion.title}`} onClick={() => setDeleteId(promotion.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="top-4 flex max-h-[calc(100dvh-2rem)] w-[min(960px,calc(100%-2rem))] max-w-none translate-y-0 flex-col overflow-y-auto sm:max-w-none">
          <DialogHeader>
            <DialogTitle>{viewed?.title || "Promotion"}</DialogTitle>
            <DialogDescription>
              {viewed
                ? `${viewed.is_active ? "Active" : "Hidden"} · ${viewed.product_ids.length.toLocaleString()} product${viewed.product_ids.length === 1 ? "" : "s"}`
                : "How this promotion appears on a product."}
            </DialogDescription>
          </DialogHeader>
          {viewing.isLoading && !viewed?.html ? (
            <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading promotion…
            </p>
          ) : viewed?.html ? (
            <div className="promotion-view blog-article" dangerouslySetInnerHTML={{ __html: viewed.html }} />
          ) : (
            <p className="py-6 text-sm text-muted-foreground">This promotion has no content yet.</p>
          )}
          {viewed && viewed.products.length > 0 ? (
            <p className="text-xs text-muted-foreground">{viewed.products.map((product) => product.name).join(", ")}</p>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !deletePromotion.isPending && !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete promotion</DialogTitle>
            <DialogDescription>This removes the promotion from the products it was attached to.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={deletePromotion.isPending} onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePromotion.isPending || !deleteId}
              onClick={() => {
                if (!deleteId) return
                deletePromotion.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
              }}
            >
              {deletePromotion.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {deletePromotion.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
