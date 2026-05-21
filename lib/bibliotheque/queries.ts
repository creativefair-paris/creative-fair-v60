// Sprint 43-stable — Queries Bibliothèque.
// Doctrine 04-MULTI_TENANT.md : RLS automatique via createClient().

import type { SupabaseClient } from '@supabase/supabase-js'
import type { BibliothequeItem } from '@/components/bibliotheque/BibliothequeGrille'

const PILIER_COLORS: Record<string, string> = {
  Anecdote: 'rgba(0, 122, 255, 0.45)',
  Produit: 'rgba(16, 185, 129, 0.45)',
  Événement: 'rgba(251, 146, 60, 0.55)',
  Manifeste: 'rgba(255, 59, 48, 0.45)',
  Coulisses: 'rgba(244, 114, 182, 0.45)',
}

const DEFAULT_PILIER_COLOR = 'rgba(167, 139, 250, 0.4)'

type PostRow = {
  id: string
  titre: string | null
  caption: string | null
  pilier_nom: string | null
  date_prevue: string | null
  statut: string | null
  created_at: string | null
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = Date.now()
  const diffDays = Math.floor((now - d.getTime()) / 86400000)
  if (diffDays < 1) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} j`
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function loadBibliothequeItems(
  supabase: SupabaseClient,
  filters: {
    pilier?: string
    filterKey?: 'all' | 'recents' | 'favoris' | 'archive'
  } = {},
): Promise<{
  items: BibliothequeItem[]
  totalCount: number
  recentCount: number
  piliersCount: Map<string, number>
}> {
  // RLS filtre automatiquement par tenant_id (doctrine 04-MULTI_TENANT.md)
  let query = supabase
    .from('posts')
    .select('id, titre, caption_complete, pilier_nom, date_prevue, statut, created_at')
    .in('statut', ['publie', 'published', 'published_external', 'archive'])
    .order('date_prevue', { ascending: false, nullsFirst: false })
    .limit(60)

  if (filters.pilier) {
    query = query.eq('pilier_nom', filters.pilier)
  }
  if (filters.filterKey === 'archive') {
    query = query.eq('statut', 'archive')
  }

  const { data } = await query

  const items: BibliothequeItem[] = ((data as Array<PostRow & { caption_complete: string | null }> | null) ?? []).map(
    (post) => ({
      id: post.id,
      title: post.titre ?? 'Sans titre',
      pillarLabel: post.pilier_nom,
      pillarColor: PILIER_COLORS[post.pilier_nom ?? ''] ?? DEFAULT_PILIER_COLOR,
      date: formatRelativeDate(post.date_prevue ?? post.created_at),
      caption: (post.caption_complete ?? post.titre)?.slice(0, 80),
    }),
  )

  // Comptages pour la sub-sidebar
  const totalCount = items.length
  const recentCount = items.filter((i) => i.date === "aujourd'hui" || i.date === 'hier').length
  const piliersCount = new Map<string, number>()
  for (const item of items) {
    if (item.pillarLabel) {
      piliersCount.set(item.pillarLabel, (piliersCount.get(item.pillarLabel) ?? 0) + 1)
    }
  }

  return { items, totalCount, recentCount, piliersCount }
}

export { PILIER_COLORS, DEFAULT_PILIER_COLOR }
