// Sprint 37.A (F9) — Types Bibliothèque.
//
// Un LibraryItem agrège les sources hétérogènes (uploads pilote,
// posts publiés, reviews complétées, programmes générés) sous une
// forme commune pour le listing et le segmented control.
//
// Sprint 40 Phase 2B — catégorie 'conversation' retirée (Bloc 1-9 :
// Conseiller V1 dégagé, plus de conversations à indexer).

export type LibraryCategory =
  | 'brand-book'
  | 'document'
  | 'post'
  | 'review'
  | 'programme'

export type LibraryStatus = 'draft' | 'published' | 'archived' | 'pending'

export type LibraryItem = {
  // ID unique au sein de la catégorie (id Supabase).
  id: string
  category: LibraryCategory
  title: string
  // Date d'évènement principale (created_at de la row source).
  date: string
  // Status visuel (pour le badge).
  status: LibraryStatus
  // Méta-données affichables dans la liste (sous-titre).
  subtitle?: string
  // Texte indexé pour la recherche full-text V1 (titre + subtitle +
  // contenu court). Sprint 38 passera à pgvector + RAG.
  searchIndex: string
  // Payload pour le rendu preview (variable selon catégorie — typé
  // côté preview).
  preview: unknown
}

// Onglet de filtre (segmented control).
export type LibraryTab =
  | 'all'
  | 'brand-book'
  | 'document'
  | 'post'
  | 'review'
  | 'programme'

export function categoryLabel(c: LibraryCategory): string {
  switch (c) {
    case 'brand-book':
      return 'Brand book'
    case 'document':
      return 'Document'
    case 'post':
      return 'Post'
    case 'review':
      return 'Review'
    case 'programme':
      return 'Programme'
  }
}

export function tabLabel(t: LibraryTab): string {
  if (t === 'all') return 'Tous'
  if (t === 'document') return 'Documents'
  if (t === 'post') return 'Posts'
  if (t === 'review') return 'Reviews'
  if (t === 'programme') return 'Programmes'
  return 'Brand book'
}

export function statusBadgeClass(s: LibraryStatus): string {
  switch (s) {
    case 'draft':
      return 'status-badge status-badge--draft'
    case 'published':
      return 'status-badge status-badge--published'
    case 'archived':
      return 'status-badge status-badge--archived'
    case 'pending':
      return 'status-badge status-badge--pending'
  }
}

export function statusLabel(s: LibraryStatus): string {
  switch (s) {
    case 'draft':
      return 'brouillon'
    case 'published':
      return 'publié'
    case 'archived':
      return 'archivé'
    case 'pending':
      return 'en cours'
  }
}

// ── Preview payloads typés par catégorie ─────────────────────────────────

export type DocumentPreview = {
  kind: 'document'
  file_path: string
  file_type: string
  file_size_bytes: number | null
  description: string | null
  category_label: string
}

export type BrandBookPreview = {
  kind: 'brand-book'
  nom: string | null
  secteur: string | null
  ton: string | null
  singularite: string | null
}

export type PostPreview = {
  kind: 'post'
  titre: string | null
  type_contenu: string | null
  pilier_nom: string | null
  date_prevue: string | null
  contenu_genere: unknown | null
  retombees: string | null
}

// Sprint 40 Phase 2B — ConversationPreview retiré (concept Conseiller V1 dégagé).

export type ReviewPreview = {
  kind: 'review'
  post_text: string | null
  fact_check_payload: unknown | null
  visual_credit_payload: unknown | null
  ready_to_paste_credit: string | null
}

export type ProgrammePreview = {
  kind: 'programme'
  date_debut: string | null
  date_fin: string | null
  arc_narratif: unknown | null
}
