// Sprint 37.A (F9) — Agrégateur Bibliothèque.
//
// Charge en parallèle les 6 sources hétérogènes et les transforme
// en LibraryItem uniformes. RLS appliquée par chaque table (le
// pilote ne voit que les items de son tenant).

import type { SupabaseClient } from '@supabase/supabase-js'
// Sprint 40 Phase 2B — ConversationPreview retiré (Conseiller V1 dégagé Blocs 1-9).
import type {
  BrandBookPreview,
  DocumentPreview,
  LibraryItem,
  PostPreview,
  ProgrammePreview,
  ReviewPreview,
} from './types'

function trim(value: unknown, max = 200): string {
  if (typeof value !== 'string') return ''
  return value.length > max ? value.slice(0, max) : value
}

function safeStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

async function loadDocuments(supabase: SupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('library_documents')
    .select('id, title, description, category, file_path, file_type, file_size_bytes, created_at')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('[library/queries] loadDocuments failed:', error.message)
    return []
  }
  return (data ?? []).map((r) => {
    const row = r as {
      id: string
      title: string
      description: string | null
      category: string | null
      file_path: string
      file_type: string
      file_size_bytes: number | null
      created_at: string
    }
    const preview: DocumentPreview = {
      kind: 'document',
      file_path: row.file_path,
      file_type: row.file_type,
      file_size_bytes: row.file_size_bytes,
      description: row.description,
      category_label: row.category ?? 'autre',
    }
    return {
      id: row.id,
      category: 'document',
      title: row.title,
      date: row.created_at,
      status: 'archived',
      subtitle: row.category ?? 'autre',
      searchIndex: `${row.title} ${row.description ?? ''} ${row.category ?? ''}`.toLowerCase(),
      preview,
    }
  })
}

async function loadBrandBook(supabase: SupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, secteur, ton, singularite, updated_at, brand_book_status')
    .limit(1)
    .maybeSingle()
  if (error || !data) return []
  const row = data as {
    id: string
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    updated_at: string
    brand_book_status: string | null
  }
  if (row.brand_book_status !== 'complete') return []
  const preview: BrandBookPreview = {
    kind: 'brand-book',
    nom: row.name,
    secteur: row.secteur,
    ton: row.ton,
    singularite: row.singularite,
  }
  return [
    {
      id: row.id,
      category: 'brand-book',
      title: row.name ?? 'Brand book',
      date: row.updated_at,
      status: 'published',
      subtitle: row.secteur ?? undefined,
      searchIndex: `${row.name ?? ''} ${row.secteur ?? ''} ${row.ton ?? ''} ${row.singularite ?? ''}`.toLowerCase(),
      preview,
    },
  ]
}

async function loadPosts(supabase: SupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, titre, type_contenu, pilier_nom, date_prevue, statut, contenu_genere, retombees, created_at',
    )
    .eq('statut', 'publie')
    .order('date_prevue', { ascending: false })
    .limit(100)
  if (error) {
    console.warn('[library/queries] loadPosts failed:', error.message)
    return []
  }
  return (data ?? []).map((r) => {
    const row = r as {
      id: string
      titre: string | null
      type_contenu: string | null
      pilier_nom: string | null
      date_prevue: string | null
      statut: string
      contenu_genere: unknown | null
      retombees: string | null
      created_at: string
    }
    const preview: PostPreview = {
      kind: 'post',
      titre: row.titre,
      type_contenu: row.type_contenu,
      pilier_nom: row.pilier_nom,
      date_prevue: row.date_prevue,
      contenu_genere: row.contenu_genere,
      retombees: row.retombees,
    }
    return {
      id: row.id,
      category: 'post',
      title: row.titre ?? 'Post sans titre',
      date: row.date_prevue ?? row.created_at,
      status: 'published',
      subtitle: [row.pilier_nom, row.type_contenu].filter(Boolean).join(' · ') || undefined,
      searchIndex: `${row.titre ?? ''} ${row.pilier_nom ?? ''} ${row.type_contenu ?? ''} ${
        typeof row.contenu_genere === 'string' ? trim(row.contenu_genere) : ''
      }`.toLowerCase(),
      preview,
    }
  })
}

// Sprint 40 Phase 2B — loadConversations() retiré (Conseiller V1 dégagé Blocs 1-9).
// La table conseiller_conversations sera dropée/repurposée Sprint 41 schéma dédié.

async function loadReviews(supabase: SupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, title, post_text, fact_check_payload, visual_credit_payload, ready_to_paste_credit, state, created_at',
    )
    .eq('state', 'COMPLETED')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn('[library/queries] loadReviews failed:', error.message)
    return []
  }
  return (data ?? []).map((r) => {
    const row = r as {
      id: string
      title: string | null
      post_text: string | null
      fact_check_payload: unknown
      visual_credit_payload: unknown
      ready_to_paste_credit: string | null
      state: string
      created_at: string
    }
    const preview: ReviewPreview = {
      kind: 'review',
      post_text: row.post_text,
      fact_check_payload: row.fact_check_payload,
      visual_credit_payload: row.visual_credit_payload,
      ready_to_paste_credit: row.ready_to_paste_credit,
    }
    return {
      id: row.id,
      category: 'review',
      title: row.title ?? 'Review sans titre',
      date: row.created_at,
      status: 'published',
      subtitle: 'Vérifié',
      searchIndex: `${row.title ?? ''} ${trim(row.post_text, 500)}`.toLowerCase(),
      preview,
    }
  })
}

async function loadProgrammes(supabase: SupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('programmes')
    .select('id, date_debut, date_fin, arc_narratif, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn('[library/queries] loadProgrammes failed:', error.message)
    return []
  }
  return (data ?? []).map((r) => {
    const row = r as {
      id: string
      date_debut: string | null
      date_fin: string | null
      arc_narratif: unknown
      status: string | null
      created_at: string
    }
    const preview: ProgrammePreview = {
      kind: 'programme',
      date_debut: row.date_debut,
      date_fin: row.date_fin,
      arc_narratif: row.arc_narratif,
    }
    const arc = row.arc_narratif as { semaines?: Array<{ theme?: string }> } | null
    const arcText =
      arc?.semaines?.[0]?.theme ??
      `Programme ${row.date_debut ?? ''} → ${row.date_fin ?? ''}`.trim()
    return {
      id: row.id,
      category: 'programme',
      title: arcText,
      date: row.created_at,
      status: row.status === 'active' ? 'published' : 'archived',
      subtitle: row.date_debut && row.date_fin ? `${row.date_debut} → ${row.date_fin}` : undefined,
      searchIndex: `${arcText} ${row.date_debut ?? ''} ${row.date_fin ?? ''}`.toLowerCase(),
      preview,
    }
  })
}

export async function loadLibrary(supabase: SupabaseClient): Promise<LibraryItem[]> {
  // Sprint 40 Phase 2B — loadConversations retiré.
  const [docs, brand, posts, reviews, progs] = await Promise.all([
    loadDocuments(supabase),
    loadBrandBook(supabase),
    loadPosts(supabase),
    loadReviews(supabase),
    loadProgrammes(supabase),
  ])
  return [...brand, ...docs, ...posts, ...reviews, ...progs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
