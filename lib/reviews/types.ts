// Sprint 37.A (F8) — Types Reviews partagés.

export type ReviewState = 'PENDING' | 'COMPLETED' | 'ARCHIVED'

export type FactCheckStatus = 'sourcable' | 'a_verifier' | 'non_sourcable'

export type FactCheckItem = {
  statement: string
  status: FactCheckStatus
  suggested_source?: string
}

export type VisualCredit = {
  auteur: string
  archive: string
  annee: string
  licence: string // domaine public | Creative Commons | sous droits | inconnu
  alternative?: string
}

export type ReviewPayload = {
  fact_check: ReadonlyArray<FactCheckItem>
  visual_credit: VisualCredit | null
  ready_to_paste_credit: string
}

export type ReviewRow = {
  id: string
  tenant_id: string
  user_id: string
  title: string | null
  post_text: string | null
  visual_url: string | null
  visual_uploaded_path: string | null
  fact_check_payload: unknown | null
  visual_credit_payload: unknown | null
  ready_to_paste_credit: string | null
  state: ReviewState
  created_at: string
  updated_at: string
}
