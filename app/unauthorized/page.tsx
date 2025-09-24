"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-destructive-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this resource</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Insufficient Permissions</CardTitle>
            <CardDescription>
              Your account doesn't have the required permissions to access this admin feature. Please contact your
              system administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In with Different Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
