import { api } from "../axios"
import type { Promotion, PromotionProduct, PromotionWrite } from "@/types/promotion"

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function productFrom(value: unknown): PromotionProduct | null {
  if (typeof value === "string" && value) return { id: value, name: value }
  const record = asRecord(value)
  const id = record?.id
  if (typeof id !== "string" || !id) return null
  const name = typeof record.name === "string" && record.name ? record.name : id
  return { id, name }
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
    id: String(source.id ?? record.id ?? ""),
    title: String(source.title ?? record.title ?? ""),
    html: String(source.html ?? record.html ?? ""),
    product_ids: productIds.length > 0 ? productIds : products.map((product) => product.id),
    is_active: typeof active === "boolean" ? active : true,
    products,
    created_at: typeof source.created_at === "string" ? source.created_at : undefined,
    updated_at: typeof source.updated_at === "string" ? source.updated_at : undefined,
  }
}

function normalizePromotionList(payload: unknown): Promotion[] {
  if (Array.isArray(payload)) return payload.map(normalizePromotion)
  const root = asRecord(payload)
  if (!root) return []
  const data = asRecord(root.data)
  const candidates = [root.promotions, root.items, root.results, root.data, data?.promotions, data?.items, data?.results]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map(normalizePromotion)
  }
  return []
}

function normalizePromotionEntity(payload: unknown): Promotion {
  const root = asRecord(payload)
  const data = asRecord(root?.data)
  const source = asRecord(data?.promotion) ?? asRecord(root?.promotion) ?? data ?? root ?? payload
  return normalizePromotion(source)
}

export const getPromotions = async (): Promise<Promotion[]> => {
  const { data } = await api.get("/api/v1/admin/promotions")
  return normalizePromotionList(data)
}

export const getPromotion = async (promotionId: string): Promise<Promotion> => {
  const { data } = await api.get(`/api/v1/admin/promotions/${promotionId}`)
  return normalizePromotionEntity(data)
}

export const createPromotion = async (body: PromotionWrite): Promise<Promotion> => {
  const { data } = await api.post("/api/v1/admin/promotions", body)
  return normalizePromotionEntity(data)
}

export const updatePromotion = async (promotionId: string, body: PromotionWrite): Promise<Promotion> => {
  const { data } = await api.put(`/api/v1/admin/promotions/${promotionId}`, body)
  return normalizePromotionEntity(data)
}

export const deletePromotion = async (promotionId: string): Promise<void> => {
  await api.delete(`/api/v1/admin/promotions/${promotionId}`)
}
