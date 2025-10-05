"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Ban, CheckCircle, RefreshCw, ShieldAlert } from "lucide-react"
import { useUsers, useUser, useUpdateUserStatus } from "@/hooks/use-users"
import { getAdminInfo } from "@/lib/auth"

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const adminInfo = getAdminInfo()
    setIsSuperAdmin(adminInfo?.is_super_admin || false)
  }, [])

  const { data: usersData, isLoading } = useUsers({
    page,
    per_page: 20,
    search: search || undefined,
    is_admin: false,
  })

  const { data: userDetails } = useUser(selectedUserId || "")
  const updateStatus = useUpdateUserStatus()

  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      return
    }
    updateStatus.mutate({
      userId,
      data: { is_active: !currentStatus },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        {isSuperAdmin && (
          <Badge variant="default" className="gap-1">
            <ShieldAlert className="w-3 h-3" />
            Super Admin Access
          </Badge>
        )}
      </div>

      {!isSuperAdmin && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <ShieldAlert className="w-5 h-5" />
              <p className="text-sm font-medium">You need Super Admin privileges to manage customer accounts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>View and manage all customer accounts</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading customers...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(user.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(user.id, user.is_active)}
                            disabled={!isSuperAdmin}
                          >
                            {user.is_active ? (
                              <Ban className="w-4 h-4 text-destructive" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usersData && usersData.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * usersData.per_page + 1} to{" "}
                    {Math.min(page * usersData.per_page, usersData.total)} of {usersData.total} customers
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {usersData.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === usersData.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View customer information and order statistics</DialogDescription>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{userDetails.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={userDetails.is_active ? "default" : "destructive"}>
                    {userDetails.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date(userDetails.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Order Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Registered Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{userDetails.order_stats.registered.total_orders}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Spent: ₦{userDetails.order_stats.registered.total_spent.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Guest Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{userDetails.order_stats.guest.total_orders}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Spent: ₦{userDetails.order_stats.guest.total_spent.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
