// Sprint 37.A (F8) — Requêtes Supabase Reviews.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReviewRow, ReviewState } from './types'

type RawReview = {
  id: string
  tenant_id: string
  user_id: string
  title: string | null
  post_text: string | null
  visual_url: string | null
  visual_uploaded_path: string | null
  fact_check_payload: unknown
  visual_credit_payload: unknown
  ready_to_paste_credit: string | null
  state: string
  created_at: string
  updated_at: string
}

function fromRow(row: RawReview): ReviewRow {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    title: row.title,
    post_text: row.post_text,
    visual_url: row.visual_url,
    visual_uploaded_path: row.visual_uploaded_path,
    fact_check_payload: row.fact_check_payload ?? null,
    visual_credit_payload: row.visual_credit_payload ?? null,
    ready_to_paste_credit: row.ready_to_paste_credit,
    state: row.state as ReviewState,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function listReviews(
  supabase: SupabaseClient,
  limit = 100,
): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, tenant_id, user_id, title, post_text, visual_url, visual_uploaded_path, fact_check_payload, visual_credit_payload, ready_to_paste_credit, state, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('[reviews/queries] listReviews failed:', error.message)
    return []
  }
  return ((data ?? []) as RawReview[]).map(fromRow)
}
