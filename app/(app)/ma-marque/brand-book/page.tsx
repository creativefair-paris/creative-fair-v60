import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import type { BrandBook } from '@/types/brand-book'

const REGISTER_LABEL: Record<BrandBook['voice']['register'], string> = {
  formal: 'Formel',
  casual: 'Décontracté',
  mixed: 'Mixte',
}

export default async function BrandBookPage() {
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
  const book = brand?.brand_book

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
          Brand book
        </p>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          {book?.identity.name ?? brand?.name ?? 'Brand book'}
        </h1>
      </header>

      {!book ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          <Section title="Identité">
            <Field label="Nom" value={book.identity.name} />
            <Field label="Domaine" value={book.identity.domain} />
            {book.identity.tagline && (
              <Field label="Tagline" value={book.identity.tagline} />
            )}
            <Prose label="Description" value={book.identity.description} />
            {book.identity.history && (
              <Prose label="Histoire" value={book.identity.history} />
            )}
          </Section>

          <Section title="Voix éditoriale">
            <Field label="Registre" value={REGISTER_LABEL[book.voice.register]} />
            {book.voice.tone.length > 0 && (
              <Field label="Ton" value={book.voice.tone.join(', ')} />
            )}
            <Prose label="Style de phrase" value={book.voice.sentenceStyle} />
            {book.voice.encouragedWords.length > 0 && (
              <Field
                label="Vocabulaire encouragé"
                value={book.voice.encouragedWords.join(', ')}
              />
            )}
            {book.voice.forbiddenWords.length > 0 && (
              <Field
                label="Vocabulaire interdit"
                value={book.voice.forbiddenWords.join(', ')}
              />
            )}
          </Section>

          <Section title="Audience">
            <Prose label="Aspirational" value={book.audience.aspirational} />
            {book.audience.personas.map((persona, i) => (
              <div key={i} className="space-y-1">
                <p
                  className="text-[13px] uppercase tracking-wider"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Persona — {persona.name}
                </p>
                <p
                  className="text-[17px] leading-relaxed"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {persona.description}
                </p>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Aspirations : {persona.aspirations}
                </p>
              </div>
            ))}
          </Section>

          <Section title="Territoires éditoriaux">
            {book.territories.map((t) => (
              <div key={t.id} className="space-y-1">
                <p
                  className="text-[17px] font-medium"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t.name}
                </p>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t.description}
                </p>
                {t.examples.length > 0 && (
                  <p
                    className="text-[13px]"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Exemples : {t.examples.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </Section>

          <Section title="Visuel">
            {book.visual.colors.length > 0 && (
              <Field label="Couleurs" value={book.visual.colors.join(', ')} />
            )}
            {book.visual.fonts.length > 0 && (
              <Field label="Polices" value={book.visual.fonts.join(', ')} />
            )}
            {book.visual.references.length > 0 && (
              <Field
                label="Références"
                value={book.visual.references.join(', ')}
              />
            )}
          </Section>

          {book.taboos.length > 0 && (
            <Section title="Tabous">
              <p
                className="text-[17px] leading-relaxed"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {book.taboos.join('. ')}.
              </p>
            </Section>
          )}

          <Section title="Objectifs">
            <Prose label="Objectif principal" value={book.goals.primary} />
            <Prose label="Instagram" value={book.goals.instagram} />
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      className="pt-6 space-y-4"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-[13px] uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[13px]"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {label}
      </span>
      <span
        className="text-[17px]"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        {value}
      </span>
    </div>
  )
}

function Prose({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p
        className="text-[13px]"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {label}
      </p>
      <p
        className="text-[17px] leading-relaxed"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-xl px-6 py-10 text-center space-y-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <p
        className="text-base"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        Génère ton brand book pour commencer.
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Trois questions suffisent pour faire émerger ton identité éditoriale.
      </p>
      <Link
        href="/ma-marque/onboarding"
        className="inline-block px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-fg)',
          fontFamily: 'var(--font-body)',
          borderRadius: 'var(--radius)',
        }}
      >
        Démarrer
      </Link>
    </div>
  )
}
