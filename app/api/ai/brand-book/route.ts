import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { BRAND_BOOK_GENERATION_RULES } from '@/lib/ai/prompts/brand-book'
import { getBrandIdForCurrentUser, updateBrandBook } from '@/lib/supabase/brands'
import type { BrandBook } from '@/types/brand-book'

type OnboardingAnswers = {
  identity: string
  audience: string
  voice: string
}

function isAnswers(value: unknown): value is OnboardingAnswers {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.identity === 'string' &&
    typeof v.audience === 'string' &&
    typeof v.voice === 'string'
  )
}

async function persistAnswers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  brandId: string,
  tenantId: string,
  answers: OnboardingAnswers,
): Promise<void> {
  const rows = (
    [
      ['identity', answers.identity],
      ['audience', answers.audience],
      ['voice', answers.voice],
    ] as const
  ).map(([qid, text]) => ({
    brand_id: brandId,
    tenant_id: tenantId,
    question_id: qid,
    answer: { text },
    source: 'question' as const,
  }))

  const insertable = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => Promise<{ error: { message: string } | null }>
    }
  }
  const { error } = await insertable.from('onboarding_answers').insert(rows)
  if (error) throw new Error(error.message)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) {
    return Response.json(
      { error: 'No brand for current user' },
      { status: 401 },
    )
  }

  const body = (await req.json()) as unknown
  if (!isAnswers(body)) {
    return Response.json({ error: 'Invalid answers payload' }, { status: 400 })
  }

  await persistAnswers(supabase, ctx.brandId, ctx.tenantId, body)

  const userPrompt = `Réponses de l'utilisateur :

1. Identité : ${body.identity}

2. Audience : ${body.audience}

3. Voix : ${body.voice}

Génère le brand book en JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: buildSystemPrompt([VOICE_SHEET_RULES, BRAND_BOOK_GENERATION_RULES]),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()

  let brandBook: BrandBook
  try {
    brandBook = JSON.parse(text) as BrandBook
  } catch {
    return Response.json(
      { error: 'AI returned invalid JSON', raw: text },
      { status: 502 },
    )
  }

  await updateBrandBook(supabase, ctx.brandId, brandBook)

  return Response.json({ ok: true, brandBook })
}
