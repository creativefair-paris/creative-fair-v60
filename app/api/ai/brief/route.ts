import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { BRIEF_GENERATION_RULES } from '@/lib/ai/prompts/brief'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import { buildStructuredBrandContext } from '@/lib/ai/brand-context'
import { logCreditsUsage } from '@/lib/ai/credits'
import type { PostDraft } from '@/types/post-draft'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

type BriefFormat = 'reels' | 'story' | 'newsletter'

type Body = {
  postId?: string
  format?: BriefFormat
  prompt?: string
}

const FORMAT_LABEL: Record<BriefFormat, string> = {
  reels: 'Reels Instagram',
  story: 'Format éphémère Instagram',
  newsletter: 'Newsletter',
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null
  if (!body || !body.postId || !body.format || !body.prompt) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (
    body.format !== 'reels' &&
    body.format !== 'story' &&
    body.format !== 'newsletter'
  ) {
    return Response.json({ error: 'Unsupported format' }, { status: 400 })
  }

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

  const { data: rawPost } = await supabase
    .from('posts')
    .select('id, tenant_id, content, type')
    .eq('id', body.postId)
    .maybeSingle()

  type PostRow = {
    id: string
    tenant_id: string
    content: PostDraft | null
    type: string | null
  }
  const post = rawPost as PostRow | null
  if (!post || post.tenant_id !== ctx.tenantId) {
    return Response.json({ error: 'Post not found' }, { status: 404 })
  }

  const brand = await getBrandByTenantId(supabase, ctx.tenantId)
  const brandBook = (brand?.brand_book ?? null) as BrandBook | null
  const businessCalendar = (brand?.business_calendar ?? null) as BusinessCalendar | null
  const brandContext = buildStructuredBrandContext(brandBook, businessCalendar)

  const userPrompt = `Format demandé : ${FORMAT_LABEL[body.format]}.

Indication de l'utilisateur :
${body.prompt}

Contexte de la marque :
${brandContext || '(brand book non rempli)'}

Rédige le brief complet en markdown selon la structure imposée.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: buildSystemPrompt([VOICE_SHEET_RULES, BRIEF_GENERATION_RULES]),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()

  if (!text) {
    return Response.json({ error: 'AI returned empty brief' }, { status: 502 })
  }

  const updatedDraft: PostDraft = {
    ...(post.content ?? {}),
    brief: text,
    briefFormat: body.format,
  }

  const updatable = supabase as unknown as {
    from: (t: string) => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  const newType = body.format === 'newsletter' ? 'newsletter' : body.format
  const { error: updateError } = await updatable
    .from('posts')
    .update({
      content: updatedDraft,
      status: 'ready',
      type: newType,
    })
    .eq('id', body.postId)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  await logCreditsUsage({
    tenantId: ctx.tenantId,
    userId: user.id,
    feature: 'brief',
    model: 'claude-sonnet-4-6',
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
  })

  return Response.json({ ok: true, brief: text, draft: updatedDraft })
}
