// Sprint 36.G — Types et mapping état post pour /aujourd-hui.
//
// La colonne live en DB est `posts.statut` (FR, valeurs : 'planifie',
// 'genere', 'publie', 'archive') — héritée du Sprint 36.A.
// Le spec Sprint 36.G demande des états 'todo'/'ready'/'published'/'alert'.
//
// Plutôt que de dupliquer la sémantique en ajoutant une colonne `status`
// EN parallèle à `statut`, on mappe la colonne existante. Décision
// documentée dans audits/sprint-36-g/abort-log.md.

export type PostStatutDB = 'planifie' | 'genere' | 'publie' | 'archive'

export type PostState = 'todo' | 'ready' | 'published' | 'alert'

// Mapping statut DB → état UI.
// 'archive' est mappé sur 'published' (terminé, plus actionable). En V1,
// aucun post n'a l'état 'alert' (pas de colonne 'failed' en base). Le
// composant rend tout de même cet état pour qu'une évolution Sprint
// futur (ajout d'un champ failed_at par exemple) le branche sans refacto.
export function mapStatutToState(statut: PostStatutDB | string | null | undefined): PostState {
  if (statut === 'publie' || statut === 'archive') return 'published'
  if (statut === 'genere') return 'ready'
  return 'todo'
}

// Combine date_prevue (YYYY-MM-DD) + heure_prevue (HH:MM:SS) en Date Paris.
// V1 sans gestion DST précise — Europe/Paris est forcé au niveau parsing,
// le toISOString() conserve l'heure murale comme contractuelle.
export function getScheduledAt(post: { date_prevue: string; heure_prevue: string }): Date {
  // Format ISO local sans Z = laisse JavaScript appliquer l'offset local
  // du serveur (Vercel est UTC, dev est local). Le serveur formate le
  // rendu via Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris' })
  // pour l'affichage final.
  const d = new Date(`${post.date_prevue}T${post.heure_prevue}`)
  if (Number.isNaN(d.getTime())) {
    // Fallback : date seule à midi heure locale.
    return new Date(`${post.date_prevue}T12:00:00`)
  }
  return d
}

// Type minimal d'un post tel qu'utilisé par les composants /aujourd-hui.
export type TaskPost = {
  id: string
  titre: string
  type_contenu: string
  pilier_nom: string
  date_prevue: string  // YYYY-MM-DD
  heure_prevue: string // HH:MM:SS
  statut: PostStatutDB | string
  // Sprint 36.H — Si reported_from NOT NULL, le post a été déplacé par
  // catchUpOverduePosts. Sert à afficher le label "Reporté de N jours"
  // sous le titre dans le TaskRow.
  reported_from?: string | null
}
