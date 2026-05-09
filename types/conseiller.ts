// Types conseiller — Sprint 32.5

export type ConseillerMessageRole = 'user' | 'assistant' | 'system'

export type ConseillerMessage = {
  id: string
  role: ConseillerMessageRole
  content: string
  createdAt: string
}

export type ConseillerConversation = {
  id: string
  tenantId: string
  brandId: string
  title: string
  messages: ConseillerMessage[]
  createdAt: string
  updatedAt: string
}
