import { api } from "../axios"
import type { Promotion, PromotionLead, PromotionLeadList, PromotionLeadQuery, PromotionProduct, PromotionWrite } from "@/types/form-promotion"

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function productFrom(value: unknown): PromotionProduct | null {
  if (typeof value === "string" && value) return { id: value, name: value }
  const record = asRecord(value)
  const id = record?.id
  if (typeof id !== "string" || !id) return null
  const name = typeof record.name === "string" && record.name ? record.name : id
  const sku = typeof record.sku === "string" ? record.sku : undefined
  const slug = typeof record.slug === "string" ? record.slug : undefined
  return { id, name, sku, slug }
}

function normalizePromotion(value: unknown): Promotion {
  const record = asRecord(value) ?? {}
  const nested = asRecord(record.promotion)
  const source = nested ?? record
  const productValues = Array.isArray(source.products) ? source.products : Array.isArray(record.products) ? record.products : []
  const products = productValues.map(productFrom).filter((product): product is PromotionProduct => product !== null)
  const rawIds = Array.isArray(source.product_ids) ? source.product_ids : Array.isArray(record.product_ids) ? record.product_ids : []
  const productIds = rawIds.map((id) => (typeof id === "string" ? id : "")).filter(Boolean)
  const active = source.is_active ?? record.is_active

  return {
    id: String(source.id ?? source.promotion_id ?? record.id ?? record.promotion_id ?? ""),
    title: text(source.title ?? record.title),
    html: text(source.html ?? record.html),
    video_url: text(source.video_url ?? record.video_url),
    video_embed_url: text(source.video_embed_url ?? record.video_embed_url),
    video_type: text(source.video_type ?? record.video_type),
    whatsapp_message: text(source.whatsapp_message ?? record.whatsapp_message),
    product_ids: productIds.length > 0 ? productIds : products.map((product) => product.id),
    is_active: typeof active === "boolean" ? active : true,
    starts_at: optionalText(source.starts_at ?? record.starts_at),
    ends_at: optionalText(source.ends_at ?? record.ends_at),
    products,
    created_at: optionalText(source.created_at ?? record.created_at) ?? undefined,
    updated_at: optionalText(source.updated_at ?? record.updated_at) ?? undefined,
  }
}

function promotionRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const root = asRecord(payload)
  if (!root) return []
  const data = asRecord(root.data)
  const candidates = [root.promotions, root.items, root.results, root.data, data?.promotions, data?.items, data?.results, data?.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

function normalizePromotionList(payload: unknown): Promotion[] {
  return promotionRows(payload)
    .map(normalizePromotion)
    .filter((promotion) => promotion.id)
}

function promotionPayload(payload: unknown) {
  const root = asRecord(payload)
  if (!root) return payload
  if (typeof root.id === "string" || typeof root.html === "string" || Array.isArray(root.products)) return root
  const data = asRecord(root.data)
  if (data && (typeof data.id === "string" || typeof data.html === "string" || Array.isArray(data.products))) return data
  return asRecord(data?.promotion) ?? asRecord(root.promotion) ?? data ?? root
}

function normalizeLead(value: unknown): PromotionLead | null {
  const record = asRecord(value)
  if (!record || typeof record.id !== "string" || !record.id) return null
  return {
    id: record.id,
    promotion_id: text(record.promotion_id),
    promotion_title: text(record.promotion_title),
    name: text(record.name),
    phone: text(record.phone),
    email: optionalText(record.email),
    address: optionalText(record.address),
    note: optionalText(record.note),
    whatsapp_status: text(record.whatsapp_status),
    whatsapp_error: optionalText(record.whatsapp_error),
    sent_at: optionalText(record.sent_at),
    created_at: optionalText(record.created_at),
  }
}

export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const { data } = await api.get("/api/v1/admin/promotions", { params: { include_inactive: true } })
    const listed = normalizePromotionList(data)
    if (listed.length > 0) return listed
  } catch {
    // Hidden promotions are optional. The plain list is the one already used by Promotions.
  }
  const { data } = await api.get("/api/v1/admin/promotions")
  return normalizePromotionList(data)
}

export const getPromotion = async (promotionId: string): Promise<Promotion> => {
  const { data } = await api.get(`/api/v1/admin/promotions/${promotionId}`)
  return normalizePromotion(promotionPayload(data))
}

export const createPromotion = async (body: PromotionWrite): Promise<Promotion> => {
  const { data } = await api.post("/api/v1/admin/promotions", body)
  return normalizePromotion(promotionPayload(data))
}

export const updatePromotion = async (promotionId: string, body: PromotionWrite): Promise<Promotion> => {
  const { data } = await api.put(`/api/v1/admin/promotions/${promotionId}`, body)
  return normalizePromotion(promotionPayload(data))
}

export const deletePromotion = async (promotionId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/promotions/${promotionId}`)
}

export const getPromotionLeads = async (params: PromotionLeadQuery): Promise<PromotionLeadList> => {
  const { data } = await api.get("/api/v1/admin/promotions/leads", {
    params: {
      page: params.page,
      per_page: params.per_page,
      ...(params.promotion_id ? { promotion_id: params.promotion_id } : {}),
    },
  })
  const root = asRecord(data) ?? {}
  const rows = Array.isArray(root.data) ? root.data : []
  const leads = rows.map(normalizeLead).filter((lead): lead is PromotionLead => lead !== null)
  const total = typeof root.total === "number" ? root.total : leads.length
  const page = typeof root.page === "number" ? root.page : params.page
  const perPage = typeof root.per_page === "number" ? root.per_page : params.per_page
  return { data: leads, total, page, per_page: perPage }
}

export const resendPromotionLead = async (leadId: string): Promise<PromotionLead> => {
  const { data } = await api.post(`/api/v1/admin/promotions/leads/${leadId}/resend`)
  const root = asRecord(data)
  const lead = normalizeLead(root?.data ?? data)
  if (!lead) throw new Error("The resend response did not include the request.")
  return lead
}
