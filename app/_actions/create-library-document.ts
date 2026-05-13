// Sprint 37.A (F9.upload) — Server action createLibraryDocument.
//
// Reçoit un FormData (file + title + description + category), valide
// type + taille (10 MB max), upload dans le bucket library-uploads au
// path `<tenant_id>/<timestamp>_<safe-name>`, puis crée la row
// library_documents.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

const ACCEPTED_CATEGORIES = new Set(['presse', 'brief', 'archive', 'autre'])

export type CreateLibraryResult =
  | { ok: true; documentId: string }
  | { ok: false; reason: string }

export async function createLibraryDocument(
  formData: FormData,
): Promise<CreateLibraryResult> {
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
  const titleRaw = formData.get('title')
  const descriptionRaw = formData.get('description')
  const categoryRaw = formData.get('category')

  if (!(file instanceof File)) {
    return { ok: false, reason: 'Fichier manquant' }
  }
  if (file.size === 0) return { ok: false, reason: 'Fichier vide' }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, reason: `Fichier trop volumineux (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)` }
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    return {
      ok: false,
      reason: 'Type non supporté (PDF / DOCX / PNG / JPG / JPEG / WEBP)',
    }
  }

  const category =
    typeof categoryRaw === 'string' && ACCEPTED_CATEGORIES.has(categoryRaw)
      ? categoryRaw
      : 'autre'

  const fallbackTitle = file.name.replace(/\.[^.]+$/, '')
  const title =
    typeof titleRaw === 'string' && titleRaw.trim().length > 0
      ? titleRaw.trim().slice(0, 200)
      : fallbackTitle.slice(0, 200) || 'Document sans titre'

  const description =
    typeof descriptionRaw === 'string' && descriptionRaw.trim().length > 0
      ? descriptionRaw.trim().slice(0, 1000)
      : null

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60)
  const path = `${tenantId}/${Date.now()}_${safeName}`

  // Upload via admin (bypass RLS — auth + tenant déjà validés).
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
  const { error: upErr } = await adminStorage.storage
    .from('library-uploads')
    .upload(path, buffer, { contentType: file.type, upsert: false })
  if (upErr) {
    return { ok: false, reason: `Upload échoué : ${upErr.message}` }
  }

  // Insert row.
  const adminDocs = admin as unknown as {
    from: (t: 'library_documents') => {
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
  const { data, error: insErr } = await adminDocs
    .from('library_documents')
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      title,
      description,
      category,
      file_path: path,
      file_type: file.type,
      file_size_bytes: file.size,
    })
    .select('id')
    .single()
  if (insErr || !data) {
    return { ok: false, reason: `Insert row échoué : ${insErr?.message ?? 'no row'}` }
  }

  return { ok: true, documentId: data.id }
}
