# Sprint 22 — Interface admin /admin/tenants

Branch : `main` (creative-fair-v60). Modèle : `claude-sonnet-4-6` (interface
admin sans génération IA).

## Périmètre

Interface admin réservée à `creativefair@1922.studio`, accessible via
`/admin/tenants`, permettant de provisionner et configurer chaque client.

## Architecture

- `app/(admin)/layout.tsx` — server component, double protection :
  redirect `/login` si non authentifié, redirect `/aujourdhui` si email
  hors allowlist. Header sombre + lien déconnexion.
- `app/(admin)/tenants/page.tsx` — liste des tenants (slug, nom, plan,
  users count, brand book status, créé le, lien Configurer).
- `app/(admin)/tenants/new/page.tsx` — formulaire création.
- `app/(admin)/tenants/[slug]/page.tsx` — page configuration 4 onglets.
- `app/(admin)/tenants/actions.ts` — server actions (`createTenant`,
  `updateTenantTheme`, `updateTenantBrandBook`,
  `updateTenantBusinessCalendar`, `inviteUser`).

## Sécurité

Triple barrière :
1. **proxy.ts** — vérifie email contre allowlist sur toute route
   `/admin/*`, redirect `/aujourdhui` sinon.
2. **layout admin** — re-check `isAdmin(user.email)` côté server
   component, redirect si faux.
3. **server actions** — `requireAdmin()` lance `Forbidden` avant tout
   accès DB. Empêche un appel direct depuis le client si jamais le
   cookie de session était volé.

L'allowlist est centralisée dans `lib/auth/admin.ts`. Le proxy réplique
la liste inline car le runtime edge n'accepte pas `'server-only'`.

## Provisioning d'un tenant

`createTenant({ name, slug, plan, ownerEmail })` :
1. Insère ligne dans `tenants` avec theme par défaut (palette forêt) et
   `enabled_channels: ['instagram']`.
2. Insère ligne dans `brands` (status `incomplete` par défaut).
3. `auth.admin.inviteUserByEmail(ownerEmail)` envoie magic link.
4. Insère profil avec `role='owner'` lié au tenant.

Toutes ces écritures passent par `createAdmin()` (service_role) car le
user n'a pas encore de profil → RLS bloquerait.

## Onglets de configuration

1. **Thème** — pickers couleur (7 champs) + 2 fonts + aperçu live.
   Persiste dans `tenants.theme` (jsonb).
2. **Brand book** — édition JSON brute (BrandBook complet). Marque
   `brand_book_status='complete'` au save.
3. **Calendrier business** — édition JSON brute (4 tableaux requis).
4. **Utilisateurs** — liste + formulaire d'invitation par email/rôle.

L'édition JSON est volontaire : la grille admin est interne, peuplée par
les seeds de Sprints 23-25, et l'édition fine se fait surtout côté
client via `/ma-marque`.

## Limites et points de vérification

- **Build/lint non exécutés** (npm indisponible dans la sandbox).
  Action requise : `npm run lint && npm run build` avant déploiement.
- **Auth.admin.inviteUserByEmail** : renvoie 422 si email déjà existant
  dans `auth.users`. Cas non géré explicitement — l'erreur Supabase
  remonte à l'utilisateur tel quelle.
- **Suppression tenant** : non implémentée volontairement (DELETE
  cascade nécessite migration RLS sécurisée).
- **Logs admin** : aucun log d'audit applicatif. Trace uniquement via
  Supabase logs (auth + db).

## Plan de vérification recommandé

1. Connexion `creativefair@1922.studio` → redirige vers `/aujourdhui`,
   accès direct à `/admin/tenants` ouvre l'interface.
2. Connexion autre email → redirect `/aujourdhui` même sur URL admin.
3. Créer un tenant test (slug `test-fr`, plan `b2c`, email perso) :
   vérifier ligne tenants + brand + profile (role owner) + email reçu.
4. Configurer thème : enregistrer, recharger, valeurs persistées.
5. Inviter un second user : email reçu, profil créé avec rôle choisi.
