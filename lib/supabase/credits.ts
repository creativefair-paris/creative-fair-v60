import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreditsByFeature } from '@/components/layout/CreditsIndicator'

type UsageRow = { feature: keyof CreditsByFeature }

const EMPTY: CreditsByFeature = {
  coaching: 0,
  generation: 0,
  brief: 0,
  brand_book: 0,
  conseiller: 0,
}

function startOfMonthIso(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

export async function getCreditsThisMonth(
  supabase: SupabaseClient,
): Promise<{ total: number; byFeature: CreditsByFeature }> {
  const { data, error } = await supabase
    .from('credits_usage')
    .select('feature')
    .gte('created_at', startOfMonthIso())

  if (error || !data) return { total: 0, byFeature: { ...EMPTY } }

  const byFeature: CreditsByFeature = { ...EMPTY }
  for (const row of data as UsageRow[]) {
    if (row.feature in byFeature) {
      byFeature[row.feature] += 1
    }
  }
  const total =
    byFeature.coaching +
    byFeature.generation +
    byFeature.brief +
    byFeature.brand_book +
    byFeature.conseiller

  return { total, byFeature }
}
