// Sprint 43-stable — Server Action : marquer un rappel comme complété/non complété.
// Doctrine 04-MULTI_TENANT.md §4 pattern canonique.

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function completeRappel(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = String(formData.get('id') ?? '')
  if (!id) {
    throw new Error('ID du rappel manquant.')
  }
  const completedRaw = formData.get('completed')
  const completed = completedRaw === 'true' || completedRaw === '1'

  // UPDATE — RLS vérifie tenant_id + user_id = auth.uid()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reminders') as any)
    .update({
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Erreur mise à jour rappel : ${error.message}`)
  }

  revalidatePath('/rappels')
}
