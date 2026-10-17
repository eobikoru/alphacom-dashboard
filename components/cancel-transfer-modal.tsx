"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Ban } from "lucide-react"
import { useCancelTransfer } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CancelTransferModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelTransferModal({ orderId, open, onOpenChange }: CancelTransferModalProps) {
  const [reason, setReason] = useState("")
  const cancelMutation = useCancelTransfer()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextReason = reason.trim()
    if (!nextReason || cancelMutation.isPending) return

    cancelMutation.mutate(
      { orderId, data: { reason: nextReason } },
      {
        onSuccess: () => {
          onOpenChange(false)
          setReason("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !cancelMutation.isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Cancel transfer
          </DialogTitle>
          <DialogDescription>Cancel this pending bank transfer before the customer pays.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-transfer-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-transfer-reason"
              placeholder="Customer asked to cancel before paying"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={cancelMutation.isPending}>
              Back
            </Button>
            <Button type="submit" variant="destructive" disabled={cancelMutation.isPending || !reason.trim()}>
              {cancelMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {cancelMutation.isPending ? "Cancelling..." : "Cancel transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
