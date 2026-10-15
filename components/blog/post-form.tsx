"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { CoverImageField } from "@/components/blog/cover-image-field"
import { RichTextEditor } from "@/components/blog/rich-text-editor"
import { useDashboardAccess } from "@/components/dashboard-access"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useBlogCategories, useCreateBlogPost, useUpdateBlogPost, useUploadCoverImage } from "@/hooks/use-blog"
import { BLOG_SLUG_PATTERN, coverImageUrl, formatBlogDate, plainTextFromHtml, tagNames } from "@/lib/blog"
import type { BlogPost, BlogPostStatus, BlogPostWrite } from "@/types/blog"

interface PostFormProps {
  mode: "create" | "edit"
  post?: BlogPost
}

export function PostForm({ mode, post }: PostFormProps) {
  const router = useRouter()
  const access = useDashboardAccess()
  const categories = useBlogCategories(access.canModerateBlog)
  const createPost = useCreateBlogPost()
  const updatePost = useUpdateBlogPost()
  const uploadCover = useUploadCoverImage()

  const [title, setTitle] = useState(post?.title ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [status, setStatus] = useState<BlogPostStatus>(post?.status ?? "draft")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [authorName, setAuthorName] = useState(post?.author_name ?? "")
  const [categoryId, setCategoryId] = useState(post?.category_id || post?.category?.id || "")
  const [tags, setTags] = useState<string[]>(tagNames(post?.tags))
  const [tagDraft, setTagDraft] = useState("")
  const [isFeatured, setIsFeatured] = useState(Boolean(post?.is_featured))
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "")
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "")
  const [coverUrl, setCoverUrl] = useState<string | null>(coverImageUrl(post))
  const [pendingCover, setPendingCover] = useState<File | null>(null)

  const saving = createPost.isPending || updatePost.isPending || uploadCover.isPending
  const existingPublishedAt = post?.published_at ? new Date(post.published_at) : null
  const alreadyPublished =
    post?.status === "published" && existingPublishedAt !== null && existingPublishedAt.getTime() <= Date.now()
  const publishLabel = alreadyPublished && existingPublishedAt ? formatBlogDate(existingPublishedAt.toISOString()) : "Today"

  const addTag = (raw: string) => {
    const name = raw.trim()
    if (!name) return
    if (tags.some((tag) => tag.toLowerCase() === name.toLowerCase())) {
      setTagDraft("")
      return
    }
    if (tags.length >= 10) {
      toast.error("A post can have up to 10 tags.")
      return
    }
    setTags((current) => [...current, name])
    setTagDraft("")
  }

  const buildPayload = (): BlogPostWrite | null => {
    const nextTitle = title.trim()
    if (nextTitle.length < 3 || nextTitle.length > 200) {
      toast.error("The title needs to be between 3 and 200 characters.")
      return null
    }
    if (content.length > 200000) {
      toast.error("The post is too long.")
      return null
    }
    const text = plainTextFromHtml(content)
    if (!text && !/<img\s/i.test(content)) {
      toast.error("Write the post before saving.")
      return null
    }
    const nextSlug = slug.trim().toLowerCase()
    if (nextSlug && !BLOG_SLUG_PATTERN.test(nextSlug)) {
      toast.error("Slugs use lowercase letters, digits, and single hyphens.")
      return null
    }
    const payload: BlogPostWrite = {
      title: nextTitle,
      content,
      status,
      is_featured: isFeatured,
      tags,
    }

    if (status === "published") {
      payload.published_at = alreadyPublished && existingPublishedAt ? existingPublishedAt.toISOString() : new Date().toISOString()
    } else if (mode === "edit") {
      payload.published_at = null
    }

    if (excerpt.trim()) payload.excerpt = excerpt.trim()
    else if (mode === "edit") payload.excerpt = ""

    if (mode === "create") {
      if (nextSlug) payload.slug = nextSlug
    } else if (nextSlug && nextSlug !== (post?.slug ?? "")) {
      payload.slug = nextSlug
    }

    const byline = authorName.trim()
    if (byline) payload.author_name = byline

    if (access.canModerateBlog) payload.category_id = categoryId || null

    const nextMetaTitle = metaTitle.trim()
    const nextMetaDescription = metaDescription.trim()
    if (nextMetaTitle || mode === "edit") payload.meta_title = nextMetaTitle
    if (nextMetaDescription || mode === "edit") payload.meta_description = nextMetaDescription

    return payload
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    try {
      if (mode === "create") {
        const created = await createPost.mutateAsync(payload)
        if (!created?.id) {
          toast.error("The post was saved, but no id came back.")
          return
        }
        if (pendingCover) {
          try {
            await uploadCover.mutateAsync({ id: created.id, file: pendingCover })
          } catch {
            // The upload hook already reports the failure. The post itself is saved.
          }
        }
        router.push(`/blog/${created.id}`)
        return
      }

      if (!post?.id) return
      const updated = await updatePost.mutateAsync({ id: post.id, data: payload })
      if (updated?.slug) setSlug(updated.slug)
      if (typeof updated?.excerpt === "string") setExcerpt(updated.excerpt)
    } catch {
      // The mutation hook already reports the failure.
    }
  }

  const categoryOptions = (categories.data ?? []).filter((category) => category.is_active !== false || category.id === categoryId)

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/blog">
                <ArrowLeft className="size-4" />
                All posts
              </Link>
            </Button>
            {mode === "edit" && post?.id ? (
              <Button variant="ghost" size="sm" className="px-0" asChild>
                <Link href={`/blog/${post.id}`}>View</Link>
              </Button>
            ) : null}
          </div>
          <h1 className="text-2xl font-bold">{mode === "create" ? "New post" : "Edit post"}</h1>
          {post?.slug ? <p className="text-sm text-muted-foreground">/{post.slug}</p> : null}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Why we love Lagos tech"
              required
            />
            <p className="text-xs text-muted-foreground">{title.trim().length}/200 · at least 3 characters</p>
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Optional short summary"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Leave this blank on a new post to generate a summary. On an existing post, clear it and save to generate a new one.
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
              <CardDescription>
                {status === "published"
                  ? "This goes live today. The publish date is set for you."
                  : "The publish date is the day you set the status to published."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as BlogPostStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Publish date</p>
                <p className="text-sm text-muted-foreground">{status === "published" ? publishLabel : "Set when you publish"}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-author">Byline</Label>
                <Input
                  id="post-author"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder="Alphacom Team"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="post-featured">Featured</Label>
                <Switch id="post-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              {post ? (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{post.view_count ?? 0} views</span>
                  <span>{post.comment_count ?? 0} comments</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover</CardTitle>
            </CardHeader>
            <CardContent>
              <CoverImageField
                postId={post?.id}
                imageUrl={coverUrl}
                pendingFile={pendingCover}
                onPendingFile={setPendingCover}
                onImageUrlChange={setCoverUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {access.canModerateBlog ? (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : post?.category?.name ? (
                <p className="text-sm">
                  Category <span className="font-medium">{post.category.name}</span>
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="post-slug">Slug</Label>
                <Input
                  id="post-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="optional-custom-slug"
                />
                <p className="text-xs text-muted-foreground">
                  Changing the title does not change the URL. Edit this field to set a new slug. Leave it untouched to keep the current one.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-tag">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        className="text-xs"
                        aria-label={`Remove ${tag}`}
                        onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="post-tag"
                  value={tagDraft}
                  placeholder={tags.length >= 10 ? "10 tags is the limit" : "Type a tag and press Enter"}
                  disabled={tags.length >= 10}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault()
                      addTag(tagDraft.replace(/,/g, ""))
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search listing</CardTitle>
              <CardDescription>Optional title and description for search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta title</Label>
                <Input id="meta-title" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta description</Label>
                <Textarea id="meta-description" value={metaDescription} rows={3} onChange={(event) => setMetaDescription(event.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
