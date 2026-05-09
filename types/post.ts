// Types post — Sprint 32.5

export type PostKind = 'image' | 'carousel' | 'video' | 'text'

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type Post = {
  id: string
  tenantId: string
  brandId: string
  kind: PostKind
  status: PostStatus
  createdAt: string
  updatedAt: string
}
