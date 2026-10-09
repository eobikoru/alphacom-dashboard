"use client"

import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import type { BlogListResult } from "@/types/blog"

export function ListPager({
  result,
  page,
  perPage,
  onPage,
}: {
  result?: BlogListResult<unknown>
  page: number
  perPage: number
  onPage: (page: number) => void
}) {
  if (!result) return null
  if (result.totalKnown) {
    return (
      <Pagination
        currentPage={page}
        totalPages={Math.max(result.pages, 1)}
        totalItems={result.total}
        itemsPerPage={result.per_page || perPage}
        onPageChange={onPage}
      />
    )
  }
  if (page === 1 && result.items.length < perPage) return null
  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={result.items.length < perPage} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  )
}
