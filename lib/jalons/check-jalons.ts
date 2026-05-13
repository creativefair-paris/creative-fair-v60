// Sprint 37.C (F26) — Doctrine 3 jalons (progressive disclosure version douce).
//
// Pas de hard-block : toutes les destinations restent cliquables. Mais
// friction explicite via dialogue si le pilote saute un jalon (cf.
// JalonGuardDialog).
//
// Jalon 1 — Ma Marque posée : 4 fondations critiques sur 14 total.
//   Critiques V1 : piliers_narratifs (≥1), secteur, ton, singularite.
// Jalon 2 — Mon Programme actif : un programme `status = 'active'` existe.
// Jalon 3 — Production en cours : posts (publiés ou en draft) existent.

import type { SupabaseClient } from '@supabase/supabase-js'

export type JalonState = 'marque' | 'programme' | 'production'

export interface JalonStatus {
  current: JalonState
  marque: {
    complete: boolean
    criticalFoundationsCount: number
    total: number
  }
  programme: {
    hasActive: boolean
    programmeId?: string
  }
  production: {
    postsCount: number
    publishedCount: number
  }
}

const CRITICAL_FOUNDATIONS_TOTAL = 4

type BrandRow = {
  id: string
  piliers_narratifs?: unknown
  secteur?: string | null
  ton?: string | null
  singularite?: string | null
}

function countCriticalFoundations(brand: BrandRow): number {
  let count = 0
  const piliers = brand.piliers_narratifs
  if (Array.isArray(piliers) && piliers.length > 0) count += 1
  if (typeof brand.secteur === 'string' && brand.secteur.trim().length > 0) count += 1
  if (typeof brand.ton === 'string' && brand.ton.trim().length > 0) count += 1
  if (typeof brand.singularite === 'string' && brand.singularite.trim().length > 0) count += 1
  return count
}

export async function checkJalonStatus(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<JalonStatus> {
  // Jalon 1 — Ma Marque
  const { data: rawBrand } = await supabase
    .from('brands')
    .select('id, piliers_narratifs, secteur, ton, singularite')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brand = (rawBrand as BrandRow | null) ?? null
  const criticalFoundationsCount = brand ? countCriticalFoundations(brand) : 0
  const marqueComplete = criticalFoundationsCount >= CRITICAL_FOUNDATIONS_TOTAL

  // Jalon 2 — Mon Programme
  const todayISO = new Date().toISOString().slice(0, 10)
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id, date_fin')
    .eq('status', 'active')
    .gte('date_fin', todayISO)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const programmeRow = rawProgramme as { id?: string; date_fin?: string } | null
  const hasActiveProgramme = programmeRow != null && Boolean(programmeRow.id)

  // Jalon 3 — Production
  let postsCount = 0
  let publishedCount = 0
  if (brand) {
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('id, statut')
      .eq('brand_id', brand.id)
    const posts = (rawPosts as Array<{ id: string; statut: string | null }> | null) ?? []
    postsCount = posts.length
    publishedCount = posts.filter((p) => p.statut === 'publie').length
  }

  let current: JalonState = 'marque'
  if (marqueComplete) current = 'programme'
  if (marqueComplete && hasActiveProgramme) current = 'production'

  return {
    current,
    marque: {
      complete: marqueComplete,
      criticalFoundationsCount,
      total: CRITICAL_FOUNDATIONS_TOTAL,
    },
    programme: {
      hasActive: hasActiveProgramme,
      programmeId: programmeRow?.id,
    },
    production: {
      postsCount,
      publishedCount,
    },
  }
}

// Helper côté client : détermine si un jalon donné est atteint (cumulatif).
export function isJalonReached(status: JalonStatus, target: JalonState): boolean {
  if (target === 'marque') return status.marque.complete
  if (target === 'programme') return status.marque.complete && status.programme.hasActive
  if (target === 'production') {
    return status.marque.complete && status.programme.hasActive && status.production.postsCount > 0
  }
  return false
}
