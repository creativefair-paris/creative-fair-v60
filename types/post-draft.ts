export type PostDraft = {
  hook?: string
  angle?: string
  rationale?: string
  eventName?: string
  actualite?: string
  slides?: string[]
  caption?: string
  hashtags?: string[]
  brief?: string
  briefFormat?: 'reels' | 'story' | 'newsletter'
}

export type PostType =
  | 'anecdote_live'
  | 'anecdote_custom'
  | 'reels'
  | 'story'
  | 'newsletter'
  | 'unsupported'

export type PostStatus =
  | 'draft'
  | 'in_progress'
  | 'ready'
  | 'scheduled'
  | 'published'

export type PostRecord = {
  id: string
  brand_id: string
  tenant_id: string
  scheduled_for: string | null
  status: PostStatus
  type: PostType | null
  channel: string | null
  business_event_id: string | null
  content: PostDraft | null
}
