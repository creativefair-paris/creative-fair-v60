import type Anthropic from '@anthropic-ai/sdk'

export function buildCacheableContent(text: string): Anthropic.Messages.TextBlockParam {
  return {
    type: 'text',
    text,
    cache_control: { type: 'ephemeral' },
  }
}

export function buildSystemPrompt(parts: string[]): Anthropic.Messages.TextBlockParam[] {
  return parts.map((part, i) => ({
    type: 'text' as const,
    text: part,
    ...(i === parts.length - 1 ? { cache_control: { type: 'ephemeral' as const } } : {}),
  }))
}
