import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { BRAND_BOOK_GENERATION_RULES } from '@/lib/ai/prompts/brand-book'
import { getBrandByTenantId, updateBrandBook } from '@/lib/supabase/brands'
import type { Brand } from '@/types/brand-book'
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

  // Auth check — cookies transmis automatiquement par le navigateur (same-origin)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Tenant check
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id
  if (!tenantId) {
    return Response.json({ error: 'Aucun tenant associé' }, { status: 401 })
  }

  // Parse body avant la création du brand (un seul read du stream)
  const body = (await req.json()) as unknown
  if (!isAnswers(body)) {
    return Response.json({ error: 'Invalid answers payload' }, { status: 400 })
  }

  // Get or create brand — pendant l'onboarding le brand n'existe pas encore
  let brand = await getBrandByTenantId(supabase, tenantId)

  if (!brand) {
    const { data: rawTenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', tenantId)
      .maybeSingle()

    const brandName = (rawTenant as { name?: string } | null)?.name ?? 'Ma marque'

    type BrandInsert = {
      from: (t: 'brands') => {
        insert: (row: { tenant_id: string; name: string }) => {
          select: (cols: string) => {
            single: () => Promise<{ data: Brand | null; error: { message: string } | null }>
          }
        }
      }
    }
    const db = supabase as unknown as BrandInsert
    const { data: created, error: createErr } = await db
      .from('brands')
      .insert({ tenant_id: tenantId, name: brandName })
      .select(
        'id, tenant_id, name, brand_book, business_calendar, brand_book_status, questions_answered, created_at, updated_at',
      )
      .single()

    if (createErr ?? !created) {
      return Response.json({ error: 'Impossible de créer la marque' }, { status: 500 })
    }

    brand = created
  }

  const ctx = { brandId: brand.id, tenantId }

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
