import { NextRequest } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/caching'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'
import { buildBrandContext } from '@/lib/ai/tenant-context'

type ProfileRow = { tenant_id: string }
type BrandRow = {
  name: string
  values: string[] | null
  audience: string | null
  tone: string | null
  mission: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json() as { messages?: unknown[] }
  const messages = body.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = rawProfile as ProfileRow | null

  let brandContext = ''
  if (profile?.tenant_id) {
    const { data: rawBrand } = await supabase
      .from('brands')
      .select('name, values, audience, tone, mission')
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle()

    if (rawBrand) {
      const brand = rawBrand as BrandRow
      brandContext = buildBrandContext({
        name: brand.name,
        values: brand.values ?? undefined,
        audience: brand.audience ?? undefined,
        tone: brand.tone ?? undefined,
        mission: brand.mission ?? undefined,
      })
    }
  }

  const systemParts = [VOICE_SHEET_RULES]
  if (brandContext) systemParts.push(`\nContexte de la marque :\n${brandContext}`)

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(systemParts),
    messages: messages as Anthropic.Messages.MessageParam[],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const data = JSON.stringify({ text: chunk.delta.text })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
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
