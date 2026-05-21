// Sprint 43-stable — Queries Calendrier
// Doctrine 04-MULTI_TENANT.md : RLS auto via createClient()

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CalendarPost } from '@/components/calendrier/CalendrierVueMois'

const PILIER_COLORS: Record<string, string> = {
  Anecdote: '#007AFF',
  Produit: '#10B981',
  Événement: '#FB923C',
  Manifeste: '#FF3B30',
  Coulisses: '#F472B6',
}

type PostRow = {
  id: string
  titre: string | null
  pilier_nom: string | null
  date_prevue: string | null
  heure_prevue: string | null
  statut: string | null
}

export async function loadCalendrierPosts(
  supabase: SupabaseClient,
  monthStart: Date,
  monthEnd: Date,
): Promise<CalendarPost[]> {
  const isoStart = monthStart.toISOString().slice(0, 10)
  const isoEnd = monthEnd.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('posts')
    .select('id, titre, pilier_nom, date_prevue, heure_prevue, statut')
    .gte('date_prevue', isoStart)
    .lte('date_prevue', isoEnd)
    .order('date_prevue', { ascending: true })

  return ((data as PostRow[] | null) ?? [])
    .filter((p): p is PostRow & { date_prevue: string } => p.date_prevue !== null)
    .map((p) => ({
      id: p.id,
      date: p.date_prevue,
      title: p.titre ?? 'Publication',
      pillarColor: PILIER_COLORS[p.pilier_nom ?? ''] ?? '#A78BFA',
      hour: p.heure_prevue,
    }))
}
