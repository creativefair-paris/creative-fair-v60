import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { BUSINESS_SUGGEST_RULES } from '@/lib/ai/prompts/business-suggest'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import { buildStructuredBrandContext } from '@/lib/ai/brand-context'
import { logCreditsUsage } from '@/lib/ai/credits'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'
import type { Suggestion } from '@/types/suggestion'

function isSuggestion(value: unknown): value is Suggestion {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.eventName === 'string' &&
    typeof v.angle === 'string' &&
    typeof v.hook === 'string' &&
    typeof v.recommendedDate === 'string' &&
    typeof v.rationale === 'string' &&
    typeof v.postType === 'string' &&
    ['anecdote_live', 'anecdote_custom', 'story', 'reels'].includes(
      v.postType as string,
    )
  )
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

  const brand = await getBrandByTenantId(supabase, ctx.tenantId)
  const brandBook = (brand?.brand_book ?? null) as BrandBook | null
  const businessCalendar = (brand?.business_calendar ?? null) as
    | BusinessCalendar
    | null

  const brandContext = buildStructuredBrandContext(brandBook, businessCalendar)

  const today = new Date()
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + 30)

  const userPrompt = `Date de référence : ${today.toISOString().slice(0, 10)}.
Fenêtre : du ${today.toISOString().slice(0, 10)} au ${horizon.toISOString().slice(0, 10)} (30 jours).

Contexte de la marque :
${brandContext || '(brand book non rempli)'}

Génère les suggestions d'angles éditoriaux en JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    system: buildSystemPrompt([VOICE_SHEET_RULES, BUSINESS_SUGGEST_RULES]),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()

  let suggestions: Suggestion[]
  try {
    const parsed = JSON.parse(text) as { suggestions?: unknown }
    if (!Array.isArray(parsed.suggestions)) {
      throw new Error('Missing suggestions array')
    }
    suggestions = parsed.suggestions.filter(isSuggestion)
    if (suggestions.length === 0) throw new Error('No valid suggestions')
  } catch {
    return Response.json(
      { error: 'AI returned invalid JSON', raw: text },
      { status: 502 },
    )
  }

  await logCreditsUsage({
    tenantId: ctx.tenantId,
    userId: user.id,
    feature: 'generation',
    model: 'claude-opus-4-7',
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
  })

  return Response.json({ ok: true, suggestions })
}
