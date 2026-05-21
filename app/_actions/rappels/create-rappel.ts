// Sprint 43-stable — Server Action : créer un rappel.
// Doctrine 04-MULTI_TENANT.md §4 pattern canonique (PAS createAdmin côté user).

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createRappel(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = String(formData.get('title') ?? '').trim()
  if (!title) {
    throw new Error('Le titre du rappel est requis.')
  }

  const dueAtRaw = String(formData.get('due_at') ?? '').trim()
  const dueAt = dueAtRaw.length > 0 ? new Date(dueAtRaw).toISOString() : null

  // Récupère tenant_id depuis profile (RLS standard)
  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileRaw as { tenant_id?: string } | null)?.tenant_id
  if (!tenantId) {
    throw new Error('Profil utilisateur incomplet (tenant manquant).')
  }

  // INSERT — RLS vérifie tenant_id = user_tenant_id() ET user_id = auth.uid()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reminders') as any).insert({
    tenant_id: tenantId,
    user_id: user.id,
    title,
    due_at: dueAt,
  })

  if (error) {
    throw new Error(`Erreur création rappel : ${error.message}`)
  }

  revalidatePath('/rappels')
}
