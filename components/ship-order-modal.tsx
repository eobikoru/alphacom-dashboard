"use client"

import type React from "react"

import { useState } from "react"
import { useShipOrder } from "@/hooks/use-orders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Truck } from "lucide-react"

interface ShipOrderModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShipOrderModal({ orderId, open, onOpenChange }: ShipOrderModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingMethod, setShippingMethod] = useState("")
  const [notes, setNotes] = useState("")

  const shipMutation = useShipOrder()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    shipMutation.mutate(
      {
        orderId,
        data: {
          tracking_number: trackingNumber || undefined,
          shipping_method: shippingMethod,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setTrackingNumber("")
          setShippingMethod("")
          setNotes("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Ship Order
          </DialogTitle>
          <DialogDescription>Mark this order as shipped with tracking information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking">
              Tracking Number <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="tracking"
              placeholder="Leave empty for auto-generated tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide 3rd party tracking (DHL, FedEx, etc.) or leave empty for system-generated
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">
              Shipping Method <span className="text-red-500">*</span>
            </Label>
            <Input
              id="method"
              placeholder="e.g., Standard Shipping, Express Delivery"
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any shipping notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={shipMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={shipMutation.isPending || !shippingMethod}>
              {shipMutation.isPending ? "Shipping..." : "Ship Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
