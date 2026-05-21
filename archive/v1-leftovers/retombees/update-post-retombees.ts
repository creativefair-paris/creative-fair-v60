// Sprint 37 (Lot 7) — Server action de persistence du champ Retombées.
//
// Le champ est éditable uniquement quand le post est publié.
// Validation : 500 chars max, conforme à la migration 016.

'use server'

import { createClient } from '@/lib/supabase/server'

const MAX_LENGTH = 500

export type UpdateRetombeesResult =
  | { ok: true }
  | { ok: false; reason: string }

export async function updatePostRetombees(input: {
  postId: string
  retombees: string
}): Promise<UpdateRetombeesResult> {
  if (typeof input.postId !== 'string' || input.postId.length === 0) {
    return { ok: false, reason: 'postId manquant' }
  }
  const trimmed = input.retombees.trim()
  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, reason: `Maximum ${MAX_LENGTH} caractères` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  // Vérifier que le post existe + appartient au tenant (via RLS) +
  // statut = 'publie' (les autres statuts n'ont pas vocation à recevoir
  // des retombées). Le client UI ne devrait pas appeler cette action
  // pour un post non publié, mais on revérifie côté serveur.
  const { data: rawPost } = await supabase
    .from('posts')
    .select('id, statut')
    .eq('id', input.postId)
    .maybeSingle()
  const post = rawPost as { id: string; statut: string | null } | null
  if (!post) return { ok: false, reason: 'Post introuvable' }
  if (post.statut !== 'publie') {
    return { ok: false, reason: 'Retombées éditables uniquement sur posts publiés' }
  }

  // Le stub types/database.ts ne couvre pas la colonne retombees ajoutée
  // en migration 016 — cast lâche pour passer l'update (RLS reste appliquée).
  const updateClient = supabase as unknown as {
    from: (t: 'posts') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const { error } = await updateClient
    .from('posts')
    .update({ retombees: trimmed.length === 0 ? null : trimmed })
    .eq('id', input.postId)
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true }
}
