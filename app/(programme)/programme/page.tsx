// Sprint 43-stable — Mon Programme V2.0 (refonte complète).
//
// Doctrine de référence :
//   - 00-CONCEPT.md §5 promesse 6 ("suggestions de la semaine, piliers actifs,
//     heatmap calendrier 30 jours. Sans métriques inventées.")
//   - 01-ARCHITECTURE.md §3.2 (single column 1080px sur Mon Programme — pas de sub-sidebar).
//
// HTML de référence : docs/design-mockups/02-mon-programme.html
//
// Sprint 40 — page refactorée en place. Renommage URL `/programme` → `/mon-programme`
// laissé à un sprint dédié (cf. decisions.md Sprint 43-stable §3).
//
// 3 sections doctrinales :
//   1. Suggestions pour cette semaine (3 cards mockées V1)
//   2. Piliers actifs · trimestre en cours
//   3. Calendrier éditorial · 30 jours (heatmap)

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MonProgrammeSuggestions } from '@/components/mon-programme/MonProgrammeSuggestions'
import { MonProgrammePiliers } from '@/components/mon-programme/MonProgrammePiliers'
import { MonProgrammeHeatmap } from '@/components/mon-programme/MonProgrammeHeatmap'

export const dynamic = 'force-dynamic'

const PILIERS_COLORS: Record<string, string> = {
  Anecdote: 'rgba(0, 122, 255, 0.45)',
  Produit: 'rgba(16, 185, 129, 0.45)',
  Événement: 'rgba(251, 146, 60, 0.55)',
  Manifeste: 'rgba(255, 59, 48, 0.45)',
  Coulisses: 'rgba(244, 114, 182, 0.45)',
}

const WEEKDAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default async function MonProgrammePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const weekday = WEEKDAYS_FR[now.getDay()] ?? ''
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
  )

  // Sprint 43-stable — données mockées (Sprint 41-prompts pour service Hélène réel)
  const suggestions = [
    {
      id: 'sug-1',
      kind: 'planning' as const,
      eyebrow: 'À planifier',
      title: 'Préparation atelier · matin du 12 juin',
      description:
        'Bloque une demi-journée dans le Calendrier pour préparer la capsule avant le shoot. Pilier Métier, vendredi matin.',
    },
    {
      id: 'sug-2',
      kind: 'series' as const,
      eyebrow: 'Série recommandée',
      title: 'Série Manifeste · 3 publications espacées sur juin',
      description:
        "Restaure l'intensité du pilier Manifeste. Espacement proposé : 4, 11 et 18 juin.",
    },
    {
      id: 'sug-3',
      kind: 'delegate' as const,
      eyebrow: 'À déléguer',
      title: 'Briefer le photographe pour le shoot de juin',
      description:
        'Capsule « Mains », 22-23 juin. Brief à valider avec Antoine F. avant transmission.',
    },
  ]

  // Piliers actifs — comptage réel depuis posts si table dispo, sinon mocké
  type Row = { pilier_nom: string | null }
  const { data: postsRaw } = await supabase
    .from('posts')
    .select('pilier_nom')
    .limit(200)
  const piliersCount = new Map<string, number>()
  ;((postsRaw as Row[] | null) ?? []).forEach((r) => {
    if (r.pilier_nom) {
      piliersCount.set(r.pilier_nom, (piliersCount.get(r.pilier_nom) ?? 0) + 1)
    }
  })

  // Fallback mocké si aucune donnée
  const defaultPiliers = ['Anecdote', 'Produit', 'Événement', 'Manifeste', 'Coulisses']
  const defaultCounts = [6, 4, 3, 2, 5]
  const piliers = defaultPiliers.map((label, i) => ({
    id: label,
    label,
    count: piliersCount.get(label) ?? defaultCounts[i] ?? 0,
    color: PILIERS_COLORS[label] ?? 'rgba(0, 0, 0, 0.2)',
  }))

  // Heatmap 30 jours — pré-calculée mockée
  // Cellules : 30 jours à partir d'aujourd'hui. Quelques cellules colorées (mockées).
  const todayDay = now.getDate()
  const COLOR_BY_INDEX = [
    'evenement', 'anecdote', 'produit', 'coulisses', 'anecdote', 'manifeste', 'produit',
    'coulisses', 'manifeste', 'anecdote', 'evenement', 'anecdote', 'evenement', 'produit', 'coulisses',
  ]
  const cells = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(todayDay + i)
    const colorKey = COLOR_BY_INDEX[i % COLOR_BY_INDEX.length] ?? null
    const colorMap: Record<string, string> = {
      anecdote: 'rgba(0, 122, 255, 0.18)',
      produit: 'rgba(16, 185, 129, 0.20)',
      evenement: 'rgba(251, 146, 60, 0.22)',
      manifeste: 'rgba(255, 59, 48, 0.18)',
      coulisses: 'rgba(244, 114, 182, 0.18)',
    }
    return {
      day: date.getDate(),
      isToday: i === 0,
      pilierColor: i % 2 === 0 && colorKey ? colorMap[colorKey] : undefined,
      hasStack: i === 3 || i === 17,
    }
  })

  const legend = defaultPiliers.map((label) => ({
    label,
    color: PILIERS_COLORS[label] ?? 'rgba(0, 0, 0, 0.2)',
  }))

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell page-shell--narrow">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Mon Programme</span>
          </div>
          <h1 className="header-h1">Mon Programme</h1>
          <p className="header-subtitle">
            {weekday} {now.getDate()} · semaine {weekNumber}
          </p>
        </div>
      </header>

      <main className="page-shell page-shell--narrow mp-shell">
        <MonProgrammeSuggestions suggestions={suggestions} />
        <MonProgrammePiliers piliers={piliers} />
        <MonProgrammeHeatmap cells={cells} legend={legend} />
      </main>
    </>
  )
}
