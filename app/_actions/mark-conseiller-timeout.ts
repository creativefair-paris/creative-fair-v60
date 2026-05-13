// Sprint 37.B (F12) — Persistance de l'état ERROR_TIMEOUT.
//
// Quand le client détecte qu'aucun token Anthropic n'est arrivé en 15s,
// il bascule en ERROR_TIMEOUT côté UI. Cette server action propage
// l'état à la row conseiller_conversations.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

export type MarkTimeoutResult =
  | { ok: true }
  | { ok: false; reason: string }

export async function markConseillerTimeout(
  conversationId: string,
): Promise<MarkTimeoutResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  // Vérification RLS via select avant le bypass admin de l'update.
  const { data: existing } = await supabase
    .from('conseiller_conversations')
    .select('id')
    .eq('id', conversationId)
    .maybeSingle()
  if (!existing) return { ok: false, reason: 'Conversation introuvable' }

  const admin = createAdmin()
  const adminConv = admin as unknown as {
    from: (t: 'conseiller_conversations') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const { error } = await adminConv
    .from('conseiller_conversations')
    .update({ state: 'ERROR_TIMEOUT' })
    .eq('id', conversationId)
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true }
}
