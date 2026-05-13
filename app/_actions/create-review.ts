// Sprint 37.A (F8) — Server action createReview.
//
// Crée la row reviews en état PENDING. Le runReviewCheck est ensuite
// déclenché par le client pour remplir fact_check_payload + crédit.
//
// Le visuel (URL ou upload) est passé en paramètre. Pour un upload,
// le client a déjà stocké le fichier dans le bucket review-visuals
// avant d'appeler cette action (via supabase.storage.from(...) côté
// client) et nous transmet le path.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

export type CreateReviewInput = {
  title?: string
  postText?: string
  visualUrl?: string
  visualUploadedPath?: string
}

export type CreateReviewResult =
  | { ok: true; reviewId: string }
  | { ok: false; reason: string }

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function autoTitle(postText: string): string {
  const head = postText.trim().split(/\s+/).slice(0, 6).join(' ')
  if (head.length === 0) return 'Review sans titre'
  return head.length > 60 ? head.slice(0, 57) + '…' : head
}

export async function createReview(
  input: CreateReviewInput,
): Promise<CreateReviewResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const postText = (input.postText ?? '').trim()
  const visualUrl = (input.visualUrl ?? '').trim()
  const visualUploadedPath = (input.visualUploadedPath ?? '').trim()

  if (postText.length === 0 && visualUrl.length === 0 && visualUploadedPath.length === 0) {
    return { ok: false, reason: 'Fournis au moins un texte ou un visuel à vérifier' }
  }
  if (visualUrl.length > 0 && !isValidUrl(visualUrl)) {
    return { ok: false, reason: 'URL visuel invalide (http/https requis)' }
  }

  const title = (input.title ?? '').trim() || autoTitle(postText)

  // Création via admin (bypass RLS — on a déjà validé l'auth + tenant
  // côté server action).
  const admin = createAdmin()
  const adminReviews = admin as unknown as {
    from: (t: 'reviews') => {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data, error } = await adminReviews
    .from('reviews')
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      title,
      post_text: postText.length > 0 ? postText : null,
      visual_url: visualUrl.length > 0 ? visualUrl : null,
      visual_uploaded_path: visualUploadedPath.length > 0 ? visualUploadedPath : null,
      state: 'PENDING',
    })
    .select('id')
    .single()
  if (error || !data) {
    return { ok: false, reason: `Création échouée : ${error?.message ?? 'no row'}` }
  }

  return { ok: true, reviewId: data.id }
}
