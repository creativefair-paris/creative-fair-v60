// Sprint 43-stable — Server Action : mise à jour profil utilisateur.
// Doctrine 04-MULTI_TENANT.md §4 pattern canonique (PAS createAdmin côté user).

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const name = String(formData.get('name') ?? '').trim()
  const language = String(formData.get('language') ?? 'fr')

  if (!name) {
    throw new Error('Le nom est requis.')
  }

  // RLS s'applique automatiquement : un user ne peut UPDATE que son propre profile.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update({
      full_name: name,
      language,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Erreur lors de la mise à jour : ${error.message}`)
  }

  revalidatePath('/compte')
}
