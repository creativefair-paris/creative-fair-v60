# Audit Sprint 40 — Page Rappels

> Verdict global : **À créer** (page top-level absente du repo, seuls quelques composants embryonnaires existent)
> Doctrine de référence : `00-CONCEPT.md` §3 références produit "Apple Reminders pour la sobriété des tâches et la lisibilité absolue" · §5 promesse 3 "Rappels (tâches à faire)" · `01-ARCHITECTURE.md` §1 (Rappels, section Travail, top-level) · §6 cross-pages (une tâche dans Rappels peut être créée par Hélène en conversation Messages, ou créée manuellement, ou générée automatiquement par la Roadmap d'Aujourd'hui).

---

## 1. Périmètre audité

### 1.1 Route cible doctrinale V2.0

- `app/(app)/rappels/page.tsx` (cible top-level) — **n'existe pas dans le repo**.

### 1.2 Implémentation actuelle (très partielle)

- `components/today/TaskRow.tsx` — rangée d'une tâche style Things 3 (utilisée sur Aujourd'hui).
- Plus largement, le concept "tâche / rappel" est dispersé :
  - Posts à publier (table `posts` avec date/heure prévues).
  - Sessions wizard Conseiller en cours (à dégager).
  - Jalons fondations (à dégager, cf. `01-aujourd-hui.md`).
  - Alertes critiques (table `alerts`, distinct).

### 1.3 Pas de table Rappels dédiée

Aucune migration `supabase/migrations/*.sql` ne crée de table `reminders` ou `tasks` distincte. Le concept Rappels V2.0 attendra Sprint 43+.

### 1.4 Composants liés (transverses)

- `components/today/TaskRow.tsx` — réutilisable pour la future page Rappels.
- `components/today/CriticalBanner.tsx` — pour alertes critiques tenant-level (distinct des rappels).

### 1.5 Migrations Supabase liées (distinctes mais utiles)

- `012_alerts.sql` — table `alerts` (signal critique tenant-level, distinct des rappels routine).

### 1.6 Cible doctrinale V2.0

- `app/(app)/rappels/page.tsx`
- `components/rappels/RappelRow.tsx`, `RappelList.tsx`, `NewRappelSheet.tsx`
- `lib/rappels/queries.ts`, `lib/rappels/types.ts`
- `app/_actions/rappels.ts` (CRUD)
- Migration `0XX_reminders.sql` (table avec tenant_id, RLS, lien optionnel vers `posts.id` ou `conversations.id`).

---

## 2. Confrontation à la doctrine

### Inexistence de la route `/rappels` top-level
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 "Rappels · Tâches à faire, format Things 3 · Travail (top-level)". `00-CONCEPT.md` §3 référence produit Apple Reminders.
- **Constat factuel :** Aucun fichier `app/(app)/rappels/page.tsx`. Aucun composant `components/rappels/`. Aucune table `reminders`. Aucune action server.
- **Écart constaté :** Cible V2.0 entièrement à construire.
- **Action proposée Phase 2 :** **Aucune** dans Sprint 40. Création planifiée Sprint 43+.

### `components/today/TaskRow.tsx`
- **Statut doctrinal :** Validé (composant réutilisable)
- **Référence doctrine :** `00-CONCEPT.md` §3 "Apple Reminders pour la sobriété des tâches".
- **Constat factuel :** Composant TaskRow utilisé sur Aujourd'hui (bloc A).
- **Écart constaté :** Pourrait servir directement à la future page Rappels (déplacement ou import partagé Sprint 43+).
- **Action proposée Phase 2 :** Aucune. Conservation pour réutilisation.

### `components/today/CriticalBanner.tsx`
- **Statut doctrinal :** À refactorer (déjà couvert dans `01-aujourd-hui.md`)
- **Référence doctrine :** §11 palette `#FF3B30` urgence.
- **Constat factuel :** Bannière alerts critiques (alimentée par table `alerts`).
- **Action proposée Phase 2 :** Audit copies Sprint 41 (couvert `01-aujourd-hui.md`).

### Migration `012_alerts.sql`
- **Statut doctrinal :** Validé (sous réserve audit RLS dans `10-transverse.md` §5)
- **Référence doctrine :** `04-MULTI_TENANT.md`.
- **Constat factuel :** Table `alerts` tenant-scoped avec policies SELECT/INSERT/UPDATE. RLS active.
- **Écart constaté :** Aucun direct. Les policies INSERT/UPDATE sont restrictives correctes (`with check (tenant_id = public.user_tenant_id())`).
- **Action proposée Phase 2 :** Aucune.

### Aucun fichier `lib/rappels/`, `components/rappels/`, `app/_actions/rappels.ts`
- **Statut doctrinal :** À créer (Sprint 43+)
- **Action proposée Phase 2 :** Aucune.

### Concept "tâches" / "rappels" dispersé
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §6 cross-pages "Une tâche dans Rappels peut être créée par Hélène en conversation Messages, ou créée manuellement, ou générée automatiquement par la Roadmap d'Aujourd'hui."
- **Constat factuel :** Le concept "tâche" actuellement passe par :
  - La table `posts` (publications à faire).
  - Les sessions wizard Conseiller en cours (à dégager).
  - Les jalons fondations (à dégager).
- **Écart constaté :** Pas de modèle dédié `reminders`. La cible V2.0 = table distincte avec liens optionnels vers `posts.id`, `conversations.id`, `users.id` (assigné).
- **Action proposée Phase 2 :** Documenter le besoin dans `10-transverse.md` §5 (à créer Sprint 43+).

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel Rappels]**.

Doctrine couverte :
- `01-ARCHITECTURE.md` §1 Rappels = Travail top-level + "format Things 3".
- `00-CONCEPT.md` §3 référence Apple Reminders (sobriété des tâches, lisibilité absolue).
- `00-CONCEPT.md` §5 promesse 3.
- `01-ARCHITECTURE.md` §6 cross-pages (lien Messages, Aujourd'hui, manuel).

Le HTML Rappels Claude Design (non dans le repo) incarne probablement la grammaire Things 3 (check circle gauche, titre + sous-titre, gestures swipe-to-complete).

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 3 |
| À refactorer | 0 (sur le périmètre Rappels strict) |
| Recalés | 0 |
| À créer (hors scope Sprint 40) | ~8 fichiers cibles |
| Total fichiers Rappels audités | 3 (présents) + 8 (à créer) |

Validés (utilisables pour la future page) :
1. `components/today/TaskRow.tsx`
2. `lib/calendar/dates.ts` (helpers de date applicables aux rappels)
3. `supabase/migrations/012_alerts.sql` (table `alerts` distincte mais bien faite)

---

## 5. Recommandation pour Phase 2

### 5.1 Aucune action Sprint 40

La page Rappels n'existe pas. Il n'y a **rien à purger** ici.

### 5.2 Hors scope Sprint 40 — Sprint 43+

Création complète :

- Route `app/(app)/rappels/page.tsx`.
- Composants `components/rappels/RappelRow.tsx`, `RappelList.tsx`, `NewRappelSheet.tsx`, `RappelDetailSheet.tsx`, `RappelFilters.tsx`.
- Lib `lib/rappels/queries.ts`, `lib/rappels/types.ts`.
- Server actions `app/_actions/rappels.ts` (createRappel, updateRappel, completeRappel, deleteRappel).
- Migration SQL :
  ```sql
  create table reminders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    title text not null,
    notes text,
    due_at timestamptz,
    completed_at timestamptz,
    source_post_id uuid references posts(id) on delete set null,
    source_conversation_id uuid references conversations(id) on delete set null,
    assigned_to uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  ```
  Avec RLS active + 4 policies (SELECT/INSERT/UPDATE/DELETE) sur `tenant_id = public.user_tenant_id()`.

- Liaisons cross-pages (cf. §6 doctrine) :
  - Créé par Hélène depuis Messages → `source_conversation_id`.
  - Créé manuellement → champs simples.
  - Généré automatiquement par la Roadmap d'Aujourd'hui → `source_post_id` ou `source_brand_event_id`.

Ce périmètre est explicitement laissé à un sprint dédié.

---

## 6. Cible doctrinale V2.0 — spec détaillée pour Sprint 43+

### 6.1 Référence Apple Reminders

`00-CONCEPT.md` §3 "Apple Reminders pour la sobriété des tâches et la lisibilité absolue."

Les références produit Reminders incarnent la **grammaire** de Rappels Creative Fair :

- **Check circle gauche** : 18px, stroke 1.5, cocher coche l'item, animation 200ms.
- **Titre + sous-titre** : titre 15-16px medium, sous-titre 13-14px regular (date d'échéance, contexte source).
- **Swipe actions** (mobile) : swipe gauche = marquer fait, swipe droite = supprimer.
- **Sections** : "Aujourd'hui · Demain · Cette semaine · Plus tard · Sans date".
- **Inbox / Listes** : pas de listes utilisateur en V1 (pas de surfeature). Une seule inbox.
- **Création** : input simple en haut, comme Reminders ("Ajouter un rappel… ⏎").
- **Couleurs** : rouge `#FF3B30` uniquement pour les échéances **dépassées**. Sinon noir Apple `#1C1C1E`.

### 6.2 Structure de fichiers cible

```
app/(app)/rappels/
├── layout.tsx
├── page.tsx                            ← Server Component, charge la liste
├── loading.tsx
└── error.tsx

components/rappels/
├── RappelsView.tsx                     ← orchestrateur
├── RappelsList.tsx                     ← liste sectionnée (Aujourd'hui / Demain / ...)
├── RappelRow.tsx                       ← une ligne Things 3 style
├── RappelSection.tsx                   ← header de section ("Aujourd'hui")
├── NewRappelInput.tsx                  ← input en haut, créer en tapant entrée
├── RappelDetailSheet.tsx               ← détail au clic (notes, source, échéance)
├── RappelEmptyState.tsx                ← "Aucun rappel. Hélène te préviendra quand quelque chose mérite ton attention."
└── RappelOverdueBadge.tsx              ← badge rouge si échéance dépassée

lib/rappels/
├── queries.ts                          ← loadRappels(supabase, view)
├── types.ts                            ← RappelRow, RappelView, RappelSection
└── grouping.ts                         ← group by date (today, tomorrow, this-week, later)

app/_actions/rappels/
├── create-rappel.ts                    ← createRappel(title, due_at?, source?)
├── complete-rappel.ts                  ← markCompleted(id)
├── update-rappel.ts                    ← updateRappel(id, patch)
└── delete-rappel.ts                    ← deleteRappel(id)
```

### 6.3 Migration SQL prévue

```sql
-- Migration 0XX_reminders.sql (Sprint 43+)

create table reminders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  due_at timestamptz,
  completed_at timestamptz,
  source_post_id uuid references posts(id) on delete set null,
  source_conversation_id uuid references conversations(id) on delete set null,
  source_event_id uuid,                  -- ancre business calendar (jsonb)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reminders_tenant_user_active
  on reminders(tenant_id, user_id, due_at)
  where completed_at is null;

alter table reminders enable row level security;

create policy "reminders select" on reminders for select
  using (tenant_id = public.user_tenant_id());

create policy "reminders insert" on reminders for insert
  with check (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "reminders update" on reminders for update
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "reminders delete" on reminders for delete
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid());
```

Note : `user_id = auth.uid()` en plus de `tenant_id` car les rappels sont personnels (une équipe multi-user partage le tenant mais pas forcément ses rappels).

### 6.4 Cross-pages — interconnexions

`01-ARCHITECTURE.md` §6 :

| Source | Action | Destination Rappel |
|---|---|---|
| Messages (Hélène) | "Ajoute ça à mes rappels" | Nouveau rappel avec `source_conversation_id` |
| Aujourd'hui Roadmap | Hélène insère une étape orchestrée | Nouveau rappel auto avec `source_post_id` ou `source_event_id` |
| Calendrier (post programmé en retard) | "Préparer ce post" | Rappel avec `source_post_id` |
| Mon Programme | "Penser à ce pilier" | Rappel manuel |
| Création manuelle | Input en haut Rappels | Rappel sans source |

### 6.5 Vue par défaut

Sections affichées dans l'ordre :
1. **En retard** (rouge, si échéance dépassée).
2. **Aujourd'hui**.
3. **Demain**.
4. **Cette semaine** (J+2 à J+7).
5. **Plus tard** (J+8 et au-delà).
6. **Sans date**.

Les rappels complétés (`completed_at not null`) sont masqués par défaut. Un toggle "Afficher complétés" en bas révèle l'historique des 30 derniers jours.

### 6.6 Pourquoi Apple Reminders et pas Things 3 strict

`01-ARCHITECTURE.md` §1 mentionne "format Things 3". Cependant, `00-CONCEPT.md` §3 cite explicitement Apple Reminders. Les deux sont compatibles dans l'esprit :
- **Things 3 apport** : la grammaire visuelle (check circle gauche, sections nommées).
- **Apple Reminders apport** : la sobriété native iOS 26 (typo SF, glass cells, animations système).

La cible V2.0 = un hybride **Things-grammar + Reminders-aesthetic** dans le langage Liquid Glass de Creative Fair.
