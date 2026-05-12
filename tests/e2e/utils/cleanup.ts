// Sprint 36.E — Cleanup des users de test.
//
// Supprime les users dont email correspond au pattern test-*@<TEST_EMAIL_DOMAIN>.
// FK CASCADE depuis profiles.id → auth.users.id supprime les profiles.
// FK CASCADE depuis brand_*, posts, etc. → tenants.id supprime tout en chaîne
// si le tenant est supprimé. Pour simplifier, on supprime juste les users
// (et leur tenant via une requête séparée car pas de FK auth.users → tenants).

import { getAdmin, TEST_EMAIL_DOMAIN } from './test-helpers'

type AuthUser = {
  id: string
  email?: string | null
}

type ProfileRow = {
  id: string
  tenant_id: string | null
}

// Liste les users auth dont email matche le pattern test-*@<domaine>.
async function listTestUsers(): Promise<AuthUser[]> {
  const admin = getAdmin()
  // L'API admin.listUsers est paginée. Pour V1 (< 1000 users de test),
  // une seule page suffit. À surveiller si la suite enfle.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    // eslint-disable-next-line no-console
    console.warn(`[cleanup] listUsers failed: ${error.message}`)
    return []
  }
  const all = (data?.users ?? []) as AuthUser[]
  return all.filter((u) => {
    if (!u.email) return false
    return u.email.startsWith('test-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)
  })
}

export async function cleanupTestUsers(): Promise<{ deleted: number }> {
  const admin = getAdmin()
  const users = await listTestUsers()
  if (users.length === 0) return { deleted: 0 }

  // 1. Pour chaque user, lire son profile pour récupérer tenant_id.
  const adminTyped = admin as unknown as {
    from: (t: 'profiles' | 'tenants') => {
      select: (cols: string) => {
        in: (col: string, vals: string[]) => Promise<{
          data: ProfileRow[] | null
          error: { message: string } | null
        }>
      }
      delete: () => {
        in: (col: string, vals: string[]) => Promise<{ error: { message: string } | null }>
      }
    }
  }
  const userIds = users.map((u) => u.id)
  const { data: profiles } = await adminTyped
    .from('profiles')
    .select('id, tenant_id')
    .in('id', userIds)
  const tenantIds = (profiles ?? [])
    .map((p) => p.tenant_id)
    .filter((t): t is string => typeof t === 'string' && t.length > 0)

  // 2. Supprimer les users auth (CASCADE détruit profiles).
  let deleted = 0
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (!error) deleted++
    // Les erreurs sont silencieusement ignorées : cleanup idempotent,
    // un user déjà supprimé entre 2 appels n'est pas une erreur.
  }

  // 3. Supprimer les tenants orphelins (les FK CASCADE depuis tenants
  //    auraient déjà cassé via auth.users mais on s'assure que le tenant
  //    n'est pas laissé en place — il pourrait l'être si auth.users
  //    delete n'a pas cascadé vers tenants).
  if (tenantIds.length > 0) {
    const uniqueTenants = Array.from(new Set(tenantIds))
    await adminTyped.from('tenants').delete().in('id', uniqueTenants)
  }

  return { deleted }
}
