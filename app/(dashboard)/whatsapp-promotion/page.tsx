"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/pagination"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePromotion, usePromotionLeads, usePromotions, useResendPromotionLead, useUpdatePromotion } from "@/hooks/use-form-promotions"
import { productKeys } from "@/hooks/use-products"
import { getProducts } from "@/lib/api/products"
import type { Promotion, PromotionProduct } from "@/types/form-promotion"
import { toast } from "sonner"

const LEAD_PAGE_SIZE = 20
const DEFAULT_MESSAGE =
  "Hi {{name}}, thank you. Alphacom Online has received your order request. A sales representative will contact you shortly."

function formatWhen(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function newestLivePromotion(promotions: Promotion[]) {
  const now = Date.now()
  return promotions
    .filter((promotion) => {
      if (!promotion.is_active) return false
      if (promotion.starts_at) {
        const starts = new Date(promotion.starts_at).getTime()
        if (!Number.isNaN(starts) && starts > now) return false
      }
      if (promotion.ends_at) {
        const ends = new Date(promotion.ends_at).getTime()
        if (!Number.isNaN(ends) && ends <= now) return false
      }
      return true
    })
    .sort((left, right) => {
      const leftTime = new Date(left.created_at ?? 0).getTime()
      const rightTime = new Date(right.created_at ?? 0).getTime()
      return rightTime - leftTime
    })[0] ?? null
}

export default function WhatsAppPromotionPage() {
  const promotions = usePromotions()
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const resendLead = useResendPromotionLead()
  const live = useMemo(() => newestLivePromotion(promotions.data ?? []), [promotions.data])

  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [products, setProducts] = useState<PromotionProduct[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [leadPage, setLeadPage] = useState(1)

  const leads = usePromotionLeads({ page: leadPage, per_page: LEAD_PAGE_SIZE }, true)
  const creating = replacing || !live
  const productQuery = useQuery({
    queryKey: productKeys.list({ search: debouncedSearch || undefined, per_page: 20, page: 1 }),
    queryFn: () => getProducts({ search: debouncedSearch || undefined, per_page: 20, page: 1 }),
    enabled: creating,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(productSearch.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [productSearch])

  useEffect(() => {
    if (!live || replacing || hydratedId === live.id) return
    setMessage(live.whatsapp_message || DEFAULT_MESSAGE)
    setHydratedId(live.id)
  }, [live, replacing, hydratedId])

  const results = productQuery.data?.data ?? []
  const saving = createPromotion.isPending || updatePromotion.isPending
  const trimmed = message.trim()
  const leadPages = Math.max(1, Math.ceil((leads.data?.total ?? 0) / LEAD_PAGE_SIZE))

  const toggleProduct = (product: PromotionProduct) => {
    setProducts((current) =>
      current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product],
    )
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed) {
      toast.error("Write the WhatsApp message.")
      return
    }
    if (creating) {
      if (products.length === 0) {
        toast.error("Choose at least one product.")
        return
      }
      createPromotion.mutate(
        {
          whatsapp_message: trimmed,
          product_ids: products.map((product) => product.id),
          is_active: true,
          starts_at: null,
          ends_at: null,
          title: "20,000mAh power bank + free hand fan",
        },
        {
          onSuccess: () => {
            setReplacing(false)
            setProducts([])
            setHydratedId(null)
          },
        },
      )
      return
    }
    if (!live) return
    if (trimmed === live.whatsapp_message) {
      toast.message("No changes to save")
      return
    }
    updatePromotion.mutate({ promotionId: live.id, data: { whatsapp_message: trimmed } })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">WhatsApp promotion</h1>
      </div>

      <section className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">The message the form sends</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {creating
                ? "Saving a new active message makes it the one the order form uses."
                : `${live?.title || "Untitled"} is the newest live promotion, so this is the message that goes out.`}
            </p>
          </div>
          {live && !replacing ? (
            <Button type="button" variant="outline" onClick={() => { setReplacing(true); setMessage(live.whatsapp_message || DEFAULT_MESSAGE); setProducts([]) }}>
              Write a new message
            </Button>
          ) : null}
        </div>

        {promotions.isLoading ? (
          <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading the live message…
          </p>
        ) : promotions.isError ? (
          <p className="py-8 text-sm text-destructive">Could not load the live promotion.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">WhatsApp message</Label>
              <Textarea id="whatsapp-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} />
              <p className="text-xs text-muted-foreground">{"{{name}}"} is the customer&apos;s first name.</p>
            </div>

            {creating ? (
              <div className="space-y-2">
                <Label htmlFor="whatsapp-products">
                  Products <span className="text-destructive">*</span>
                </Label>
                {products.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <button key={product.id} type="button" className="rounded-full border px-3 py-1 text-xs hover:bg-muted" onClick={() => toggleProduct(product)}>
                        {product.name} ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Choose at least one product so this message can go live.</p>
                )}
                <Input id="whatsapp-products" value={productSearch} placeholder="Search products" onChange={(event) => setProductSearch(event.target.value)} />
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {productQuery.isLoading ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No products found.</p>
                  ) : (
                    <ul>
                      {results.map((product) => {
                        const checked = products.some((item) => item.id === product.id)
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
            ) : null}

            <div className="flex justify-end gap-2">
              {replacing ? (
                <Button type="button" variant="outline" disabled={saving} onClick={() => { setReplacing(false); setHydratedId(null) }}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving || !trimmed || (creating && products.length === 0)}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {saving ? "Saving..." : creating ? "Use this message" : "Save message"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Orders from the form</h2>
          <p className="mt-1 text-sm text-muted-foreground">Name and phone are required. Email, delivery address, and a note are optional.</p>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          {leads.isLoading ? (
            <p className="px-5 py-10 text-sm text-muted-foreground">Loading orders…</p>
          ) : leads.isError ? (
            <p className="px-5 py-10 text-sm text-destructive">Could not load orders.</p>
          ) : !leads.data?.data.length ? (
            <p className="px-5 py-10 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul>
              {leads.data.data.map((lead) => {
                const failed = lead.whatsapp_status === "failed"
                return (
                  <li key={lead.id} className="space-y-2 border-b px-5 py-4 last:border-b-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{lead.name || "Unnamed"}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone || "No phone"}</p>
                      </div>
                      <Badge variant={failed ? "destructive" : lead.whatsapp_status === "sent" ? "default" : "secondary"}>
                        {lead.whatsapp_status || "unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.email || "No email"}
                      {lead.address ? ` · ${lead.address}` : ""}
                    </p>
                    {lead.note ? <p className="text-sm">{lead.note}</p> : null}
                    <p className="text-xs text-muted-foreground">
                      {formatWhen(lead.created_at)}
                      {lead.sent_at ? ` · Sent ${formatWhen(lead.sent_at)}` : ""}
                      {lead.promotion_title ? ` · ${lead.promotion_title}` : ""}
                    </p>
                    {failed ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-destructive">{lead.whatsapp_error || "WhatsApp did not send."}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={resendLead.isPending && resendLead.variables === lead.id}
                          onClick={() => resendLead.mutate(lead.id)}
                        >
                          {resendLead.isPending && resendLead.variables === lead.id ? <Loader2 className="size-4 animate-spin" /> : null}
                          Resend
                        </Button>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {leads.data && leads.data.total > LEAD_PAGE_SIZE ? (
          <Pagination
            currentPage={leadPage}
            totalPages={leadPages}
            totalItems={leads.data.total}
            itemsPerPage={LEAD_PAGE_SIZE}
            onPageChange={setLeadPage}
          />
        ) : null}
      </section>
    </div>
  )
}
