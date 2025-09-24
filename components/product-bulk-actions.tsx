"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, Edit, Archive, CheckCircle } from "lucide-react"

interface ProductBulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  onBulkStatusChange: (status: string) => void
}

export function ProductBulkActions({ selectedCount, onBulkDelete, onBulkStatusChange }: ProductBulkActionsProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Separator orientation="vertical" className="h-4" />

      <Select onValueChange={onBulkStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Change status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Set Active</span>
            </div>
          </SelectItem>
          <SelectItem value="draft">
            <div className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Set Draft</span>
            </div>
          </SelectItem>
          <SelectItem value="archived">
            <div className="flex items-center space-x-2">
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button variant="destructive" size="sm" onClick={onBulkDelete} className="flex items-center space-x-2">
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </Button>
    </div>
  )
}
