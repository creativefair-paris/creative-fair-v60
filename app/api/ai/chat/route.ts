import { NextRequest } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import { buildStructuredBrandContext } from '@/lib/ai/brand-context'
import { logCreditsUsage } from '@/lib/ai/credits'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Body = {
  messages?: unknown[]
  conversationId?: string | null
  contextPage?: string | null
}

const CONSEILLER_RULES = `
Tu es le Conseiller IA de Creative Fair Studio.
Tu aides un créatif culturel à structurer sa communication digitale.
Tu réponds avec précision, sans formules creuses, en t'appuyant sur le brand book quand il existe.
Tu n'inventes rien : si l'information n'est pas dans le contexte, tu le dis et tu poses une question.
`.trim()

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string'
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = (await req.json().catch(() => null)) as Body | null
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messages = body.messages.filter(isChatMessage)
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'no valid messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) {
    return new Response(JSON.stringify({ error: 'No brand for current user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const brand = await getBrandByTenantId(supabase, ctx.tenantId)
  const brandBook = (brand?.brand_book ?? null) as BrandBook | null
  const businessCalendar = (brand?.business_calendar ?? null) as BusinessCalendar | null
  const brandContext = buildStructuredBrandContext(brandBook, businessCalendar)

  // Crée ou met à jour la conversation (RLS s'occupe du tenant).
  let conversationId = body.conversationId ?? null

  const writable = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
      update: (vals: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  if (!conversationId) {
    const { data: created } = await writable
      .from('conversations')
      .insert([
        {
          user_id: user.id,
          tenant_id: ctx.tenantId,
          brand_id: ctx.brandId,
          context_page: body.contextPage ?? null,
          messages: messages,
        },
      ])
      .select('id')
      .single()
    if (created) conversationId = created.id
  } else {
    await writable
      .from('conversations')
      .update({
        messages: messages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
  }

  const systemParts = [VOICE_SHEET_RULES, CONSEILLER_RULES]
  if (brandContext) {
    systemParts.push(`Contexte de la marque :\n${brandContext}`)
  }

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 1500,
    system: buildSystemPrompt(systemParts),
    messages: messages as Anthropic.Messages.MessageParam[],
  })

  const encoder = new TextEncoder()
  let assistantText = ''
  const tenantId = ctx.tenantId
  const userId = user.id
  const finalConversationId = conversationId

  const readable = new ReadableStream({
    async start(controller) {
      if (finalConversationId) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ conversationId: finalConversationId })}\n\n`,
          ),
        )
      }
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            assistantText += chunk.delta.text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`),
            )
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'stream error' })}\n\n`,
          ),
        )
      } finally {
        const finalMessage = await stream.finalMessage().catch(() => null)
        if (finalMessage && finalConversationId) {
          const fullMessages = [
            ...messages,
            { role: 'assistant' as const, content: assistantText },
          ]
          await writable
            .from('conversations')
            .update({
              messages: fullMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', finalConversationId)

          await logCreditsUsage({
            tenantId,
            userId,
            feature: 'conseiller',
            model: 'claude-opus-4-7',
            tokensInput: finalMessage.usage.input_tokens,
            tokensOutput: finalMessage.usage.output_tokens,
          })
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
