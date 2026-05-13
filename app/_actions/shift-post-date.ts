// Sprint 36.G — Server action : reporter/avancer un post de ±N jours.
//
// Persistance simple via UPDATE posts.date_prevue. Pas de validation
// Conseiller pour V1 (au-delà de ±3 jours, le menu redirige vers
// /conseiller — côté UI uniquement).

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type Result =
  | { ok: true; newDatePrevue: string }
  | { ok: false; reason: 'unauthenticated' | 'not_found' | 'invalid_shift' | 'forbidden' | 'update_failed' }

const MAX_SHIFT_DAYS = 3

export async function shiftPostDate(postId: string, shiftDays: number): Promise<Result> {
  // Garde-fou périmètre menu contextuel (±3 jours).
  if (!Number.isInteger(shiftDays) || Math.abs(shiftDays) > MAX_SHIFT_DAYS || shiftDays === 0) {
    return { ok: false, reason: 'invalid_shift' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'unauthenticated' }

  // Lecture du tenant_id du user via profile.
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'forbidden' }

  // Lecture du post + vérification appartenance tenant via admin
  // (les UPDATE de date_prevue ne sont pas couverts par les policies
  // user — on bypass RLS avec admin après check explicite).
  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: 'posts') => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { id: string; tenant_id: string; date_prevue: string } | null
            error: { message: string } | null
          }>
        }
      }
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  const { data: post } = await adminTyped
    .from('posts')
    .select('id, tenant_id, date_prevue')
    .eq('id', postId)
    .maybeSingle()
  if (!post) return { ok: false, reason: 'not_found' }
  if (post.tenant_id !== tenantId) return { ok: false, reason: 'forbidden' }

  // Calcul nouvelle date.
  const current = new Date(`${post.date_prevue}T00:00:00`)
  if (Number.isNaN(current.getTime())) return { ok: false, reason: 'update_failed' }
  current.setDate(current.getDate() + shiftDays)
  const newDatePrevue = current.toISOString().slice(0, 10) // YYYY-MM-DD

  const { error: updErr } = await adminTyped
    .from('posts')
    .update({ date_prevue: newDatePrevue, updated_at: new Date().toISOString() })
    .eq('id', postId)
  if (updErr) return { ok: false, reason: 'update_failed' }

  // Invalide les caches Next côté serveur — /aujourd-hui refetch au prochain render.
  revalidatePath('/aujourd-hui')
  return { ok: true, newDatePrevue }
}
