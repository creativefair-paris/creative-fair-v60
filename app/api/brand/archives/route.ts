// Sprint 36.B.3 — GET et POST /api/brand/archives.
//
// GET  : liste les archives de la marque de l'utilisateur courant.
// POST : crée une archive (la persistance Storage doit avoir eu lieu avant
//        via /api/brand/upload — ici on stocke uniquement le path).

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { ArchiveType, BrandArchive } from '@/types/ma-marque'

const TYPES_AUTORISES = new Set<ArchiveType>(['texte', 'pdf', 'image', 'video', 'lien'])

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

export async function GET() {
  const ctx = await getContext()
  if (!ctx.ok) return NextResponse.json(ctx.body, { status: ctx.status })

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: BrandArchive[] | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data, error } = await adminTyped
    .from('brand_archives')
    .select('id, type, titre, description, url, fichier_path, tags, created_at, updated_at')
    .eq('brand_id', ctx.brandId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'fetch_failed', detail: error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ archives: data ?? [] }, { status: 200 })
}

type CreateBody = {
  type?: unknown
  titre?: unknown
  description?: unknown
  url?: unknown
  fichier_path?: unknown
  tags?: unknown
}

export async function POST(request: Request) {
  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }

  if (typeof body.type !== 'string' || !TYPES_AUTORISES.has(body.type as ArchiveType)) {
    return NextResponse.json(
      { error: 'invalid_type', detail: 'Type non autorisé.' },
      { status: 400 },
    )
  }
  if (typeof body.titre !== 'string' || body.titre.trim().length === 0) {
    return NextResponse.json(
      { error: 'missing_titre', detail: 'Titre requis.' },
      { status: 400 },
    )
  }

  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 400) : ''
  const url = typeof body.url === 'string' && body.url.trim().length > 0 ? body.url.trim().slice(0, 800) : null
  const fichier_path =
    typeof body.fichier_path === 'string' && body.fichier_path.trim().length > 0
      ? body.fichier_path.trim().slice(0, 800)
      : null
  const tags: string[] = Array.isArray(body.tags)
    ? (body.tags as unknown[])
        .filter((t): t is string => typeof t === 'string')
        .map((t) => t.trim().slice(0, 40))
        .filter((t) => t.length > 0)
        .slice(0, 20)
    : []

  // Au moins url OU fichier_path doit exister (sauf type=texte qui peut être seul).
  if (body.type !== 'texte') {
    if (body.type === 'lien' && !url) {
      return NextResponse.json(
        { error: 'missing_url', detail: 'Une URL est requise pour un lien.' },
        { status: 400 },
      )
    }
    if (body.type !== 'lien' && !fichier_path) {
      return NextResponse.json(
        { error: 'missing_file', detail: 'Un fichier est requis.' },
        { status: 400 },
      )
    }
  }

  const ctx = await getContext()
  if (!ctx.ok) return NextResponse.json(ctx.body, { status: ctx.status })

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      insert: (payload: Record<string, unknown>) => {
        select: (cols: string) => {
          maybeSingle: () => Promise<{
            data: BrandArchive | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data, error } = await adminTyped
    .from('brand_archives')
    .insert({
      tenant_id: ctx.tenantId,
      brand_id: ctx.brandId,
      type: body.type as ArchiveType,
      titre: body.titre.trim().slice(0, 200),
      description,
      url,
      fichier_path,
      tags,
    })
    .select('id, type, titre, description, url, fichier_path, tags, created_at, updated_at')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'insert_failed', detail: error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ archive: data }, { status: 201 })
}
