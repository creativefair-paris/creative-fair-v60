// Sprint 36.B.2 → 36.B.3 — Types des 14 blocs Ma Marque.
// Source unique de vérité pour le front, les endpoints et les validations IA.
// 36.B.3 ajoute : Cible, UniversRefuse, Benchmarks, Canaux, BrandBook, Archives.

export type MomentBusinessType = 'lancement' | 'evenement' | 'operation' | 'saison'

export type MomentBusiness = {
  id: string
  titre: string
  date_debut: string // ISO YYYY-MM-DD
  date_fin?: string
  type: MomentBusinessType
  // Sprint 36.B.3 — détails optionnels, stockés dans le même JSONB.
  importance?: 'mineur' | 'structurant' | 'majeur'
  pilier_id?: string
  visibilite?: 'public' | 'confidentiel'
  notes?: string
}

export type Objectif = {
  id: string
  label: string
  priorite: 1 | 2 | 3 // 1 = prioritaire (ordre dans la liste = priorité)
}

export type CapaciteProduction = 'aucune' | 'occasionnelle' | 'reguliere' | 'soutenue'

export type Ressources = {
  photo: CapaciteProduction
  video: CapaciteProduction
  terrain: boolean
  studio: boolean
}

export type PilierEditable = {
  id: string
  nom: string
  description: string
  ratio_suggere: number // 0 à 1
}

// Propositions retournées par /api/ma-marque/propositions
export type PropositionCalendrier = {
  titre: string
  type: MomentBusinessType
}

export type PropositionObjectif = {
  label: string
  priorite_suggeree: 1 | 2 | 3
}

export type PropositionRessources = {
  description: string
  hint: Partial<Ressources>
}

export type PropositionsResponse<T> =
  | { propositions: T[]; error?: never }
  | { propositions: T[]; error: 'timeout' | 'api_failed' | 'invalid_response' }

// Helpers vides (utilisés pour défauts UI + comparaisons "bloc vide")

export const RESSOURCES_VIDES: Ressources = {
  photo: 'aucune',
  video: 'aucune',
  terrain: false,
  studio: false,
}

export function ressourcesEstVide(r: Ressources | null | undefined): boolean {
  if (!r) return true
  // Défense en profondeur : brands legacy avec default '{}' ont des champs undefined.
  return (
    (r.photo === 'aucune' || r.photo == null) &&
    (r.video === 'aucune' || r.video == null) &&
    !r.terrain &&
    !r.studio
  )
}

// ── Sprint 36.B.3 — Nouveaux blocs Ma Marque ─────────────────────────

// Cible : texte libre — pas de type spécifique, juste string.
// UniversRefuse : idem.

export type Benchmark = {
  id: string
  nom: string
  raison: string // max 200 char
}

export const BENCHMARKS_VIDES: Benchmark[] = []

export function benchmarksEstVide(b: Benchmark[] | null | undefined): boolean {
  return !b || b.length === 0
}

// Canaux : 4 destinations adjacentes V1 (LinkedIn, Newsletter, Site, GMB).
// TikTok / X / YouTube / Facebook : refus assumé V1.

// Sprint 36.B.5 — Instagram ajouté comme canal principal V1.
// Instagram est toujours actif (canal principal de Creative Fair) — il
// peut avoir une URL/handle vide mais reste compté comme "présent".
export type CanalId = 'instagram' | 'linkedin' | 'newsletter' | 'site' | 'gmb'

export type CanalConfig = {
  actif: boolean
  url: string // handle ou URL complète
}

export type Canaux = Record<CanalId, CanalConfig>

export const CANAUX_VIDES: Canaux = {
  instagram:  { actif: true,  url: '' }, // canal principal — actif par défaut
  linkedin:   { actif: false, url: '' },
  newsletter: { actif: false, url: '' },
  site:       { actif: false, url: '' },
  gmb:        { actif: false, url: '' },
}

export const CANAUX_LABELS: Record<CanalId, string> = {
  instagram:  'Instagram',
  linkedin:   'LinkedIn',
  newsletter: 'Newsletter',
  site:       'Site web',
  gmb:        'Google My Business',
}

// Ordre : Instagram en tête (canal principal), puis extensions V1.
export const CANAUX_ORDRE: CanalId[] = ['instagram', 'linkedin', 'newsletter', 'site', 'gmb']

// Sprint 36.B.5 — Canaux Bientôt (waiting list).
export type CanalBientotId = 'tiktok' | 'x' | 'youtube' | 'facebook'

export const CANAUX_BIENTOT_LABELS: Record<CanalBientotId, string> = {
  tiktok:   'TikTok',
  x:        'X',
  youtube:  'YouTube',
  facebook: 'Facebook',
}

export const CANAUX_BIENTOT_ORDRE: CanalBientotId[] = ['tiktok', 'x', 'youtube', 'facebook']

export function canauxNormaliser(c: Partial<Canaux> | null | undefined): Canaux {
  if (!c) return CANAUX_VIDES
  return {
    // Instagram : actif par défaut sur les brands legacy sans la clé.
    // Si la clé existe (nouvelle structure), respecte le booléen.
    instagram:  c.instagram
      ? { actif: c.instagram.actif ?? true, url: c.instagram.url ?? '' }
      : { actif: true, url: '' },
    linkedin:   { actif: c.linkedin?.actif ?? false,   url: c.linkedin?.url ?? '' },
    newsletter: { actif: c.newsletter?.actif ?? false, url: c.newsletter?.url ?? '' },
    site:       { actif: c.site?.actif ?? false,       url: c.site?.url ?? '' },
    gmb:        { actif: c.gmb?.actif ?? false,        url: c.gmb?.url ?? '' },
  }
}

// Liste des canaux actifs avec URL renseignée. Instagram est toujours
// actif mais n'apparaît pas tant que son URL est vide (sinon un canal
// "actif sans handle" pollue la preview).
export function canauxActifs(c: Canaux): CanalId[] {
  return CANAUX_ORDRE.filter((id) => c[id]?.actif && (c[id]?.url ?? '').trim().length > 0)
}

// Pour la complétude Ma Marque : le bloc est "vide" si AUCUN canal (y
// compris Instagram) n'a d'URL renseignée.
export function canauxEstVide(c: Canaux | null | undefined): boolean {
  if (!c) return true
  return canauxActifs(canauxNormaliser(c)).length === 0
}

// Brand book : palette + typo + logo + dos / donts.

export type PaletteCouleur = {
  nom: string
  hex: string // #RRGGBB
}

export type BrandBookTypo = {
  principale: string
  secondaire?: string
  specimen_url?: string
}

export type BrandBook = {
  palette: PaletteCouleur[]
  typo: BrandBookTypo
  logo_url: string
  dos: string[]   // URLs Storage
  donts: string[] // URLs Storage
}

export const BRAND_BOOK_VIDE: BrandBook = {
  palette: [],
  typo: { principale: '' },
  logo_url: '',
  dos: [],
  donts: [],
}

export function brandBookNormaliser(b: Partial<BrandBook> | null | undefined): BrandBook {
  if (!b) return BRAND_BOOK_VIDE
  return {
    palette: Array.isArray(b.palette) ? b.palette : [],
    typo: {
      principale: b.typo?.principale ?? '',
      ...(b.typo?.secondaire ? { secondaire: b.typo.secondaire } : {}),
      ...(b.typo?.specimen_url ? { specimen_url: b.typo.specimen_url } : {}),
    },
    logo_url: b.logo_url ?? '',
    dos: Array.isArray(b.dos) ? b.dos : [],
    donts: Array.isArray(b.donts) ? b.donts : [],
  }
}

export function brandBookEstVide(b: BrandBook | null | undefined): boolean {
  if (!b) return true
  const n = brandBookNormaliser(b)
  return (
    n.palette.length === 0 &&
    n.logo_url === '' &&
    n.typo.principale === '' &&
    n.dos.length === 0 &&
    n.donts.length === 0
  )
}

// Palette pastel par défaut quand brand_book.palette est vide.
// Doctrine : aucune saturation forte, tons clairs hérités du moodboard
// éditorial. Servent aussi à colorer les 3 piliers narratifs par défaut.
export const PASTELS_DEFAUT: PaletteCouleur[] = [
  { nom: 'Sable',   hex: '#E8DDD0' },
  { nom: 'Brume',   hex: '#C9D4DD' },
  { nom: 'Ardoise', hex: '#B5B2C7' },
]

// Archives : entrée d'archive dans la mémoire de la marque.

export type ArchiveType = 'texte' | 'pdf' | 'image' | 'video' | 'lien'

export type BrandArchive = {
  id: string
  type: ArchiveType
  titre: string
  description: string
  url: string | null
  fichier_path: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

// Calendrier business — extension Sprint 36.B.3 (champs optionnels).
// Tous les nouveaux champs sont optional → compatible avec moments
// préexistants qui n'ont que id/titre/dates/type.

export type MomentImportance = 'mineur' | 'structurant' | 'majeur'
export type MomentVisibilite = 'public' | 'confidentiel'

export type MomentBusinessExtras = {
  importance?: MomentImportance
  pilier_id?: string
  visibilite?: MomentVisibilite
  notes?: string
}
