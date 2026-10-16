"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Newsreader } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { loginAdmin, setAuthTokens, setAdminInfo } from "@/lib/auth"
import { getDashboardAccess } from "@/lib/roles"
import { toast } from "sonner"

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
})

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

      const access = getDashboardAccess(data.admin_info)
      router.push(access.blogAuthorOnly ? "/blog" : "/dashboard")
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || "Invalid credentials. Please try again."
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
    <div className="min-h-screen bg-[#f6f3ee] text-[#1c1916] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <aside className="relative hidden overflow-hidden bg-[#12110f] text-[#f4efe6] lg:flex lg:flex-col lg:px-16 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(196,165,116,0.2),transparent_46%)]" />
        <div className="pointer-events-none absolute top-24 -right-24 size-[28rem] rounded-full border border-[#c4a574]/30" />
        <div className="pointer-events-none absolute top-40 -right-8 size-[18rem] rounded-full border border-white/10" />
        <p
          className={`${display.className} pointer-events-none absolute right-8 bottom-0 select-none text-[18rem] leading-none text-white/[0.04]`}
        >
          A
        </p>

        <div className="relative">
          <img src="/alphacom-mark.png" alt="AlphaCom" className="h-14 w-auto" />
          <div className="mt-8 h-px w-12 bg-[#c4a574]" />
        </div>

        <div className="relative mt-20 max-w-lg">
          <h1 className={`${display.className} text-[4.5rem] leading-[0.92] font-normal tracking-tight text-balance`}>
            The house,
            <br />
            <span className="italic text-[#e7d7b8]">held in order.</span>
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-7 text-[#b7aea3]">
            Catalogue, orders, and the journal. A private desk for the people who keep AlphaCom running.
          </p>
        </div>

        <div className="relative mt-auto flex items-end justify-between pt-16 text-[11px] tracking-[0.22em] text-[#8d8478] uppercase">
          <span>Lagos</span>
          <span>Online</span>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <img src="/alphacom-logo.png" alt="AlphaCom Tech & Gadgets" className="mb-8 h-12 w-auto lg:hidden" />
          <p className="hidden text-[11px] tracking-[0.38em] text-[#8a7352] uppercase lg:block">Private access</p>
          <h2 className={`${display.className} mt-4 text-5xl leading-none font-normal`}>Sign in</h2>
          <p className="mt-4 text-sm leading-6 text-[#6f675f]">Use the credentials issued for your desk.</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            <div className="space-y-2.5">
              <Label htmlFor="username" className="text-[11px] tracking-[0.22em] text-[#6f675f] uppercase">
                Username or email
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="name@alphacom.com"
                required
                disabled={loginMutation.isPending}
                className="h-12 rounded-none border-[#e4ddd2] bg-white px-4 text-[15px] shadow-none placeholder:text-[#b3aaa0] focus-visible:border-[#1c1916] focus-visible:ring-[#1c1916]/15"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-[11px] tracking-[0.22em] text-[#6f675f] uppercase">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  disabled={loginMutation.isPending}
                  minLength={6}
                  className="h-12 rounded-none border-[#e4ddd2] bg-white px-4 pr-12 text-[15px] shadow-none placeholder:text-[#b3aaa0] focus-visible:border-[#1c1916] focus-visible:ring-[#1c1916]/15"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center text-[#6f675f] transition-colors hover:text-[#1c1916] disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                disabled={loginMutation.isPending}
                className="rounded-none border-[#cfc6ba] data-[state=checked]:border-[#1c1916] data-[state=checked]:bg-[#1c1916]"
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal text-[#4e4842]">
                Keep this desk open for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="h-12 w-full rounded-none bg-[#1c1916] text-[13px] tracking-[0.22em] text-[#f6f3ee] uppercase hover:bg-[#2a2622]"
            >
              {loginMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {loginMutation.isPending ? "Signing in" : "Enter"}
            </Button>
          </form>

          <p className="pt-12 text-[11px] tracking-[0.18em] text-[#9a9188] uppercase">© 2026 AlphaCom Online</p>
        </div>
      </main>
    </div>
  )
}
