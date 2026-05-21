// Sprint 43-stable — Aujourd'hui V2.0 (refonte complète).
//
// Doctrine de référence :
//   - 00-CONCEPT.md §3 (Tranquillité du pilote) + §5 promesse 1 + §7 hub central.
//   - 01-ARCHITECTURE.md §2.1 (sidebar globale visible ICI uniquement) + §3.1 (layout hub).
//
// Densité α stricte minimale :
//   - 3 widgets : Calendrier · Rappels · Messages
//   - 1 Roadmap orchestrée par Hélène
//   - Pas d'autre widget.
//
// HTML de référence : docs/design-mockups/01-aujourd-hui-v3.html
//
// Service Hélène mocké V1 (Sprint 41-prompts dédié pour l'appel Anthropic).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AujourdhuiSidebar } from '@/components/aujourd-hui/AujourdhuiSidebar'
import { AujourdhuiWidgetCalendrier } from '@/components/aujourd-hui/AujourdhuiWidgetCalendrier'
import { AujourdhuiWidgetRappels } from '@/components/aujourd-hui/AujourdhuiWidgetRappels'
import { AujourdhuiWidgetMessages } from '@/components/aujourd-hui/AujourdhuiWidgetMessages'
import { AujourdhuiRoadmap } from '@/components/aujourd-hui/AujourdhuiRoadmap'

export const dynamic = 'force-dynamic'

const WEEKDAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
]
const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export default async function AujourdhuiPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const dayNumber = now.getDate()
  const weekday = WEEKDAYS_FR[now.getDay()] ?? ''
  const month = MONTHS_FR[now.getMonth()] ?? ''
  const year = now.getFullYear()
  const headerDate = `${weekday} ${dayNumber} ${month.toLowerCase()} ${year}`

  // Données pour les widgets — Server Component charge minimum vital.
  // V1 : si données absentes, on affiche les empty states.
  const todayISO = now.toISOString().slice(0, 10)

  // Posts d'aujourd'hui (Server Component, RLS auto)
  const { data: postsRaw } = await supabase
    .from('posts')
    .select('id, titre, heure_prevue, date_prevue, pilier_nom')
    .eq('date_prevue', todayISO)
    .order('heure_prevue', { ascending: true })
    .limit(2)
  const events = ((postsRaw as Array<{
    id: string
    titre: string | null
    heure_prevue: string | null
    pilier_nom: string | null
  }> | null) ?? []).map((p) => ({
    id: p.id,
    time: p.heure_prevue
      ? p.heure_prevue.slice(0, 5).replace(':', 'h')
      : 'À programmer',
    title: p.titre ?? 'Publication',
  }))

  // Rappels (table reminders créée Sprint 43-stable, peut être vide V1)
  let rappels: Array<{ id: string; title: string; completed?: boolean }> = []
  try {
    const { data: remindersRaw } = await supabase
      .from('reminders')
      .select('id, title, completed_at')
      .is('completed_at', null)
      .lte('due_at', new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)).toISOString())
      .limit(3)
    if (Array.isArray(remindersRaw)) {
      rappels = (remindersRaw as Array<{ id: string; title: string; completed_at: string | null }>).map((r) => ({
        id: r.id,
        title: r.title,
        completed: r.completed_at !== null,
      }))
    }
  } catch {
    // Table reminders peut ne pas être migrée — fallback empty
  }

  // Conversations Messages (mockées V1 — pas de service Hélène réel)
  const conversations = [
    {
      id: 'helene',
      participant: 'Hélène M.',
      preview: 'Bonjour, voici ton point du jour…',
      time: '8h12',
    },
  ]

  // Roadmap mockée V1 (service Hélène = Sprint 41-prompts dédié)
  const roadmapSteps = [
    {
      id: 'r1',
      label: events[0]?.title ? `Préparer ${events[0].title}` : 'Préparer la publication du jour',
      context: 'Ouvre Calendrier pour voir le contexte',
    },
    {
      id: 'r2',
      label: 'Faire le point avec Hélène',
      context: 'Conversation pinned dans Messages',
    },
    {
      id: 'r3',
      label: 'Avancer sur les rappels prioritaires',
      context: rappels.length > 0 ? `${rappels.length} en attente` : 'Aucun rappel actif',
    },
  ]

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <span className="header-eyebrow">{headerDate.toUpperCase()}</span>
          <h1 className="header-h1">Aujourd&apos;hui</h1>
        </div>
      </header>

      <div className="page-shell aujourd-hui-layout">
        <AujourdhuiSidebar />

        <main className="aujourd-hui-content">
          <div className="widgets-grid">
            <AujourdhuiWidgetCalendrier
              dayNumber={dayNumber}
              weekday={weekday}
              month={`${month} ${year}`}
              events={events}
            />
            <AujourdhuiWidgetRappels rappels={rappels} />
            <AujourdhuiWidgetMessages conversations={conversations} />
          </div>

          <AujourdhuiRoadmap steps={roadmapSteps} generatedAt="8h00" />
        </main>
      </div>
    </>
  )
}
