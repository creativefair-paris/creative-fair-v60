// Types programme — Sprint 32.5 (base) + Sprint 36.A (extension flux inversé Marcus)
// Source : §15.8 Cahier des charges v2.0 + Sprint 36.A Chantier C.4

export type ProgrammePeriode = 'semaine' | 'mois' | 'trimestre'

export type ProgrammeStatus = 'active' | 'archived'

export type ArcNarratifSemaine = {
  theme: string
  posts: unknown[]
}

export type ArcNarratif = {
  semaines: ArcNarratifSemaine[]
}

export type Programme = {
  id: string
  brandId: string
  tenantId: string
  periode: ProgrammePeriode
  arcNarratif: ArcNarratif
  contextGeneration: Record<string, unknown>
  status: ProgrammeStatus
  createdAt: string
  updatedAt: string
}

// ── Sprint 36.A — Flux inversé Marcus ─────────────────────────────────────────

export interface PilierNarratif {
  nom: string
  description: string
  ratio_suggere: number
  // Sprint 36.C — JSONB optionnels (édition individuelle, rétro-compatibilité).
  mots_cles?: string[]
  couleur?: string
}

export interface BrandData {
  id: string
  tenantId: string
  nom: string
  secteur: string
  ton: string
  singularite: string
}

export type Jour =
  | 'lundi'
  | 'mardi'
  | 'mercredi'
  | 'jeudi'
  | 'vendredi'
  | 'samedi'
  | 'dimanche'

export type TypeContenu = 'photo' | 'carousel' | 'video' | 'texte'

export interface PostPrevu {
  pilier_nom: string
  jour: Jour
  date_relative: string
  titre: string
  angle: string
  type: TypeContenu
  heure_suggeree: string
}

export interface ResponseProgrammeInitial {
  comprehension: string
  piliers: PilierNarratif[]
  arc_narratif: string
  posts: PostPrevu[]
}

// Post tel que persisté en base (table posts, Sprint 36.A)
export interface PostRow {
  id: string
  programme_id: string
  tenant_id: string
  brand_id: string
  pilier_nom: string
  jour: Jour
  date_prevue: string
  heure_prevue: string
  titre: string
  angle: string
  type_contenu: TypeContenu
  statut: 'planifie' | 'genere' | 'publie' | 'archive'
  contenu_genere: unknown
  created_at: string
  updated_at: string
}
