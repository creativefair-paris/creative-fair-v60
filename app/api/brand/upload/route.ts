// Sprint 36.B.3 — POST /api/brand/upload
//
// Téléverse un fichier dans le bucket privé brand-archives.
// Path : {tenant_id}/{brand_id}/{dossier}/{timestamp-slug}.{ext}
// Retourne { path } qui est ensuite stocké dans le JSONB brand_book ou
// dans brand_archives.fichier_path.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'video/mp4',
  'video/quicktime',
])
const DOSSIERS_AUTORISES = new Set(['brand-book', 'uploads'])
const BUCKET = 'brand-archives'

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'invalid_form', detail: 'Corps multipart invalide.' },
      { status: 400 },
    )
  }

  const file = form.get('file')
  const dossierRaw = form.get('dossier')
  const dossier = typeof dossierRaw === 'string' ? dossierRaw : 'uploads'
  if (!DOSSIERS_AUTORISES.has(dossier)) {
    return NextResponse.json(
      { error: 'invalid_dossier', detail: 'Dossier non autorisé.' },
      { status: 400 },
    )
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'missing_file', detail: 'Aucun fichier reçu.' },
      { status: 400 },
    )
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: 'empty_file', detail: 'Fichier vide.' },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'too_large', detail: 'Fichier trop volumineux (50 Mo max).' },
      { status: 400 },
    )
  }
  if (file.type && !ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      { error: 'mime_refuse', detail: 'Type de fichier non accepté.' },
      { status: 400 },
    )
  }

  // Auth + tenant + brand
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'unauthorized', detail: 'Session requise.' },
      { status: 401 },
    )
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileData as { tenant_id: string | null } | null)?.tenant_id ?? null
  if (!tenantId) {
    return NextResponse.json(
      { error: 'no_tenant', detail: 'Aucun tenant associé.' },
      { status: 404 },
    )
  }

  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brandId = (brandRow as { id: string } | null)?.id ?? null
  if (!brandId) {
    return NextResponse.json(
      { error: 'no_brand', detail: 'Aucune marque trouvée.' },
      { status: 404 },
    )
  }

  // Path : tenant/brand/dossier/timestamp-nom
  const originalName = file instanceof File ? file.name : 'fichier'
  const ts = Date.now().toString(36)
  const safe = slug(originalName) || 'fichier'
  const path = `${tenantId}/${brandId}/${dossier}/${ts}-${safe}`

  const admin = createAdmin()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadErr) {
    return NextResponse.json(
      { error: 'upload_failed', detail: uploadErr.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, path }, { status: 200 })
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'Utilise POST.' },
    { status: 405 },
  )
}
