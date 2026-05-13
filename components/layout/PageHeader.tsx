// Sprint 36.B.5/8 — Header unifié des pages mères.
//
// Layout :
//   Aujourd'hui › Page                                      [Avatar]
//   <H1 Page>
//
// Le breadcrumb est au-dessus, sur sa propre ligne.
// Le H1 et l'avatar sont sur la même ligne (justify-content: space-between).
//
// Server Component — récupère le user via le même pattern que NavigationBar
// pour fournir UserMenuTrigger en zone trailing.
//
// Sprint 36.B.8 : sticky supprimé. Le <header> est rendu statiquement ;
// le container 1200px est porté par .cfs-page-header-inner.

import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { UserMenuTrigger } from './UserMenuTrigger'

type Props = {
  title: string
  // Breadcrumb : array de labels (le 1er pointe automatiquement vers /programme).
  // Si non fourni, on déduit "Aujourd'hui › {title}".
  breadcrumb?: ReadonlyArray<string>
  // Sprint 36.H — supprime la breadcrumb si true (cas /aujourd-hui : H1 = "Aujourd'hui"
  // donc afficher "Aujourd'hui" en breadcrumb au-dessus serait un doublon).
  hideBreadcrumb?: boolean
  // Sprint 36.H — sous-titre H2 sous le H1, opacité 0.6, taille intermédiaire.
  subtitle?: string
  // Override du trailing (utile pour les pages non-auth comme login).
  trailing?: ReactNode
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
      // colonne prenom absente — fallback
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
    if (!tenantId) return { authenticated: false }

    let nomMarque = ''
    try {
      const { data } = await supabase
        .from('brands')
        .select('name')
        .eq('tenant_id', tenantId)
        .maybeSingle()
      nomMarque = (data as BrandRow | null)?.name ?? ''
    } catch {
      nomMarque = ''
    }

    return {
      authenticated: true,
      prenom: capitalize(prenom ?? user.email?.split('@')[0] ?? 'Toi'),
      nomMarque,
    }
  } catch {
    return { authenticated: false }
  }
}

export async function PageHeader({ title, breadcrumb, hideBreadcrumb, subtitle, trailing }: Props) {
  const items: ReadonlyArray<string> = breadcrumb ?? ["Aujourd'hui", title]

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
    <header className="cfs-page-header">
      <div className="cfs-page-header-inner">
        {hideBreadcrumb ? null : <Breadcrumb items={items} />}
        <div className="cfs-page-header-row">
          <div className="cfs-page-header-title-stack">
            <h1 className="cfs-page-header-title">{title}</h1>
            {subtitle ? (
              <p className="cfs-page-header-subtitle">{subtitle}</p>
            ) : null}
          </div>
          {trailingNode ? (
            <div className="cfs-page-header-trailing">{trailingNode}</div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
