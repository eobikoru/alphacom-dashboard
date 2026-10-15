import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createBlogAuthor,
  createBlogCategory,
  createBlogFaq,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogFaq,
  deleteBlogComment,
  deleteBlogCover,
  deleteBlogPost,
  disableBlogPost,
  enableBlogPost,
  getApiErrorMessage,
  getBlogAuthors,
  getBlogCategories,
  getBlogComments,
  getBlogFaq,
  getBlogFaqs,
  getBlogPost,
  getBlogPosts,
  hideBlogComment,
  unhideBlogComment,
  updateBlogAuthorRole,
  updateBlogCategory,
  updateBlogFaq,
  updateBlogPost,
  updateBlogPostStatus,
  uploadBlogCover,
} from "@/lib/api/blog"
import type {
  BlogCategoryWrite,
  BlogFaqWrite,
  BlogPostStatus,
  BlogPostWrite,
  CreateBlogAuthorData,
  GetBlogCommentsParams,
  GetBlogPostsParams,
} from "@/types/blog"

export const blogKeys = {
  all: ["blog"] as const,
  posts: (params: GetBlogPostsParams) => ["blog", "posts", params] as const,
  post: (id: string) => ["blog", "post", id] as const,
  categories: ["blog", "categories"] as const,
  faqs: ["blog", "faqs"] as const,
  faq: (id: string) => ["blog", "faq", id] as const,
  comments: (params: GetBlogCommentsParams) => ["blog", "comments", params] as const,
  authors: ["blog", "authors"] as const,
}

function invalidatePosts(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["blog", "posts"] })
  if (id) queryClient.invalidateQueries({ queryKey: blogKeys.post(id) })
}

export const useBlogPosts = (params: GetBlogPostsParams, enabled = true) => {
  return useQuery({
    queryKey: blogKeys.posts(params),
    queryFn: () => getBlogPosts(params),
    enabled,
  })
}

export const useBlogPost = (id: string) => {
  return useQuery({
    queryKey: blogKeys.post(id),
    queryFn: () => getBlogPost(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BlogPostWrite) => createBlogPost(data),
    onSuccess: () => {
      invalidatePosts(queryClient)
      toast.success("Post saved")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the post.")),
  })
}

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogPostWrite }) => updateBlogPost(id, data),
    onSuccess: (_post, variables) => {
      invalidatePosts(queryClient, variables.id)
      toast.success("Post updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not update the post.")),
  })
}

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      invalidatePosts(queryClient)
      toast.success("Post deleted")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not delete the post.")),
  })
}

export const useBlogPostStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: BlogPostStatus | "enable" | "disable" }) => {
      if (action === "enable") return enableBlogPost(id)
      if (action === "disable") return disableBlogPost(id)
      return updateBlogPostStatus(id, action)
    },
    onSuccess: (_post, variables) => {
      invalidatePosts(queryClient, variables.id)
      toast.success("Post status updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not change the post status.")),
  })
}

export const useUploadCoverImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadBlogCover(id, file),
    onSuccess: (_image, variables) => {
      invalidatePosts(queryClient, variables.id)
      toast.success("Cover image updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not upload the cover image.")),
  })
}

export const useDeleteCoverImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogCover(id),
    onSuccess: (_result, id) => {
      invalidatePosts(queryClient, id)
      toast.success("Cover image removed")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not remove the cover image.")),
  })
}

export const useBlogCategories = (enabled = true) => {
  return useQuery({
    queryKey: blogKeys.categories,
    queryFn: getBlogCategories,
    enabled,
  })
}

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BlogCategoryWrite) => createBlogCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories })
      toast.success("Category created")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not create the category.")),
  })
}

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogCategoryWrite }) => updateBlogCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories })
      toast.success("Category updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not update the category.")),
  })
}

export const useBlogFaqs = (enabled = true) => {
  return useQuery({
    queryKey: blogKeys.faqs,
    queryFn: getBlogFaqs,
    enabled,
  })
}

export const useBlogFaq = (id: string) => {
  return useQuery({
    queryKey: blogKeys.faq(id),
    queryFn: () => getBlogFaq(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export const useCreateBlogFaq = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BlogFaqWrite) => createBlogFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.faqs })
      toast.success("FAQ created")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not create the FAQ.")),
  })
}

export const useUpdateBlogFaq = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogFaqWrite }) => updateBlogFaq(id, data),
    onSuccess: (_faq, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.faqs })
      queryClient.invalidateQueries({ queryKey: blogKeys.faq(variables.id) })
      toast.success("FAQ updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not update the FAQ.")),
  })
}

export const useDeleteBlogFaq = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.faqs })
      toast.success("FAQ deleted")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not delete the FAQ.")),
  })
}

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories })
      toast.success("Category deleted")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not delete the category.")),
  })
}

export const useBlogComments = (params: GetBlogCommentsParams, enabled = true) => {
  return useQuery({
    queryKey: blogKeys.comments(params),
    queryFn: () => getBlogComments(params),
    enabled,
  })
}

export const useHideBlogComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hideBlogComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", "comments"] })
      toast.success("Comment hidden")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not hide that comment.")),
  })
}

export const useUnhideBlogComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unhideBlogComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", "comments"] })
      toast.success("Comment visible again")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not unhide that comment.")),
  })
}

export const useDeleteBlogComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", "comments"] })
      toast.success("Comment deleted")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not delete that comment.")),
  })
}

export const useBlogAuthors = (enabled = true) => {
  return useQuery({
    queryKey: blogKeys.authors,
    queryFn: getBlogAuthors,
    enabled,
  })
}

export const useCreateBlogAuthor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBlogAuthorData) => createBlogAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.authors })
      toast.success("Blog author created")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not create that author.")),
  })
}

export const useUpdateBlogAuthorRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isBlogAuthor }: { userId: string; isBlogAuthor: boolean }) =>
      updateBlogAuthorRole(userId, isBlogAuthor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.authors })
      toast.success("Author access updated")
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not update that author.")),
  })
}
