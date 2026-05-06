export type BrandVoice = {
  tone: string[]
  register: 'formal' | 'casual' | 'mixed'
  forbiddenWords: string[]
  encouragedWords: string[]
  sentenceStyle: string
}

export type BrandPersona = {
  name: string
  description: string
  aspirations: string
}

export type BrandAudience = {
  personas: BrandPersona[]
  aspirational: string
}

export type BrandTerritory = {
  id: string
  name: string
  description: string
  examples: string[]
}

export type BrandVisual = {
  colors: string[]
  fonts: string[]
  references: string[]
}

export type BrandGoals = {
  primary: string
  instagram: string
}

export type BrandIdentity = {
  name: string
  domain: string
  tagline?: string
  description: string
  history?: string
}

export type BrandBook = {
  identity: BrandIdentity
  voice: BrandVoice
  audience: BrandAudience
  territories: BrandTerritory[]
  visual: BrandVisual
  taboos: string[]
  goals: BrandGoals
}

export type Brand = {
  id: string
  tenant_id: string
  name: string
  brand_book: BrandBook | null
  business_calendar: unknown | null
  brand_book_status: 'incomplete' | 'complete'
  questions_answered: number
  created_at: string
  updated_at: string
}
