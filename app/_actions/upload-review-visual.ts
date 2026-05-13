// Sprint 37.A (F8) — Server action d'upload de visuel pour Reviews.
//
// Accepte un FormData côté client avec `file` (File). Valide type +
// taille puis upload dans le bucket review-visuals au path
// `<tenant_id>/<reviewId>/<filename>`. Retourne le path stocké.

'use server'

import { createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export type UploadReviewVisualResult =
  | { ok: true; path: string }
  | { ok: false; reason: string }

export async function uploadReviewVisual(
  formData: FormData,
): Promise<UploadReviewVisualResult> {
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

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, reason: 'Fichier manquant' }
  }
  if (file.size === 0) {
    return { ok: false, reason: 'Fichier vide' }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, reason: `Fichier trop volumineux (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)` }
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    return { ok: false, reason: 'Type non supporté (PNG / JPG / JPEG / WEBP uniquement)' }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60)
  const path = `${tenantId}/${Date.now()}_${safeName}`

  const admin = createAdmin()
  const adminStorage = admin as unknown as {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          file: ArrayBuffer | Blob | File,
          options?: { contentType?: string; upsert?: boolean },
        ) => Promise<{
          data: { path: string } | null
          error: { message: string } | null
        }>
      }
    }
  }

  const buffer = await file.arrayBuffer()
  const { error } = await adminStorage.storage
    .from('review-visuals')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })
  if (error) {
    return { ok: false, reason: `Upload échoué : ${error.message}` }
  }

  return { ok: true, path }
}
