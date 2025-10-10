"use client"

import { useOrderDetails, useDeliverOrder } from "@/hooks/use-orders"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, MapPin, CreditCard, User, Phone, Mail } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { OrderStatus, PaymentStatus } from "@/types/order"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-purple-100 text-purple-800 border-purple-200",
  partially_refunded: "bg-purple-100 text-purple-800 border-purple-200",
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-purple-100 text-purple-800 border-purple-200",
  partially_refunded: "bg-purple-100 text-purple-800 border-purple-200",
}

interface OrderDetailsModalProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsModal({ orderId, open, onOpenChange }: OrderDetailsModalProps) {
  const { data: order, isLoading } = useOrderDetails(orderId)
  const deliverMutation = useDeliverOrder()

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeliver = () => {
    deliverMutation.mutate(orderId, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Complete information about this order</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{order.order_number}</h3>
                <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className={statusColors[order.status]}>
                  {order.status}
                </Badge>
                <Badge variant="outline" className={paymentStatusColors[order.payment_status]}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h4>
              <div className="text-sm space-y-1">
                <p>{order.shipping_address.street}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.postal_code && <p>{order.shipping_address.postal_code}</p>}
                <p className="flex items-center gap-2 mt-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {order.shipping_address.phone}
                </p>
              </div>
              {order.tracking_number && (
                <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
                  <Truck className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground">{order.tracking_number}</p>
                  </div>
                </div>
              )}
              {order.shipping_method && (
                <p className="text-sm text-muted-foreground">Method: {order.shipping_method}</p>
              )}
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.total_price, order.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price, order.currency)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax_amount, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shipping_amount, order.currency)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount, order.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount, order.currency)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}

            {order.status === "shipped" && (
              <Button onClick={handleDeliver} disabled={deliverMutation.isPending} className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Mark as Delivered
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Order not found</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
