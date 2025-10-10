"use client"

import type React from "react"

import { useState } from "react"
import { useCancelOrder } from "@/hooks/use-orders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { XCircle } from "lucide-react"

interface CancelOrderModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelOrderModal({ orderId, open, onOpenChange }: CancelOrderModalProps) {
  const [reason, setReason] = useState("")

  const cancelMutation = useCancelOrder()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    cancelMutation.mutate(
      {
        orderId,
        data: { reason },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setReason("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>This will cancel the order and release reserved inventory</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Order
            </Button>
            <Button type="submit" variant="destructive" disabled={cancelMutation.isPending || !reason}>
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
