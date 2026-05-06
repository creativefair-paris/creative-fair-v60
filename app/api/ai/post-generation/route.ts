import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import {
  POST_GENERATION_BASE,
  STEP_ACTUALITE_RULES,
  STEP_ANGLE_RULES,
  STEP_HOOK_RULES,
  STEP_SLIDES_RULES,
  STEP_CAPTION_RULES,
  STEP_FINAL_RULES,
} from '@/lib/ai/prompts/post-generation'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import { buildStructuredBrandContext } from '@/lib/ai/brand-context'
import { logCreditsUsage } from '@/lib/ai/credits'
import type { PostDraft } from '@/types/post-draft'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

type StepId = 1 | 2 | 3 | 4 | 5 | 6
type PostGenerationType = 'anecdote_live' | 'anecdote_custom'

type StepResult =
  | { kind: 'choices'; options: string[] }
  | { kind: 'text'; value: string }
  | { kind: 'list'; items: string[] }

type Body = {
  postId?: string
  step?: StepId
  type?: PostGenerationType
  userInput?: string
  draft?: PostDraft
}

function isStepResult(value: unknown): value is StepResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.kind === 'choices') {
    return Array.isArray(v.options) && v.options.every((o) => typeof o === 'string')
  }
  if (v.kind === 'text') {
    return typeof v.value === 'string'
  }
  if (v.kind === 'list') {
    return Array.isArray(v.items) && v.items.every((o) => typeof o === 'string')
  }
  return false
}

function rulesForStep(step: StepId, type: PostGenerationType): string {
  if (step === 1) {
    if (type === 'anecdote_custom') {
      // En mode custom, l'utilisateur fournit l'actualité ; pas de prompt d'étape 1.
      return ''
    }
    return STEP_ACTUALITE_RULES
  }
  if (step === 2) return STEP_ANGLE_RULES
  if (step === 3) return STEP_HOOK_RULES
  if (step === 4) return STEP_SLIDES_RULES
  if (step === 5) return STEP_CAPTION_RULES
  return STEP_FINAL_RULES
}

function userPromptForStep(
  step: StepId,
  type: PostGenerationType,
  draft: PostDraft,
  userInput: string | undefined,
  brandContext: string,
): string {
  const lines: string[] = []
  lines.push(`Contexte de la marque :\n${brandContext || '(brand book non rempli)'}`)
  lines.push(`Type de publication : ${type === 'anecdote_live' ? 'Anecdote live (actualité fraîche)' : 'Anecdote (histoire racontée par la marque)'}`)

  if (draft.actualite) lines.push(`Actualité retenue : ${draft.actualite}`)
  if (draft.angle) lines.push(`Angle retenu : ${draft.angle}`)
  if (draft.hook) lines.push(`Hook retenu : ${draft.hook}`)
  if (draft.slides && draft.slides.length > 0) {
    lines.push(`Slides retenues :\n${draft.slides.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)
  }
  if (userInput) lines.push(`Indication utilisateur : ${userInput}`)

  if (step === 1 && type === 'anecdote_live') {
    lines.push('\nUtilise l\'outil web_search pour trouver trois actualités récentes (72 dernières heures) liées au domaine de la marque, puis renvoie le JSON décrit.')
  } else if (step === 1 && type === 'anecdote_custom') {
    lines.push('\nReformule l\'indication utilisateur en trois pistes narratives distinctes pour une anecdote.')
  } else if (step === 2) {
    lines.push('\nProduis trois angles éditoriaux distincts à partir de l\'actualité retenue.')
  } else if (step === 3) {
    lines.push('\nÉcris un hook unique.')
  } else if (step === 4) {
    lines.push('\nÉcris cinq slides.')
  } else if (step === 5) {
    lines.push('\nÉcris la légende complète et propose les hashtags.')
  } else if (step === 6) {
    lines.push('\nConfirme la finalisation.')
  }

  return lines.join('\n\n')
}

function applyResultToDraft(
  draft: PostDraft,
  step: StepId,
  type: PostGenerationType,
  result: StepResult,
  userInput: string | undefined,
): PostDraft {
  const next: PostDraft = { ...draft }

  if (step === 1 && userInput && type === 'anecdote_live') {
    // Si la requête est lancée pour l'étape 2 avec userInput de l'étape 1,
    // c'est traité côté étape 2. Ici on ne touche pas à actualite.
  }

  if (step === 2 && userInput) next.actualite = userInput
  if (step === 3 && userInput) next.angle = userInput

  if (step === 3 && result.kind === 'text') next.hook = result.value
  if (step === 4 && result.kind === 'list') next.slides = result.items
  if (step === 5 && result.kind === 'text') {
    const lines = result.value.split('\n')
    const hashtagLineIdx = [...lines]
      .reverse()
      .findIndex((l) => l.trim().startsWith('#'))
    if (hashtagLineIdx >= 0) {
      const idx = lines.length - 1 - hashtagLineIdx
      const hashtagsLine = lines[idx]
      const tags = hashtagsLine
        ? hashtagsLine
            .split(/\s+/)
            .filter((t) => t.startsWith('#'))
            .map((t) => t.replace(/^#/, '').toLowerCase())
        : []
      const captionLines = lines.slice(0, idx).join('\n').trim()
      next.caption = captionLines
      next.hashtags = tags
    } else {
      next.caption = result.value.trim()
    }
  }

  return next
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null
  if (!body || !body.postId || !body.step || !body.type) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (body.type !== 'anecdote_live' && body.type !== 'anecdote_custom') {
    return Response.json({ error: 'Unsupported type for this route' }, { status: 400 })
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

  // Confirme que le post appartient bien au tenant courant.
  const { data: rawPost } = await supabase
    .from('posts')
    .select('id, tenant_id, brand_id, status, content, type')
    .eq('id', body.postId)
    .maybeSingle()

  type PostRow = {
    id: string
    tenant_id: string
    brand_id: string
    status: string
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

  const step = body.step as StepId
  const draftIn = body.draft ?? post.content ?? {}

  // Avant l'appel IA, propage le userInput dans le draft pour les étapes où
  // il représente une décision utilisateur (choix d'option à l'étape précédente,
  // ou texte initial pour anecdote_custom).
  const workingDraft: PostDraft = { ...draftIn }
  if (step === 1 && body.type === 'anecdote_custom' && body.userInput) {
    workingDraft.actualite = body.userInput
  }
  if (step === 2 && body.userInput) workingDraft.actualite = body.userInput
  if (step === 3 && body.userInput) workingDraft.angle = body.userInput

  let result: StepResult

  if (step === 6) {
    result = { kind: 'text', value: 'Ta publication est prête.' }
  } else {
    const stepRules = rulesForStep(step, body.type)
    const systemParts = [VOICE_SHEET_RULES, POST_GENERATION_BASE, stepRules].filter(
      Boolean,
    )

    type AnthropicCreateInput = Parameters<typeof anthropic.messages.create>[0]
    type AnthropicTool = NonNullable<AnthropicCreateInput['tools']>[number]
    const toolWebSearch = {
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 3,
    } as unknown as AnthropicTool

    const useWebSearch = step === 1 && body.type === 'anecdote_live'

    const createParams: AnthropicCreateInput = {
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      system: buildSystemPrompt(systemParts),
      messages: [
        {
          role: 'user',
          content: userPromptForStep(
            step,
            body.type,
            workingDraft,
            body.userInput,
            brandContext,
          ),
        },
      ],
    }
    if (useWebSearch) {
      createParams.tools = [toolWebSearch]
    }

    const response = await anthropic.messages.create(createParams)

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      // Tentative : extraire le premier bloc JSON.
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          return Response.json(
            { error: 'AI returned invalid JSON', raw: text },
            { status: 502 },
          )
        }
      } else {
        return Response.json(
          { error: 'AI returned no JSON', raw: text },
          { status: 502 },
        )
      }
    }
    if (!isStepResult(parsed)) {
      return Response.json(
        { error: 'AI returned invalid step result' },
        { status: 502 },
      )
    }
    result = parsed

    await logCreditsUsage({
      tenantId: ctx.tenantId,
      userId: user.id,
      feature: 'generation',
      model: 'claude-opus-4-7',
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
    })
  }

  const updatedDraft = applyResultToDraft(
    workingDraft,
    step,
    body.type,
    result,
    body.userInput,
  )

  const newStatus = step === 6 ? 'ready' : 'in_progress'

  const updatable = supabase as unknown as {
    from: (t: string) => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  const { error: updateError } = await updatable
    .from('posts')
    .update({
      content: updatedDraft,
      status: newStatus,
      type: post.type ?? body.type,
    })
    .eq('id', body.postId)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ ok: true, result, draft: updatedDraft })
}
