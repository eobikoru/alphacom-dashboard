"use client"

import type React from "react"

import { useState } from "react"
import { useRefundOrder } from "@/hooks/use-orders"
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
import { DollarSign } from "lucide-react"

interface RefundOrderModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundOrderModal({ orderId, open, onOpenChange }: RefundOrderModalProps) {
  const [reason, setReason] = useState("")

  const refundMutation = useRefundOrder()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    refundMutation.mutate(
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
            <DollarSign className="h-5 w-5 text-purple-500" />
            Refund Order
          </DialogTitle>
          <DialogDescription>
            Process a full refund for this order via Paystack. Refunds typically take 1-7 business days for cards.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Refund Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for the refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Refund Timeline:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Card payments: 1-7 business days</li>
              <li>Bank transfers: Instant to 24 hours</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={refundMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={refundMutation.isPending || !reason}>
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
