// Sprint 37.I (F74+F75+F76) — Refonte complète : vraies vues calendrier
// Semaine/Mois/Liste avec bulle preview overlay pour Semaine et Mois.
//
// La logique de chaque vue est dans son propre composant (CalendarWeekView,
// CalendarMonthView, CalendarListView). Ce wrapper gère :
// - Switcher de vue + persistance localStorage 'cf:calendar-view'
// - State selectedPostForOverlay (Semaine et Mois ouvrent l'overlay au clic)
// - Vue Liste a sa propre preview latérale, pas d'overlay

'use client'

import { useEffect, useState } from 'react'
import {
  CalendarViewSwitcher,
  type CalendarViewKind,
} from './CalendarViewSwitcher'
import { CalendarWeekView } from './CalendarWeekView'
import { CalendarMonthView } from './CalendarMonthView'
import { CalendarListView } from './CalendarListView'
import { PostPreviewOverlay, type OverlayPost } from './PostPreviewOverlay'

type Props = {
  posts: ReadonlyArray<OverlayPost>
  programmeDateDebut: string | null
  programmeDateFin: string | null
}

export function ProgrammeCalendarView({ posts }: Props) {
  // Sprint 37.G F64 — persistance localStorage.
  const [viewKind, setViewKind] = useState<CalendarViewKind>('week')
  // Sprint 41-secu-compte (C) : pattern d'hydratation client (localStorage
  // inaccessible côté SSR). Le setViewKind n'est appelé que si valeur valide.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('cf:calendar-view')
    if (stored === 'week' || stored === 'month' || stored === 'list') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewKind(stored)
    }
  }, [])
  function changeView(next: CalendarViewKind) {
    setViewKind(next)
    setSelectedPost(null) // ferme tout overlay au changement de vue
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cf:calendar-view', next)
    }
  }

  // Sprint 37.I F76 — l'overlay s'ouvre depuis Semaine et Mois.
  const [selectedPost, setSelectedPost] = useState<OverlayPost | null>(null)

  // Détermine une date de référence pour positionner le premier mois/semaine
  // sur le premier post du programme (ou today si vide).
  const refDate = (() => {
    const first = posts.find((p) => p.date_prevue)?.date_prevue
    if (!first) return undefined
    const d = new Date(`${first}T00:00:00`)
    return Number.isNaN(d.getTime()) ? undefined : d
  })()

  return (
    <div className="cfs-cal-wrapper">
      <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <CalendarViewSwitcher active={viewKind} onChange={changeView} />
      </header>

      <div>
        {viewKind === 'week' ? (
          <CalendarWeekView
            posts={posts}
            onSelectPost={(p) => setSelectedPost(p)}
            refDate={refDate}
          />
        ) : viewKind === 'month' ? (
          <CalendarMonthView
            posts={posts}
            onSelectPost={(p) => setSelectedPost(p)}
            refDate={refDate}
          />
        ) : (
          <CalendarListView posts={posts} />
        )}
      </div>

      {/* Overlay uniquement pour Semaine et Mois. La Liste a sa preview latérale. */}
      {viewKind !== 'list' ? (
        <PostPreviewOverlay post={selectedPost} onClose={() => setSelectedPost(null)} />
      ) : null}
    </div>
  )
}
