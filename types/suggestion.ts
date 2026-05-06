export type PostTypeAi =
  | 'anecdote_live'
  | 'anecdote_custom'
  | 'story'
  | 'reels'

export type Suggestion = {
  eventName: string
  postType: PostTypeAi
  angle: string
  hook: string
  recommendedDate: string
  rationale: string
}

export type SuggestionsResponse = {
  ok: true
  suggestions: Suggestion[]
}
