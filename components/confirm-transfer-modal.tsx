"use client"

import type React from "react"
import { useState } from "react"
import { Landmark } from "lucide-react"
import { useConfirmTransfer } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ConfirmTransferModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmTransferModal({ orderId, open, onOpenChange }: ConfirmTransferModalProps) {
  const [transferReference, setTransferReference] = useState("")
  const [note, setNote] = useState("")
  const confirmMutation = useConfirmTransfer()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const reference = transferReference.trim()
    if (!reference) return

    confirmMutation.mutate(
      {
        orderId,
        data: {
          transfer_reference: reference,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setTransferReference("")
          setNote("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Confirm transfer
          </DialogTitle>
          <DialogDescription>
            Mark this bank transfer as received. Payment becomes completed and the order moves to processing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-reference">
              Transfer reference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="transfer-reference"
              placeholder="NIP/ZENITH/123456"
              value={transferReference}
              onChange={(event) => setTransferReference(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-note">Note</Label>
            <Textarea
              id="transfer-note"
              placeholder="WhatsApp receipt matched"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={confirmMutation.isPending || !transferReference.trim()}>
              {confirmMutation.isPending ? "Confirming..." : "Confirm transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
