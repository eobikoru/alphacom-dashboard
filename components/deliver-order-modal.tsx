"use client"
import { useDeliverOrder } from "@/hooks/use-orders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

interface DeliverOrderModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeliverOrderModal({ orderId, open, onOpenChange }: DeliverOrderModalProps) {
  const deliverMutation = useDeliverOrder()

  const handleDeliver = async () => {
    try {
      await deliverMutation.mutateAsync(orderId)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Mark Order as Delivered
          </DialogTitle>
          <DialogDescription>
            Confirm that this order has been successfully delivered to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action will update the order status to <span className="font-semibold text-foreground">DELIVERED</span>
            . The customer will be notified of the delivery.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deliverMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleDeliver} disabled={deliverMutation.isPending}>
            {deliverMutation.isPending ? "Marking as Delivered..." : "Mark as Delivered"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}