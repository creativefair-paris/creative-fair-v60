import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { COACHING_GENERATION_RULES } from '@/lib/ai/prompts/coaching'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import {
  buildStructuredBrandContext,
  findNearestBusinessEvent,
} from '@/lib/ai/brand-context'
import { logCreditsUsage } from '@/lib/ai/credits'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

type CoachingPayload = {
  text: string
  suggestions: string[]
}

type CoachingRow = {
  id: string
  date: string
  content: CoachingPayload
  business_context: string | null
  read_at: string | null
}

function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatFrenchDate(d: Date): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
  return formatted
}

function isCoachingPayload(value: unknown): value is CoachingPayload {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (typeof v.text !== 'string') return false
  if (!Array.isArray(v.suggestions)) return false
  return v.suggestions.every((s) => typeof s === 'string')
}

export async function POST(_req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) {
    return Response.json({ error: 'No brand for current user' }, { status: 400 })
  }

  const today = todayIsoDate()

  // Idempotence : un seul coaching par brand par jour.
  const { data: rawExisting } = await supabase
    .from('daily_coaching')
    .select('id, date, content, business_context, read_at')
    .eq('brand_id', ctx.brandId)
    .eq('date', today)
    .maybeSingle()

  const existing = rawExisting as CoachingRow | null
  if (existing) {
    return Response.json({ ok: true, coaching: existing, regenerated: false })
  }

  const brand = await getBrandByTenantId(supabase, ctx.tenantId)
  const brandBook = (brand?.brand_book ?? null) as BrandBook | null
  const businessCalendar = (brand?.business_calendar ?? null) as
    | BusinessCalendar
    | null

  const brandContext = buildStructuredBrandContext(brandBook, businessCalendar)
  const today_ = new Date()
  const businessContext = findNearestBusinessEvent(businessCalendar, today_)

  const userPrompt = `Date du jour : ${formatFrenchDate(today_)}.

Événement business le plus proche : ${businessContext ?? 'aucun événement particulier dans les 14 jours'}.

Contexte de la marque :
${brandContext || '(brand book non rempli)'}

Génère le coaching éditorial du jour en JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 600,
    system: buildSystemPrompt([VOICE_SHEET_RULES, COACHING_GENERATION_RULES]),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()

  let payload: CoachingPayload
  try {
    const parsed = JSON.parse(text) as unknown
    if (!isCoachingPayload(parsed)) {
      throw new Error('Invalid coaching payload shape')
    }
    payload = parsed
  } catch {
    return Response.json(
      { error: 'AI returned invalid JSON', raw: text },
      { status: 502 },
    )
  }

  const insertable = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: CoachingRow | null
            error: { message: string } | null
          }>
        }
      }
    }
  }

  const { data: inserted, error } = await insertable
    .from('daily_coaching')
    .insert([
      {
        brand_id: ctx.brandId,
        tenant_id: ctx.tenantId,
        date: today,
        content: payload,
        business_context: businessContext,
      },
    ])
    .select('id, date, content, business_context, read_at')
    .single()

  if (error || !inserted) {
    return Response.json(
      { error: error?.message ?? 'Insert failed' },
      { status: 500 },
    )
  }

  await logCreditsUsage({
    tenantId: ctx.tenantId,
    userId: user.id,
    feature: 'coaching',
    model: 'claude-opus-4-7',
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
  })

  return Response.json({ ok: true, coaching: inserted, regenerated: true })
}
