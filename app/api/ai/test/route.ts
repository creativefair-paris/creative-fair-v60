import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { VOICE_SHEET_RULES } from '@/lib/ai/prompts/system'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 64,
      system: VOICE_SHEET_RULES,
      messages: [
        { role: 'user', content: 'Dis bonjour en une phrase.' },
      ],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('')

    return new Response(
      JSON.stringify({ ok: true, response: text, usage: response.usage }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
