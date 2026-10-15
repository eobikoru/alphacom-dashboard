"use client"

import { useEffect, useState } from "react"
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
import { useBlogFaq, useBlogFaqs, useCreateBlogFaq, useDeleteBlogFaq, useUpdateBlogFaq } from "@/hooks/use-blog"
import { getApiErrorMessage } from "@/lib/api/blog"
import type { BlogFaq } from "@/types/blog"
import { toast } from "sonner"

interface FaqFormState {
  question: string
  answer: string
  is_active: boolean
  sort_order: string
}

const emptyForm: FaqFormState = {
  question: "",
  answer: "",
  is_active: true,
  sort_order: "",
}

function formFromFaq(faq: BlogFaq): FaqFormState {
  return {
    question: faq.question,
    answer: faq.answer,
    is_active: faq.is_active !== false,
    sort_order: faq.sort_order == null ? "" : String(faq.sort_order),
  }
}

export default function BlogFaqsPage() {
  const access = useDashboardAccess()
  const faqs = useBlogFaqs(access.ready && access.canModerateBlog)
  const createFaq = useCreateBlogFaq()
  const updateFaq = useUpdateBlogFaq()
  const deleteFaq = useDeleteBlogFaq()
  const savingFaq = createFaq.isPending || updateFaq.isPending
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FaqFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<BlogFaq | null>(null)
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  const faq = useBlogFaq(open && editingId ? editingId : "")

  useEffect(() => {
    if (!open) {
      setHydratedId(null)
      return
    }
    if (!editingId || !faq.data || faq.data.id !== editingId || hydratedId === editingId) return
    setForm(formFromFaq(faq.data))
    setHydratedId(editingId)
  }, [open, editingId, faq.data, hydratedId])

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const startEdit = (id: string) => {
    setEditingId(id)
    setForm(emptyForm)
    setOpen(true)
  }

  const save = async () => {
    const question = form.question.trim()
    const answer = form.answer.trim()
    if (!question || !answer) {
      toast.error("Question and answer are required.")
      return
    }

    const payload: { question: string; answer: string; is_active: boolean; sort_order?: number } = {
      question,
      answer,
      is_active: form.is_active,
    }
    const sortText = form.sort_order.trim()
    if (sortText) {
      const sortOrder = Number(sortText)
      if (!Number.isFinite(sortOrder)) {
        toast.error("Sort order needs to be a number.")
        return
      }
      payload.sort_order = sortOrder
    }

    try {
      if (editingId) await updateFaq.mutateAsync({ id: editingId, data: payload })
      else await createFaq.mutateAsync(payload)
      setOpen(false)
    } catch {
      // The mutation hook already reports the failure.
    }
  }

  const rows = [...(faqs.data ?? [])].sort(
    (a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) || a.question.localeCompare(b.question),
  )

  return (
    <BlogPageFrame allow={access.canModerateBlog} title="FAQs are for admins.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">FAQs</h1>
            <p className="text-sm text-muted-foreground">
              Hidden FAQs stay in this list and off the public site. Leave sort order blank and a new FAQ is added at the end.
            </p>
          </div>
          <Button onClick={startCreate}>
            <Plus className="size-4" />
            New FAQ
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {faqs.isLoading ? <p className="text-sm text-muted-foreground">Loading FAQs…</p> : null}
            {faqs.isError ? <p className="text-sm text-destructive">{getApiErrorMessage(faqs.error, "Could not load FAQs.")}</p> : null}
            {faqs.data && rows.length === 0 ? <p className="text-sm text-muted-foreground">No FAQs yet.</p> : null}
            {rows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.question}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">{item.answer}</div>
                      </TableCell>
                      <TableCell>{item.sort_order ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active === false ? "secondary" : "default"}>
                          {item.is_active === false ? "Hidden" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${item.question}`} onClick={() => startEdit(item.id)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${item.question}`} onClick={() => setDeleteTarget(item)}>
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
            <DialogTitle>{editingId ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>Hidden FAQs are kept here and left off the public site.</DialogDescription>
          </DialogHeader>
          {editingId && faq.isLoading ? <p className="text-sm text-muted-foreground">Loading FAQ…</p> : null}
          {editingId && faq.isError ? (
            <p className="text-sm text-destructive">{getApiErrorMessage(faq.error, "Could not load this FAQ.")}</p>
          ) : null}
          {!editingId || faq.data ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faq-question">Question</Label>
                <Input
                  id="faq-question"
                  value={form.question}
                  onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  value={form.answer}
                  rows={4}
                  onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-order">Sort order</Label>
                <Input
                  id="faq-order"
                  type="number"
                  placeholder="Leave blank to add at the end"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="faq-active">Active</Label>
                <Switch
                  id="faq-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={savingFaq}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={savingFaq || (Boolean(editingId) && !faq.data)}>
              {savingFaq ? <Loader2 className="size-4 animate-spin" /> : null}
              {savingFaq ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(nextOpen) => !nextOpen && !deleteFaq.isPending && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.question}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFaq.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteFaq.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!deleteTarget || deleteFaq.isPending) return
                deleteFaq.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }}
            >
              {deleteFaq.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {deleteFaq.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BlogPageFrame>
  )
}
