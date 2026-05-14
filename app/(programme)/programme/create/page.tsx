// Sprint 37.D (F35b) — /programme/create : page native du formulaire de
// création de plan. Expose les 7 questions du wizard en formulaire
// classique. Bouton optionnel 'Préfère discuter avec le conseiller →'
// pour basculer vers le wizard immersif F16.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { ProgrammeCreateForm } from '@/components/programme-create/ProgrammeCreateForm'
import { checkJalonStatus } from '@/lib/jalons/check-jalons'
import { MarqueIncompleteWarning } from '@/components/programme-create/MarqueIncompleteWarning'
import { ProgrammeSplitShell } from '@/components/programme/ProgrammeSplitShell'
import type { BusinessCalendar } from '@/types/business-calendar'
import type { PilierNarratif } from '@/types/programme'

export const dynamic = 'force-dynamic'
// Sprint 37.E (F37) — Même justification que /programme : le submit du
// formulaire natif déclenche la même server action de génération.
export const maxDuration = 90

export default async function CreateProgrammePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id, publication_frequency')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as {
    tenant_id?: string | null
    publication_frequency?: 'discret' | 'equilibre' | 'dense' | null
  } | null
  const tenantId = profile?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    redirect('/onboarding/analyse-marque')
  }

  // Sprint 37.E (F44) — Check jalon marque pour afficher l'alerte.
  const jalonStatus = await checkJalonStatus(supabase, tenantId)

  // Récupère piliers + business calendar pour les suggestions.
  const brandRow = brand as unknown as {
    piliers_narratifs?: unknown
    business_calendar?: unknown
  }
  let piliers: ReadonlyArray<PilierNarratif> = []
  if (Array.isArray(brandRow.piliers_narratifs)) {
    piliers = brandRow.piliers_narratifs as PilierNarratif[]
  }
  const businessCalendar = (brandRow.business_calendar ?? null) as BusinessCalendar | null

  // Suggestions d'ancres business sur les 90 prochains jours.
  const now90Plus = new Date()
  now90Plus.setDate(now90Plus.getDate() + 90)
  const businessAnchorSuggestions: Array<{ value: string }> = []
  if (businessCalendar) {
    for (const l of businessCalendar.upcomingLaunches ?? []) {
      if (l.date && new Date(l.date).getTime() <= now90Plus.getTime()) {
        businessAnchorSuggestions.push({ value: `${l.name} — ${l.date}` })
      }
    }
    for (const e of businessCalendar.industryEvents ?? []) {
      if (e.date && new Date(e.date).getTime() <= now90Plus.getTime()) {
        businessAnchorSuggestions.push({ value: `${e.name} — ${e.date}` })
      }
    }
  }

  return (
    <ProgrammeSplitShell activeItem="create">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Sprint 37.E (F44) — Alerte si jalon marque non-atteint. */}
        {!jalonStatus.marque.complete ? <MarqueIncompleteWarning /> : null}

        <ProgrammeCreateForm
          pillarsCatalog={piliers.map((p, i) => ({
            id: `pilier-${i}`,
            nom: p.nom ?? `Pilier ${i + 1}`,
          }))}
          businessAnchorSuggestions={businessAnchorSuggestions}
          publicationFrequency={profile?.publication_frequency ?? null}
        />
      </div>
    </ProgrammeSplitShell>
  )
}
