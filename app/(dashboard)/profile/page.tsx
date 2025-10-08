"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Building, Shield, Save } from "lucide-react"
import { getAdminInfo, setAdminInfo, type AdminInfo } from "@/lib/auth"
import { toast } from "sonner"

export default function ProfilePage() {
  const [adminInfo, setAdminInfoState] = useState<AdminInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    department: "",
  })

  useEffect(() => {
    const info = getAdminInfo()
    if (info) {
      setAdminInfoState(info)
      setFormData({
        first_name: info.first_name || "",
        last_name: info.last_name || "",
        email: info.email || "",
        username: info.username || "",
        department: info.department || "",
      })
    }
  }, [])

  const handleSave = () => {
    if (adminInfo) {
      const updatedInfo: AdminInfo = {
        ...adminInfo,
        ...formData,
      }
      setAdminInfo(updatedInfo)
      setAdminInfoState(updatedInfo)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    }
  }

  const handleCancel = () => {
    if (adminInfo) {
      setFormData({
        first_name: adminInfo.first_name || "",
        last_name: adminInfo.last_name || "",
        email: adminInfo.email || "",
        username: adminInfo.username || "",
        department: adminInfo.department || "",
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {adminInfo
                  ? `${adminInfo.first_name || ""} ${adminInfo.last_name || ""}`.trim() || "Admin User"
                  : "Admin User"}
              </h2>
              <p className="text-sm text-muted-foreground">{adminInfo?.email || "admin@alphacom.com"}</p>
            </div>
            {adminInfo?.is_super_admin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Super Admin</span>
              </div>
            )}
          </div>
        </Card>

        {/* Profile Details Card */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Account Information</h3>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Settings Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
