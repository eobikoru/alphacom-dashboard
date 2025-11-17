"use client"

import { useState } from "react"
import { useOrders, useReleaseExpiredReservations } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Eye, Package, Truck, XCircle, DollarSign, Clock } from "lucide-react"
import { OrderDetailsModal } from "@/components/order-details-modal"
import { ShipOrderModal } from "@/components/ship-order-modal"
import { DeliverOrderModal } from "@/components/deliver-order-modal"
import { CancelOrderModal } from "@/components/cancel-order-modal"
import { RefundOrderModal } from "@/components/refund-order-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import type { OrderStatus, PaymentStatus } from "@/types/order"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
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

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [shipModalOpen, setShipModalOpen] = useState(false)
  const [deliverModalOpen, setDeliverModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  const { data, isLoading } = useOrders({
    page,
    per_page: perPage,
    status: status || undefined,
    payment_status: paymentStatus || undefined,
    search: search || undefined,
  })
  console.log(data, "data")
  const releaseExpiredMutation = useReleaseExpiredReservations()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? "" : value)
    setPage(1)
  }

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatus(value === "all" ? "" : value)
    setPage(1)
  }

  const handlePerPageChange = (value: string) => {
    const next = Number(value)
    setPerPage(next)
    setPage(1)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openDetailsModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailsModalOpen(true)
  }

  const openShipModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setShipModalOpen(true)
  }

  const openDeliverModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDeliverModalOpen(true)
  }

  const openCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCancelModalOpen(true)
  }

  const openRefundModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setRefundModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <Button
          onClick={() => releaseExpiredMutation.mutate()}
          disabled={releaseExpiredMutation.isPending}
          variant="outline"
          size="sm"
        >
          <Clock className="mr-2 h-4 w-4" />
          Release Expired
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
          <CardDescription>Search and filter orders by status, payment, or customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by order # or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={status || "all"} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                {/* <SelectItem value="completed">Completed</SelectItem> */}
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                {/* <SelectItem value="failed">Failed</SelectItem> */}
                <SelectItem value="refunded">Refunded</SelectItem>
                {/* <SelectItem value="partially_refunded">Partially Refunded</SelectItem> */}
              </SelectContent>
            </Select>

            <Select value={paymentStatus || "all"} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setStatus("")
                setPaymentStatus("")
                setSearch("")
                setSearchInput("")
                setPage(1)
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                data?.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={paymentStatusColors[order.payment_status]}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total_amount, order.currency)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDetailsModal(order.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "processing" && (
                          <Button variant="ghost" size="sm" onClick={() => openShipModal(order.id)}>
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button variant="ghost" size="sm" onClick={() => openDeliverModal(order.id)}>
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                        {["processing"].includes(order.status) && (
                          <Button variant="ghost" size="sm" onClick={() => openCancelModal(order.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {order.payment_status === "" && !["", ""].includes(order.status) && (
                          <Button variant="ghost" size="sm" onClick={() => openRefundModal(order.id)}>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination
            currentPage={page}
            totalPages={data.pagination.pages}
            totalItems={data.pagination.total}
            itemsPerPage={perPage}
            onPageChange={setPage}
          />
        </div>
      )}

      {selectedOrderId && (
        <>
          <OrderDetailsModal orderId={selectedOrderId} open={detailsModalOpen} onOpenChange={setDetailsModalOpen} />
          <ShipOrderModal orderId={selectedOrderId} open={shipModalOpen} onOpenChange={setShipModalOpen} />
          <DeliverOrderModal orderId={selectedOrderId} open={deliverModalOpen} onOpenChange={setDeliverModalOpen} />
          <CancelOrderModal orderId={selectedOrderId} open={cancelModalOpen} onOpenChange={setCancelModalOpen} />
          <RefundOrderModal orderId={selectedOrderId} open={refundModalOpen} onOpenChange={setRefundModalOpen} />
        </>
      )}
    </div>
  )
}
