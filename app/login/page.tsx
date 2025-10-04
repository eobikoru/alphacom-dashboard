"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { loginAdmin, setAuthTokens, setAdminInfo } from "@/lib/auth"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      // Store tokens and admin info
      setAuthTokens(data.access_token, data.refresh_token)
      setAdminInfo(data.admin_info)

      // Show success message
      toast.success("Login successful!", {
        description: `Welcome back, ${data.admin_info.first_name}!`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error: any) => {
      // Handle login error
      const errorMessage = error.response?.data?.message || "Invalid credentials. Please try again."
      toast.error("Login failed", {
        description: errorMessage,
      })
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.username || !formData.password) {
      toast.error("Validation error", {
        description: "Please enter both username and password",
      })
      return
    }

    if (formData.password.length < 6) {
      toast.error("Validation error", {
        description: "Password must be at least 6 characters long",
      })
      return
    }

    // Trigger login mutation
    loginMutation.mutate({
      username: formData.username,
      password: formData.password,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">AlphaCom Admin</h1>
          <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your admin credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="admin@alphacom.com"
                  required
                  disabled={loginMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loginMutation.isPending}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                  disabled={loginMutation.isPending}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Demo Credentials</p>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Email:</strong>superadmin@alphacom.com </p>
                <p>
                  <strong>Password:</strong>SuperAdmin123!@#</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 AlphaCom Online. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
