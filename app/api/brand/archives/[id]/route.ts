// Sprint 36.B.3 — PATCH et DELETE /api/brand/archives/[id].
//
// DELETE supprime également le fichier Storage associé si présent.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { BrandArchive } from '@/types/ma-marque'

const BUCKET = 'brand-archives'

async function getContext(): Promise<
  | { ok: true; tenantId: string; brandId: string }
  | { ok: false; status: number; body: { error: string; detail: string } }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, status: 401, body: { error: 'unauthorized', detail: 'Session requise.' } }
  }
  const { data: profileData } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileData as { tenant_id: string | null } | null)?.tenant_id ?? null
  if (!tenantId) {
    return { ok: false, status: 404, body: { error: 'no_tenant', detail: 'Aucun tenant associé.' } }
  }
  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brandId = (brandRow as { id: string } | null)?.id ?? null
  if (!brandId) {
    return { ok: false, status: 404, body: { error: 'no_brand', detail: 'Aucune marque trouvée.' } }
  }
  return { ok: true, tenantId, brandId }
}

type Ctx = { params: Promise<{ id: string }> }

type ArchiveQuery = {
  data: BrandArchive | null
  error: { message: string } | null
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  if (typeof id !== 'string' || id.trim().length === 0) {
    return NextResponse.json(
      { error: 'invalid_id', detail: 'Identifiant manquant.' },
      { status: 400 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }

  const session = await getContext()
  if (!session.ok) return NextResponse.json(session.body, { status: session.status })

  const patch: Record<string, unknown> = {}
  if (typeof body.titre === 'string') patch.titre = body.titre.trim().slice(0, 200)
  if (typeof body.description === 'string') patch.description = body.description.trim().slice(0, 400)
  if (typeof body.url === 'string') patch.url = body.url.trim().slice(0, 800)
  if (Array.isArray(body.tags)) {
    patch.tags = (body.tags as unknown[])
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim().slice(0, 40))
      .filter((t) => t.length > 0)
      .slice(0, 20)
  }
  patch.updated_at = new Date().toISOString()

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json(
      { error: 'no_op', detail: 'Aucun champ modifié.' },
      { status: 400 },
    )
  }

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            select: (cols: string) => { maybeSingle: () => Promise<ArchiveQuery> }
          }
        }
      }
    }
  }
  const { data, error } = await adminTyped
    .from('brand_archives')
    .update(patch)
    .eq('id', id)
    .eq('brand_id', session.brandId)
    .select('id, type, titre, description, url, fichier_path, tags, created_at, updated_at')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'update_failed', detail: error.message },
      { status: 500 },
    )
  }
  if (!data) {
    return NextResponse.json(
      { error: 'not_found', detail: 'Archive introuvable.' },
      { status: 404 },
    )
  }
  return NextResponse.json({ archive: data }, { status: 200 })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  if (typeof id !== 'string' || id.trim().length === 0) {
    return NextResponse.json(
      { error: 'invalid_id', detail: 'Identifiant manquant.' },
      { status: 400 },
    )
  }

  const session = await getContext()
  if (!session.ok) return NextResponse.json(session.body, { status: session.status })

  const admin = createAdmin()

  // 1) Récupère la ligne pour le fichier_path avant suppression.
  const fetchAdmin = admin as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<ArchiveQuery>
          }
        }
      }
    }
  }
  const { data: existing } = await fetchAdmin
    .from('brand_archives')
    .select('id, type, titre, description, url, fichier_path, tags, created_at, updated_at')
    .eq('id', id)
    .eq('brand_id', session.brandId)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json(
      { error: 'not_found', detail: 'Archive introuvable.' },
      { status: 404 },
    )
  }

  // 2) Supprime le row.
  const delAdmin = admin as unknown as {
    from: (t: string) => {
      delete: () => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
        }
      }
    }
  }
  const { error: delErr } = await delAdmin
    .from('brand_archives')
    .delete()
    .eq('id', id)
    .eq('brand_id', session.brandId)

  if (delErr) {
    return NextResponse.json(
      { error: 'delete_failed', detail: delErr.message },
      { status: 500 },
    )
  }

  // 3) Supprime le fichier Storage si présent (best-effort).
  if (existing.fichier_path) {
    try {
      await admin.storage.from(BUCKET).remove([existing.fichier_path])
    } catch {
      // Silencieux — le row est déjà supprimé, le fichier orphelin
      // sera nettoyé par un cron ultérieur.
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
