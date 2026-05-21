// Sprint 43-stable — Page Messages V2.0 (création).
//
// Doctrine 00-CONCEPT.md §5 promesse 4 + 01-ARCHITECTURE.md §1 (Travail top-level) +
// 02-EXPERTS.md §1-5 (Hélène + 12 Experts, carnet fusionné).
//
// HTML références :
//   - docs/design-mockups/03-messages.html (conversation)
//   - docs/design-mockups/03bis-contacts.html (carnet fusionné)
//
// V1 : données mockées V1 (service réel = Sprint 41-prompts dédié).
// Input désactivé "Service Hélène en cours de configuration".

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessagesListePane } from '@/components/messages/MessagesListePane'
import { MessagesThreadPane } from '@/components/messages/MessagesThreadPane'
import { MessagesCarnetExperts } from '@/components/messages/MessagesCarnetExperts'
import { SEED_CONVERSATIONS, SEED_HELENE_CONVERSATION } from '@/lib/messages/seed-conversation'
import { HELENE, getExpertById } from '@/lib/messages/experts'

export const dynamic = 'force-dynamic'

type SearchParams = {
  conv?: string
  carnet?: string
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const showCarnet = params.carnet === '1'

  // Conversation active (par défaut : Hélène pinned)
  const activeConvId = params.conv ?? SEED_CONVERSATIONS[0]?.id ?? 'conv-helene'
  const activeConv =
    SEED_CONVERSATIONS.find((c) => c.id === activeConvId) ?? SEED_CONVERSATIONS[0]
  const activeExpertId = activeConv?.participantId ?? HELENE.id

  // Messages mockés (V1 — seuls Hélène a un seed full)
  const messages = activeExpertId === HELENE.id
    ? SEED_HELENE_CONVERSATION
    : [
        {
          id: 'm-empty-1',
          role: 'expert' as const,
          expertId: activeExpertId,
          content: `Bonjour. Cette conversation n'a pas encore d'historique mocké. Le service ${
            getExpertById(activeExpertId)?.name ?? 'Expert'
          } arrive en Sprint 41-prompts dédié.`,
          time: '9h00',
        },
      ]

  // Bandeau "Hélène écoute toujours" affiché si on parle à un Expert ≠ Hélène
  const showHeleneListens = activeExpertId !== HELENE.id

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Messages</span>
          </div>
          <h1 className="header-h1">Messages</h1>
          <p className="header-subtitle">Hélène et les 12 Experts.</p>
        </div>
      </header>

      <div className="page-shell messages-layout">
        {showCarnet ? (
          <MessagesCarnetExperts />
        ) : (
          <>
            <MessagesListePane
              conversations={SEED_CONVERSATIONS}
              activeConversationId={activeConvId}
            />
            <MessagesThreadPane
              expertId={activeExpertId}
              messages={messages}
              showHeleneListens={showHeleneListens}
            />
          </>
        )}
      </div>
    </>
  )
}
