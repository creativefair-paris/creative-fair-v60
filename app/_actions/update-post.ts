// Sprint 37.E (F58) — Server action : update d'un post éditable.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export type UpdatePostInput = {
  postId: string
  pilier_nom?: string
  date_prevue?: string
  objectif_editorial?: string
  angle?: string
  caption_complete?: string
}

export type UpdatePostResult = { ok: true } | { ok: false; reason: string }

export async function updatePostFields(input: UpdatePostInput): Promise<UpdatePostResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (typeof input.pilier_nom === 'string') updates.pilier_nom = input.pilier_nom
  if (typeof input.date_prevue === 'string' && input.date_prevue.length > 0) {
    updates.date_prevue = input.date_prevue
  }
  if (typeof input.objectif_editorial === 'string') {
    updates.objectif_editorial = input.objectif_editorial
  }
  if (typeof input.angle === 'string') updates.angle = input.angle
  if (typeof input.caption_complete === 'string') {
    updates.caption_complete = input.caption_complete
  }
  if (Object.keys(updates).length <= 1) {
    return { ok: false, reason: 'Aucune modification fournie' }
  }

  const admin = createAdmin() as unknown as SupabaseClient
  const { error } = await admin.from('posts').update(updates).eq('id', input.postId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}
