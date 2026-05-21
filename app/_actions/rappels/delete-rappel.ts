// Sprint 43-stable — Server Action : supprimer un rappel.
// Doctrine 04-MULTI_TENANT.md §4 pattern canonique.

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function deleteRappel(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = String(formData.get('id') ?? '')
  if (!id) {
    throw new Error('ID du rappel manquant.')
  }

  // DELETE — RLS vérifie tenant_id + user_id = auth.uid()
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) {
    throw new Error(`Erreur suppression rappel : ${error.message}`)
  }

  revalidatePath('/rappels')
}
