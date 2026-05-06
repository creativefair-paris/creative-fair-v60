import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import {
  EMPTY_BUSINESS_CALENDAR,
  type BusinessCalendar,
  type RecurringFrequency,
  type LaunchType,
  type Season,
  type ActivityLevel,
  type IndustryRelevance,
} from '@/types/business-calendar'
import {
  addRecurringEvent,
  removeRecurringEvent,
  addUpcomingLaunch,
  removeUpcomingLaunch,
  setSeasonalPeriod,
  addIndustryEvent,
  removeIndustryEvent,
} from './actions'

const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
}

const LAUNCH_LABEL: Record<LaunchType, string> = {
  product: 'Produit',
  event: 'Événement',
  collection: 'Collection',
  partnership: 'Partenariat',
  other: 'Autre',
}

const SEASON_LABEL: Record<Season, string> = {
  spring: 'Printemps',
  summer: 'Été',
  fall: 'Automne',
  winter: 'Hiver',
}

const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  low: 'Calme',
  medium: 'Moyen',
  high: 'Intense',
}

const RELEVANCE_LABEL: Record<IndustryRelevance, string> = {
  core: 'Cœur',
  adjacent: 'Adjacent',
  optional: 'Optionnel',
}

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter']

export default async function BusinessCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id
  const brand = tenantId ? await getBrandByTenantId(supabase, tenantId) : null

  const calendar: BusinessCalendar =
    (brand?.business_calendar as BusinessCalendar | null) ?? {
      ...EMPTY_BUSINESS_CALENDAR,
    }

  const isEmpty =
    calendar.recurringEvents.length === 0 &&
    calendar.upcomingLaunches.length === 0 &&
    calendar.seasonality.length === 0 &&
    calendar.industryEvents.length === 0

  return (
    <div className="px-6 md:px-10 py-10 max-w-2xl mx-auto w-full">
      <Link
        href="/ma-marque"
        className="inline-flex items-center gap-1 text-sm mb-8 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        <ChevronLeft size={16} />
        Ma marque
      </Link>

      <header className="mb-10 space-y-1">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
        >
          Calendrier business
        </p>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Tes temps forts
        </h1>
      </header>

      {isEmpty && (
        <div
          className="mb-10 rounded-xl px-5 py-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
          >
            Renseigne tes événements business pour que ton calendrier éditorial
            s&apos;y aligne automatiquement.
          </p>
        </div>
      )}

      <div className="space-y-12">
        <Section
          title="Événements récurrents"
          hint="Ex. réunion mensuelle, newsletter hebdomadaire."
        >
          <form action={addRecurringEvent} className="space-y-3">
            <Input name="name" placeholder="Nom de l'événement" required />
            <Select name="frequency" required>
              <option value="">Fréquence…</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="quarterly">Trimestriel</option>
              <option value="yearly">Annuel</option>
            </Select>
            <Textarea name="description" placeholder="Description (optionnel)" />
            <SubmitButton>Ajouter</SubmitButton>
          </form>

          <ul className="space-y-2 mt-6">
            {calendar.recurringEvents.map((e) => (
              <ItemRow
                key={e.id}
                title={e.name}
                meta={FREQUENCY_LABEL[e.frequency]}
                description={e.description}
                deleteAction={async () => {
                  'use server'
                  await removeRecurringEvent(e.id)
                }}
              />
            ))}
          </ul>
        </Section>

        <Section
          title="Lancements à venir"
          hint="Ex. sortie de produit, ouverture, partenariat."
        >
          <form action={addUpcomingLaunch} className="space-y-3">
            <Input name="name" placeholder="Nom du lancement" required />
            <Input name="date" type="date" required />
            <Select name="type" required>
              <option value="">Type…</option>
              <option value="product">Produit</option>
              <option value="event">Événement</option>
              <option value="collection">Collection</option>
              <option value="partnership">Partenariat</option>
              <option value="other">Autre</option>
            </Select>
            <Textarea name="description" placeholder="Description" />
            <SubmitButton>Ajouter</SubmitButton>
          </form>

          <ul className="space-y-2 mt-6">
            {calendar.upcomingLaunches.map((l) => (
              <ItemRow
                key={l.id}
                title={l.name}
                meta={`${l.date} · ${LAUNCH_LABEL[l.type]}`}
                description={l.description}
                deleteAction={async () => {
                  'use server'
                  await removeUpcomingLaunch(l.id)
                }}
              />
            ))}
          </ul>
        </Section>

        <Section title="Saisonnalité" hint="Ton rythme d'activité par saison.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEASONS.map((season) => {
              const period = calendar.seasonality.find((p) => p.season === season)
              return (
                <form
                  key={season}
                  action={setSeasonalPeriod}
                  className="rounded-xl px-4 py-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <input type="hidden" name="season" value={season} />
                  <p
                    className="text-[15px] font-medium"
                    style={{
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {SEASON_LABEL[season]}
                  </p>
                  <Select name="activityLevel" defaultValue={period?.activityLevel ?? ''} required>
                    <option value="">Niveau d&apos;activité…</option>
                    <option value="low">{ACTIVITY_LABEL.low}</option>
                    <option value="medium">{ACTIVITY_LABEL.medium}</option>
                    <option value="high">{ACTIVITY_LABEL.high}</option>
                  </Select>
                  <Input
                    name="keyTopics"
                    placeholder="Thèmes clés (séparés par virgules)"
                    defaultValue={period?.keyTopics.join(', ') ?? ''}
                  />
                  <SubmitButton>Enregistrer</SubmitButton>
                </form>
              )
            })}
          </div>
        </Section>

        <Section
          title="Temps forts sectoriels"
          hint="Ex. salon, foire, semaine de la mode."
        >
          <form action={addIndustryEvent} className="space-y-3">
            <Input name="name" placeholder="Nom de l'événement" required />
            <Input name="date" type="date" required />
            <Select name="relevance" required>
              <option value="">Pertinence…</option>
              <option value="core">Cœur</option>
              <option value="adjacent">Adjacent</option>
              <option value="optional">Optionnel</option>
            </Select>
            <SubmitButton>Ajouter</SubmitButton>
          </form>

          <ul className="space-y-2 mt-6">
            {calendar.industryEvents.map((e) => (
              <ItemRow
                key={e.id}
                title={e.name}
                meta={`${e.date} · ${RELEVANCE_LABEL[e.relevance]}`}
                deleteAction={async () => {
                  'use server'
                  await removeIndustryEvent(e.id)
                }}
              />
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="pt-6 space-y-4"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div className="space-y-1">
        <h2
          className="text-[13px] uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          {title}
        </h2>
        {hint && (
          <p
            className="text-sm"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
      }}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={2}
      className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
      }}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
      }}
    />
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="px-3 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
      style={{
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-accent-fg)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
      }}
    >
      {children}
    </button>
  )
}

function ItemRow({
  title,
  meta,
  description,
  deleteAction,
}: {
  title: string
  meta: string
  description?: string
  deleteAction: () => Promise<void>
}) {
  return (
    <li
      className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div className="space-y-0.5 min-w-0">
        <p
          className="text-[15px] font-medium truncate"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
        >
          {title}
        </p>
        <p
          className="text-[13px]"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {meta}
        </p>
        {description && (
          <p
            className="text-sm leading-relaxed mt-1"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {description}
          </p>
        )}
      </div>
      <form action={deleteAction}>
        <button
          type="submit"
          className="p-1 transition-opacity hover:opacity-70 shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </form>
    </li>
  )
}
