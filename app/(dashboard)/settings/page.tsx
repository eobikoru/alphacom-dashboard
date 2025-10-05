"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Shield, ShieldCheck, UserPlus, Ban, CheckCircle, RefreshCw, ShieldAlert } from "lucide-react"
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdminRole,
  useDeactivateAdmin,
  useReactivateAdmin,
} from "@/hooks/use-admins"
import type { Admin } from "@/types/admin"
import { getAdminInfo } from "@/lib/auth"
import { Pagination } from "@/components/pagination"

export default function SettingsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [includeDeactivated, setIncludeDeactivated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    department: "",
    job_title: "",
  })

  const [deactivateReason, setDeactivateReason] = useState("")

  const [page, setPage] = useState(1)
  const [perPage] = useState(5)

  useEffect(() => {
    const adminInfo = getAdminInfo()
    setIsSuperAdmin(adminInfo?.is_super_admin || false)
  }, [])

  const { data: adminsData, isLoading } = useAdmins({
    include_deactivated: includeDeactivated,
    include_self: true,
  })

  const paginatedAdmins = adminsData ? adminsData.slice((page - 1) * perPage, page * perPage) : []
  const totalPages = adminsData ? Math.ceil(adminsData.length / perPage) : 0

  const createAdmin = useCreateAdmin()
  const updateRole = useUpdateAdminRole()
  const deactivateAdmin = useDeactivateAdmin()
  const reactivateAdmin = useReactivateAdmin()

  const handleCreateAdmin = () => {
    if (!isSuperAdmin) return

    createAdmin.mutate(formData, {
      onSuccess: () => {
        setShowCreateDialog(false)
        setFormData({
          username: "",
          email: "",
          password: "",
          department: "",
          job_title: "",
        })
      },
    })
  }

  const handleUpdateRole = (isSuperAdmin: boolean) => {
    if (selectedAdmin) {
      updateRole.mutate(
        {
          adminId: selectedAdmin.id,
          data: { is_super_admin: isSuperAdmin },
        },
        {
          onSuccess: () => {
            setShowRoleDialog(false)
            setSelectedAdmin(null)
          },
        },
      )
    }
  }

  const handleDeactivate = () => {
    if (selectedAdmin && deactivateReason) {
      deactivateAdmin.mutate(
        {
          adminId: selectedAdmin.id,
          reason: deactivateReason,
        },
        {
          onSuccess: () => {
            setShowDeactivateDialog(false)
            setSelectedAdmin(null)
            setDeactivateReason("")
          },
        },
      )
    }
  }

  const handleReactivate = (adminId: string, restoreSuperAdmin = false) => {
    reactivateAdmin.mutate({
      adminId,
      restoreSuperAdmin,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage admin users and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Badge variant="default" className="gap-1">
              <ShieldAlert className="w-3 h-3" />
              Super Admin Access
            </Badge>
          )}
          <Button onClick={() => setShowCreateDialog(true)} disabled={!isSuperAdmin}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Admin
          </Button>
        </div>
      </div>

      {!isSuperAdmin && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <ShieldAlert className="w-5 h-5" />
              <p className="text-sm font-medium">
                You need Super Admin privileges to manage admin accounts and system settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage admin accounts and permissions</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIncludeDeactivated(!includeDeactivated)}
              disabled={!isSuperAdmin}
            >
              {includeDeactivated ? "Hide" : "Show"} Deactivated
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading admins...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdmins?.map((admin) => (
                      <tr key={admin.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{admin.username}</td>
                        <td className="px-4 py-3">{admin.email}</td>
                        <td className="px-4 py-3">{admin.department}</td>
                        <td className="px-4 py-3">
                          <Badge variant={admin.is_super_admin ? "default" : "secondary"}>
                            {admin.is_super_admin ? (
                              <>
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Super Admin
                              </>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={admin.is_active ? "default" : "destructive"}>
                            {admin.is_active ? "Active" : "Deactivated"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{new Date(admin.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {admin.is_active ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAdmin(admin)
                                    setShowRoleDialog(true)
                                  }}
                                  disabled={!isSuperAdmin}
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAdmin(admin)
                                    setShowDeactivateDialog(true)
                                  }}
                                  disabled={!isSuperAdmin}
                                >
                                  <Ban className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReactivate(admin.id, admin.is_super_admin)}
                                disabled={!isSuperAdmin}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-[23rem] ">

                <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                totalItems={adminsData?.length || 0}
                itemsPerPage={perPage}
                onPageChange={setPage}
              /> 
              </div>
             
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
            <DialogDescription>Create a new admin account with regular admin privileges</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={createAdmin.isPending}>
              {createAdmin.isPending ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Admin Role</DialogTitle>
            <DialogDescription>Change the role for {selectedAdmin?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current Role:{" "}
              <Badge variant={selectedAdmin?.is_super_admin ? "default" : "secondary"}>
                {selectedAdmin?.is_super_admin ? "Super Admin" : "Admin"}
              </Badge>
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleUpdateRole(false)}
                disabled={!selectedAdmin?.is_super_admin}
              >
                <Shield className="w-4 h-4 mr-2" />
                Regular Admin
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleUpdateRole(true)}
                disabled={selectedAdmin?.is_super_admin}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Super Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Admin</DialogTitle>
            <DialogDescription>Deactivate {selectedAdmin?.username}'s admin account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Deactivation</Label>
              <Textarea
                id="reason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={!deactivateReason || deactivateAdmin.isPending}
            >
              {deactivateAdmin.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
