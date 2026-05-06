import 'server-only'
import { createAdmin } from '@/lib/supabase/admin'

export type CreditFeature =
  | 'coaching'
  | 'generation'
  | 'brief'
  | 'brand_book'
  | 'conseiller'

// Tarifs Anthropic par million de tokens (en USD).
// Source : https://www.anthropic.com/pricing — à mettre à jour si évolution.
const PRICING_USD_PER_M: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
}

const USD_TO_EUR = 0.92

export function estimateCostEur(
  model: string,
  tokensInput: number,
  tokensOutput: number,
): number {
  const pricing = PRICING_USD_PER_M[model]
  if (!pricing) return 0
  const usd =
    (tokensInput / 1_000_000) * pricing.input +
    (tokensOutput / 1_000_000) * pricing.output
  return Number((usd * USD_TO_EUR).toFixed(4))
}

export async function logCreditsUsage(params: {
  tenantId: string
  userId: string
  feature: CreditFeature
  model: string
  tokensInput: number
  tokensOutput: number
}): Promise<void> {
  const admin = createAdmin()
  const cost = estimateCostEur(params.model, params.tokensInput, params.tokensOutput)

  const insertable = admin as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => Promise<{ error: { message: string } | null }>
    }
  }

  const { error } = await insertable.from('credits_usage').insert([
    {
      tenant_id: params.tenantId,
      user_id: params.userId,
      feature: params.feature,
      tokens_input: params.tokensInput,
      tokens_output: params.tokensOutput,
      cost_eur: cost,
    },
  ])

  if (error) {
    // Le logging ne doit pas casser la requête utilisateur.
    console.error('credits_usage insert failed:', error.message)
  }
}
