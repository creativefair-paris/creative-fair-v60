// Types outils (Moodboard, Variations, Reviews, Post Creator) — Sprint 32.5

export type OutilKind = 'post-creator' | 'moodboard' | 'variations' | 'reviews' | 'conseiller'

export type MoodboardInput = {
  brandId: string
  prompt: string
  styleRefs?: string[]
}

export type MoodboardResult = {
  images: string[]
  prompt: string
}

export type VariationsInput = {
  brandId: string
  source: string
  mode: 'pose' | 'depth'
  count?: number
}

export type VariationsResult = {
  images: string[]
}

export type ReviewItem = {
  id: string
  source: string
  rating?: number
  excerpt: string
  publishedAt: string
}
