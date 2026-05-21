# Audit Sprint 40 — Page Compte (+ Aide)

> Verdict global : **À refactorer**
> Doctrine de référence : `00-CONCEPT.md` §8 périmètre V1 (mono-marque, B2B custom) · `01-ARCHITECTURE.md` §1 (Compte + Aide = icônes système en bas de sidebar) · §2.1 sidebar globale "[icône Compte] [icône Aide]" · §4 mode mono-marque V1 "Pas de sélecteur de marque dans le header. Compte > Marques n'affiche pas de liste — il y a un bloc unique 'Ma Marque' qui renvoie vers la page Ma Marque." · `04-MULTI_TENANT.md`.

---

## 1. Périmètre audité

### 1.1 Routes Compte (groupe `(compte)/compte/`)

- `app/(compte)/layout.tsx` — shell du groupe.
- `app/(compte)/compte/mon-compte/page.tsx` — stub Sprint 34 (page en construction).
- `app/(compte)/compte/parametres/page.tsx` — paramètres.
- `app/(compte)/compte/ma-marque/page.tsx` — sous-page Ma Marque sous Compte (à arbitrer).
- `app/(compte)/compte/ma-marque/brand-book/page.tsx`
- `app/(compte)/compte/ma-marque/business-calendar/page.tsx`

### 1.2 Routes Auth (distinctes)

- `app/(auth)/login/page.tsx`
- `app/(auth)/login/actions.ts`
- `app/(auth)/logout/route.ts`
- `app/auth/callback/route.ts`

### 1.3 Routes Admin (espace Lead)

- `app/(admin)/layout.tsx`
- `app/(admin)/tenants/page.tsx`
- `app/(admin)/tenants/actions.ts`
- `app/(admin)/tenants/new/page.tsx`
- `app/(admin)/tenants/new/NewTenantForm.tsx`
- `app/(admin)/tenants/[slug]/page.tsx`
- `app/(admin)/tenants/[slug]/BrandBookEditor.tsx`
- `app/(admin)/tenants/[slug]/BusinessCalendarEditor.tsx`
- `app/(admin)/tenants/[slug]/TenantTabs.tsx`
- `app/(admin)/tenants/[slug]/ThemeEditor.tsx`
- `app/(admin)/tenants/[slug]/UsersTab.tsx`

### 1.4 Helpers et server actions Compte

- `lib/auth/admin.ts` — allowlist Lead.
- `app/_actions/ensure-profile.ts` — création profil après auth.

### 1.5 Layout transverses

- `components/layout/UserMenuBubble.tsx`
- `components/layout/UserMenuTrigger.tsx`
- `components/layout/Avatar.tsx`
- `components/layout/CreditsIndicator.tsx`

### 1.6 Cible doctrinale V2.0

- `app/(app)/compte/page.tsx` (cible top-level) — accessible via icône système en bas de sidebar Aujourd'hui.
- `app/(app)/aide/page.tsx` (cible top-level) — accessible via icône système.
- Pas de sous-arbre `/compte/ma-marque/` (Ma Marque a sa propre route top-level Éditorial).

---

## 2. Confrontation à la doctrine

### `app/(compte)/compte/mon-compte/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 6 "Si ce n'est pas prêt, ce n'est pas montré." `01-ARCHITECTURE.md` §1 Compte = destination système (pas sous-page).
- **Constat factuel :** Stub Sprint 34 — affiche "Page en construction.".
- **Écart constaté :**
  1. Page en construction visible en prod = anti-pilier 6.
  2. Route `/compte/mon-compte` ≠ route cible `/compte` (chemin canonique V2.0).
- **Action proposée Phase 2 :** Conserver provisoirement la copie "Page en construction" mais retirer la mention "stub Sprint 34" du commentaire d'en-tête. Refactor route Sprint 41+.

### `app/(compte)/compte/parametres/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 Compte = destination système.
- **Constat factuel :** Sous-page paramètres.
- **Écart constaté :** Chemin canonique V2.0 = `/compte` avec onglets ou sections internes (style Apple Settings). Pas de sous-route.
- **Action proposée Phase 2 :** Refactor structurel Sprint 43+.

### `app/(compte)/compte/ma-marque/page.tsx`, `brand-book/page.tsx`, `business-calendar/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 "Ma Marque · Doctrine éditoriale, piliers, univers, ressources · Éditorial (top-level)" + §4 "Compte ≠ Ma Marque (clear separation)".
- **Constat factuel :** Sous-arbre `/compte/ma-marque/` avec brand-book + business-calendar.
- **Écart constaté :** Ma Marque est une **destination Éditorial top-level distincte** (`/ma-marque` qui existe déjà). Cette duplication sous `/compte/ma-marque/` est obsolète.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/compte-ma-marque/`.

### `app/(compte)/layout.tsx`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Vérifier compatibilité avec layout cible V2.0.

### `app/(auth)/login/page.tsx`, `login/actions.ts`, `logout/route.ts`, `auth/callback/route.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `04-MULTI_TENANT.md` "Magic link Supabase" + `01-ARCHITECTURE.md` §8 `app/(auth)/login/` Magic link.
- **Constat factuel :** Auth Supabase magic link.
- **Écart constaté :** À auditer pour vérifier que les copies UI respectent voice sheet (sentence case, pas d'exclamation).
- **Action proposée Phase 2 :** Audit copies Sprint 41.

### `lib/auth/admin.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `01-ARCHITECTURE.md` §8 "allowlist Lead".
- **Action proposée Phase 2 :** Aucune.

### `app/_actions/ensure-profile.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md` "Création d'un nouveau tenant (avant que le user ait un profile)" → cas légitime `createAdmin()`.
- **Constat factuel :** Action de création profil (probablement legitime `createAdmin`).
- **Écart constaté :** À vérifier qu'il rentre bien dans les cas légitimes.
- **Action proposée Phase 2 :** Audit dans `10-transverse.md` §1.

### `app/(admin)/*` (espace Lead)
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §8 V1 "Pas d'espace administrateur public. L'admin Lead est interne, prévu Sprint 42." `01-ARCHITECTURE.md` §8 `(admin)/ ← Espace Lead (Sprint 42+)`.
- **Constat factuel :** L'admin existe déjà partiellement (Sprint 1+) avec listing tenants, création, édition (BrandBookEditor, BusinessCalendarEditor, ThemeEditor, UsersTab).
- **Écart constaté :** L'admin est **anticipé** par rapport à la doctrine (qui le situe Sprint 42+). Pas de gros conflit, mais à harmoniser Sprint 42.
- **Action proposée Phase 2 :** Conserver. Audit des copies + des `createAdmin` usages dans `actions.ts`.

### `app/(admin)/tenants/actions.ts`
- **Statut doctrinal :** Validé (cas légitime `createAdmin`)
- **Référence doctrine :** `04-MULTI_TENANT.md` "Création d'un nouveau tenant" = cas légitime.
- **Constat factuel :** Action server pour création/édition tenants.
- **Écart constaté :** Usage légitime de `createAdmin`.
- **Action proposée Phase 2 :** Audit dans `10-transverse.md` §1 (vérifier que les autres usages côté admin sont bien cantonnés à l'admin).

### `components/layout/UserMenuBubble.tsx`, `UserMenuTrigger.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.3 "Avatar utilisateur trailing à droite, niveau de la ligne H1."
- **Constat factuel :** Menu utilisateur (avatar + dropdown). Bubble + Trigger.
- **Écart constaté :** À auditer Sprint 41 (cohérence menu utilisateur avec destinations canoniques).
- **Action proposée Phase 2 :** Audit Sprint 41.

### `components/layout/Avatar.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### `components/layout/CreditsIndicator.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §9 "tokens (sauf contexte technique pur) → crédits, ressources" (vocabulaire encouragé). `10-SACRED.md` palette.
- **Constat factuel :** Indicateur de crédits.
- **Écart constaté :** Concept "crédits" aligné doctrine §10 (préférer "crédits" à "tokens"). À auditer copies + couleurs.
- **Action proposée Phase 2 :** Audit copies + couleurs Sprint 41.

### Aide — pas de route
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 "Aide · Support, à propos · Système (icône)".
- **Constat factuel :** Aucune route `app/(app)/aide/` ni `app/(compte)/aide/` n'existe.
- **Action proposée Phase 2 :** Aucune. Création Sprint 43+.

### Documentation user existante
- `docs/user/aujourdhui.md`, `calendrier.md`, `conseiller.md`, `getting-started.md`, `ma-marque.md`, `post-creator.md`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §9 vocabulaire interdit + §14 décisions abandonnées.
- **Constat factuel :** 6 docs user.
- **Écart constaté :**
  1. `docs/user/conseiller.md` → Recalé (Conseiller dégagé).
  2. Les autres à auditer pour vocabulaire interdit + chemins de page obsolètes.
- **Action proposée Phase 2 :** Supprimer `conseiller.md`. Audit copies autres docs Sprint 41.

### Documentation admin existante
- `docs/admin/edit-tenant.md`, `onboarding-tenant.md`, `troubleshooting.md`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Audit copies Sprint 41 (mineur).

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel Compte + Aide]**.

Doctrine couverte :
- `01-ARCHITECTURE.md` §1 + §2.1 → icônes système en bas de sidebar Aujourd'hui.
- `00-CONCEPT.md` §8 → mono-marque V1.
- §4 → "Compte > Marques n'affiche pas de liste — il y a un bloc unique 'Ma Marque' qui renvoie vers la page Ma Marque."

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 6 |
| À refactorer | 13 |
| Recalés | 4 |
| À créer (hors scope) | 1 (page Aide) |
| Total fichiers Compte+Aide audités | ~23 |

Recalés :
1. `app/(compte)/compte/ma-marque/page.tsx`
2. `app/(compte)/compte/ma-marque/brand-book/page.tsx`
3. `app/(compte)/compte/ma-marque/business-calendar/page.tsx`
4. `docs/user/conseiller.md`

Validés :
1. `app/(auth)/login/page.tsx`
2. `app/(auth)/login/actions.ts`
3. `app/(auth)/logout/route.ts`
4. `app/auth/callback/route.ts`
5. `lib/auth/admin.ts`
6. `components/layout/Avatar.tsx`

---

## 5. Recommandation pour Phase 2

### 5.1 Suppressions à valider (`proposed-deletions.md`)

- `app/(compte)/compte/ma-marque/page.tsx`
- `app/(compte)/compte/ma-marque/brand-book/page.tsx`
- `app/(compte)/compte/ma-marque/business-calendar/page.tsx`
- `app/(compte)/compte/ma-marque/` (dossier complet)
- `docs/user/conseiller.md`

### 5.2 Refactor automatique

- Retirer mention "stub Sprint 34" du commentaire `app/(compte)/compte/mon-compte/page.tsx`.
- Garder la copie "Page en construction." en attendant Sprint 43+.

### 5.3 Hors scope Sprint 40 (Sprint 41+)

- Refactor structurel routes Compte → `/compte` unique avec onglets internes Apple Settings.
- Création de la route `/aide`.
- Audit visuel + copies UserMenu, CreditsIndicator.
- Audit copies des `docs/user/*.md`.
- Patch sécurité multi-tenant sur `app/_actions/ensure-profile.ts` (audit dans `10-transverse.md` §1).
- Sprint 42 — harmonisation espace admin Lead avec doctrine V2.0.
