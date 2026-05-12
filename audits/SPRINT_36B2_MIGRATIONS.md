# Sprint 36.B.2 — Migrations DB

## Action Lead 30s requise

La migration 008 ajoute 3 colonnes JSONB à la table `brands` pour les nouveaux
blocs Ma Marque. Supabase managé n'expose pas de RPC `exec_sql` accessible
au service role : il faut **coller-runer dans le SQL Editor**.

### Étape 1 — Ouvrir Supabase Studio

https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new

### Étape 2 — Coller le SQL

Contenu de `supabase/migrations/008_brands_enrichissement.sql` :

```sql
-- Sprint 36.B.2 — Enrichissement Ma Marque : calendrier business, objectifs, ressources.
-- Trois nouvelles colonnes JSONB sur la table brands.
-- Les piliers narratifs existent déjà (Sprint 36.A migration 007).

alter table brands
  add column if not exists calendrier_business jsonb default '[]'::jsonb,
  add column if not exists objectifs jsonb default '[]'::jsonb,
  add column if not exists ressources jsonb default '{}'::jsonb;

comment on column brands.calendrier_business is
  'Array de moments business : [{id, titre, date_debut, date_fin?, type}]';
comment on column brands.objectifs is
  'Array d''objectifs de saison ordonnés par priorité : [{id, label, priorite}]';
comment on column brands.ressources is
  'Capacités de production hebdomadaires : {photo, video, terrain, studio}';
```

Cliquer **Run**.

### Étape 3 — Vérification post-application

Dans le même éditeur, exécuter :

```sql
select column_name, data_type, column_default
  from information_schema.columns
  where table_name = 'brands'
    and column_name in ('calendrier_business', 'objectifs', 'ressources');
```

**Résultat attendu : 3 lignes** avec `data_type = jsonb`.

| column_name | data_type | column_default |
|---|---|---|
| calendrier_business | jsonb | `'[]'::jsonb` |
| objectifs | jsonb | `'[]'::jsonb` |
| ressources | jsonb | `'{}'::jsonb` |

### Étape 4 — Smoke test côté script (optionnel)

```bash
cd /Users/ulysselemoine/Desktop/creative-fair-v60
set -a && source .env.local && set +a
npx tsx scripts/apply-migration-008.ts
```

Doit afficher : `Colonnes déjà présentes — migration 008 déjà appliquée.`

---

## Détail des 3 colonnes

### `calendrier_business` (jsonb, default `'[]'`)

Array de moments business clés de l'année. Structure d'un item :

```ts
type MomentBusiness = {
  id: string                    // uuid local
  titre: string                 // max 120 chars
  date_debut: string            // ISO YYYY-MM-DD
  date_fin?: string             // optionnel, ISO YYYY-MM-DD
  type: 'lancement' | 'evenement' | 'operation' | 'saison'
}
```

Garde-fou serveur : array max 60 items.

### `objectifs` (jsonb, default `'[]'`)

Array d'objectifs de saison, ordonné par priorité (l'ordre dans la liste
reflète la priorité réelle, le champ `priorite` est un signal supplémentaire) :

```ts
type Objectif = {
  id: string
  label: string                 // max 160 chars
  priorite: 1 | 2 | 3           // 1 = prioritaire
}
```

Garde-fou serveur : array max 12 items.

### `ressources` (jsonb, default `'{}'`)

Capacités de production hebdomadaires :

```ts
type Ressources = {
  photo: 'aucune' | 'occasionnelle' | 'reguliere' | 'soutenue'
  video: 'aucune' | 'occasionnelle' | 'reguliere' | 'soutenue'
  terrain: boolean
  studio: boolean
}
```

L'objet vide `{}` est traité comme "non renseigné" côté UI (via
helper `ressourcesEstVide` dans `types/ma-marque.ts`).

---

## Endpoints touchés

| Endpoint | Méthode | Effet |
|---|---|---|
| `/api/brand/update` | PATCH | Accepte `calendrier_business`, `objectifs`, `ressources` (validation stricte par bloc) |
| `/api/ma-marque/propositions` | POST | Renvoie 3 propositions IA sur-mesure pour un bloc donné (Claude Opus, cascade 4-5 → 4-1, timeout 15s) |

---

## Doctrine swap silencieux (Q2)

L'endpoint `/api/ma-marque/propositions` ne renvoie **jamais d'erreur 5xx**
dans le flux nominal. En cas de timeout, échec API, ou réponse invalide,
il renvoie un `200 { propositions: [], error: 'timeout' | 'api_failed' | 'invalid_response' }`
pour que le frontend garde ses propositions génériques par défaut sans
dégrader l'UX. Pas de toast d'erreur, pas de retry visible utilisateur.

Logs serveur uniquement (`console.warn`) pour le suivi des taux d'échec.
