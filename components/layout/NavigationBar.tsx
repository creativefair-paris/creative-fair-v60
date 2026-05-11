// Sprint 33 — NavigationBar iOS large title (§7.3 large-title)
// Sprint 36.B.1 — async server : récupère user + brand pour fournir
// UserMenuTrigger en zone trailing. BackButton optionnel à gauche.
//
// Architecture :
// - NavigationBar (server) : fetch Supabase, rend la structure.
// - UserMenuTrigger (client, fichier séparé) : gère l'état bulle et logout.
//
// La prop `trailing` est conservée pour rétro-compat — si fournie, elle
// remplace le UserMenuTrigger. Cas d'usage : routes non-authentifiées
// (login, onboarding) qui n'ont pas accès à user/brand.
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from './BackButton'
import { UserMenuTrigger } from './UserMenuTrigger'

type NavigationBarProps = {
  title: string
  trailing?: ReactNode
  showBackButton?: boolean
  backHref?: string
}

type ProfileRow = { tenant_id: string | null; prenom?: string | null }
type BrandRow = { name: string | null }

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

async function loadUserMeta(): Promise<
  | { authenticated: false }
  | { authenticated: true; prenom: string; nomMarque: string; photoUrl?: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { authenticated: false }

    // Tentative récup prenom (peut ne pas exister dans le schéma)
    let prenom: string | null = null
    let tenantId: string | null = null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id, prenom')
        .eq('id', user.id)
        .maybeSingle()
      if (!error && data) {
        tenantId = (data as ProfileRow).tenant_id ?? null
        prenom = (data as ProfileRow).prenom ?? null
      }
    } catch {
      // Colonne prenom inexistante — fallback sur select minimal
    }
    if (tenantId === null) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .maybeSingle()
        tenantId = (data as { tenant_id: string | null } | null)?.tenant_id ?? null
      } catch {
        tenantId = null
      }
    }

    // Fallback prénom : partie locale email capitalisée
    if (!prenom && user.email) {
      const local = user.email.split('@')[0] ?? ''
      prenom = capitalize(local)
    }
    if (!prenom) prenom = 'Toi'

    // Nom de marque
    let nomMarque = 'Aucune marque'
    if (tenantId) {
      try {
        const { data } = await supabase
          .from('brands')
          .select('name')
          .eq('tenant_id', tenantId)
          .maybeSingle()
        const brand = data as BrandRow | null
        if (brand?.name) nomMarque = brand.name
      } catch {
        // ignore
      }
    }

    return { authenticated: true, prenom, nomMarque }
  } catch {
    return { authenticated: false }
  }
}

export async function NavigationBar({
  title,
  trailing,
  showBackButton = false,
  backHref,
}: NavigationBarProps) {
  let trailingNode: ReactNode = trailing ?? null

  if (trailingNode === null) {
    const meta = await loadUserMeta()
    if (meta.authenticated) {
      trailingNode = (
        <UserMenuTrigger
          prenom={meta.prenom}
          nomMarque={meta.nomMarque}
          photoUrl={meta.photoUrl}
        />
      )
    }
  }

  return (
    <header className="cfs-navbar">
      <div className="cfs-navbar__leading">
        {showBackButton ? <BackButton href={backHref} /> : null}
        <h1 className="cfs-navbar__title">{title}</h1>
      </div>
      {trailingNode != null ? (
        <div className="cfs-navbar__trailing">{trailingNode}</div>
      ) : null}
    </header>
  )
}
