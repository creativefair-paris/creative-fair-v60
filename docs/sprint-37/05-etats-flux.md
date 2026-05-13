# États du flux conversationnel

## Diagramme textuel

```
                     ┌──────────────┐
                     │  démarrage   │  (user clique CTA dans /aujourd-hui)
                     └──────┬───────┘
                            │
                            │ création session DB
                            ▼
                     ┌──────────────┐
                     │  exploration │  Creative Fair lit contexte +
                     │  (tour 1)    │  business_calendar, propose lecture
                     └──────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
   choix user : valider          choix user : ajuster cap
                │                       │
                ▼                       ▼
         ┌──────────┐            ┌──────────┐
         │ ancrage  │   ◄───────►│   cap    │
         │ (tour 2-3)             │ (tour 2) │
         └────┬─────┘            └────┬─────┘
              │                       │
              │ ancres validées       │
              ▼                       │
         ┌──────────┐                 │
         │proposition◄────────────────┘
         │ (tour 4)  │
         └────┬─────┘
              │
   ┌──────────┼──────────┐
   │          │          │
 régénérer  itérer    valider
   │          │          │
   ▼          ▼          ▼
 (retour    (édit     ┌──────────────┐
proposition) post)    │  génération  │
                      │  finale      │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ restitution  │  Programme rendu, drafts en DB
                      └──────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       tout valider     éditer 1 post    rejeter 1 post
              │              │              │
              ▼              ▼              ▼
         ┌────────┐    /post-creator    génère remplacement
         │ fin OK │      ouvre              ↓
         │drafts→ │                   retour restitution
         │posts   │
         └────────┘
```

## États détaillés

| État | Description | Persistance |
|---|---|---|
| `demarrage` | Session créée, contexte chargé, premier appel Claude en cours | row session inserted, `etat = 'demarrage'` |
| `exploration` | Tour 1 : Creative Fair a parlé, attend choix user | `etat = 'exploration'`, `dernier_message = '...'` |
| `cap` | Tour 2 facultatif : ajustement du cap narratif | `etat = 'cap'` |
| `ancrage` | Tour 2-3 : ancres business validées/ajoutées | `etat = 'ancrage'`, `ancres_validees = [...]` |
| `proposition` | Tour 4 : programme proposé, en attente d'action user | `etat = 'proposition'`, `programme_propose = {...}` |
| `generation_finale` | Background : drafts insertés en DB après validation | transient, dure 2-5 secondes |
| `restitution` | Vue récap des drafts générés, user édite/rejette/valide | `etat = 'restitution'` |
| `termine` | Tous les drafts validés → table posts | `etat = 'termine'`, session archived |
| `abandonne` | User a quitté sans terminer | `etat = 'abandonne'`, timestamp last_seen |

## Transitions

### `demarrage` → `exploration`

Déclencheur : retour de l'appel Claude tour 1 réussi.
Action : sauve `dernier_message` (sortie JSON parsée), render UI avec
choix.

### `exploration` → `cap` OU `ancrage`

Déclencheur : clic user sur un choix du tour 1.
Si choix = *« Ajuster le cap »* → `cap`.
Sinon → `ancrage`.

### `cap` → `ancrage`

Déclencheur : user a validé un cap alternatif.
Action : Claude refait un tour avec nouveau cap, transition vers
ancrage.

### `ancrage` → `proposition`

Déclencheur : user clique *« Voir le programme »* OU max 2 tours
d'ancrage atteints.
Action : Claude génère le programme complet (tour 4, output JSON
long avec `programme.semaines[]`).

### `proposition` → `restitution`

Déclencheur : user clique *« Tout valider »* OU *« Voir la proposition
complète »* (la proposition initiale est déjà semi-visible, restitution
est l'écran officiel).
Action : insert N rows dans `drafts` (table à créer), liées à la
session par `drafts.programme_session_id`.

### `restitution` → `termine`

Déclencheur : user clique *« Tout valider »* sur la vue restitution.
Action : pour chaque draft, INSERT dans `posts` (statut=`planifie`),
UPDATE `drafts.status='consumed'`, UPDATE session `etat='termine'`.

### N'importe quel état → `abandonne`

Déclencheur : `updated_at` de la session > now() - 7 jours sans action
user.
Action : nettoyage par cron (à mettre en place Sprint 38 ou plus tard).
La session reste lisible, le user peut la reprendre depuis
`/aujourd-hui` (cf. doc 02 — reprise propre).

## Persistance — schéma DB proposé

**Table proposée : `programme_generation_sessions`**

Justification du naming :
- `conversations_programme` était plausible mais évoque trop le chat
  `/conseiller` (qui aura sa propre table `conversations` un jour).
- `programme_generation_sessions` est explicite : c'est une session de
  génération d'un programme. Distinct d'une conversation générale.
- Évite la collision avec un éventuel `programme_sessions` (cf. table
  `programmes` existante qui désigne les programmes effectivement
  programmés).

Schéma SQL proposé (texte, **pas une migration .sql**, à exécuter
au Sprint 37) :

```sql
create table programme_generation_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- État machine
  etat text not null default 'demarrage'
    check (etat in (
      'demarrage', 'exploration', 'cap', 'ancrage',
      'proposition', 'generation_finale', 'restitution',
      'termine', 'abandonne'
    )),
  tour_count int not null default 0,

  -- Mémoire conversationnelle
  ancres_validees uuid[] default array[]::uuid[],  -- ids de calendrier_business
  ancres_ajoutees_dans_flux uuid[] default array[]::uuid[],
  programme_propose jsonb,  -- JSON du programme proposé par Claude
  derniers_messages jsonb default '[]'::jsonb,  -- historique compact

  -- Métadonnées
  modele_utilise text,  -- 'claude-opus-4-5' etc.
  total_tokens_in int default 0,
  total_tokens_out int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  terminated_at timestamptz
);

create index idx_pgs_user_active
  on programme_generation_sessions(user_id, updated_at desc)
  where etat not in ('termine', 'abandonne');
```

**Table `drafts` proposée** (référencée par le flux + section
*Brouillons* de `/aujourd-hui` qui est stub V1) :

```sql
create table drafts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  programme_session_id uuid references programme_generation_sessions(id)
    on delete cascade,

  -- Contenu du post proposé
  date_prevue timestamptz not null,
  heure_prevue time,
  type_contenu text not null
    check (type_contenu in ('photo', 'carrousel', 'reel', 'video')),
  titre_court text,
  teaser text,
  pilier_nom text,
  ancre_business_id uuid,  -- nullable, ref à calendrier_business[].id

  -- État du draft
  status text not null default 'propose'
    check (status in ('propose', 'modifie', 'rejete', 'consumed')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_drafts_brand_status
  on drafts(brand_id, status);
create index idx_drafts_session
  on drafts(programme_session_id);
```

## Reprise d'une session interrompue

Algorithme côté serveur, au chargement de `/aujourd-hui` :

```sql
select id, etat, updated_at
from programme_generation_sessions
where user_id = $user_id
  and etat not in ('termine', 'abandonne')
order by updated_at desc
limit 1;
```

Si row trouvé ET `updated_at > now() - 7 days` → afficher dans
`/aujourd-hui` une ligne discrète *« Tu as commencé à poser ton
programme. Tu peux reprendre. »* avec lien vers
`/programme/generation/{id}` (route à créer Sprint 37).

Si plusieurs sessions actives existent (bug ou cas edge) : garder la
plus récente, archiver les autres en `abandonne`.

## Idempotence + concurrence

- Une seule session active par user à la fois. La création d'une
  nouvelle session échoue si une session active existe (le user doit
  d'abord terminer ou abandonner l'ancienne).
- À ARBITRER LEAD : doit-on autoriser plusieurs sessions actives en
  parallèle (1 par horizon temporel, par exemple) ? Probablement non
  en V1, à reconsidérer V2 si demande.

## Points à valider par le Lead

- Naming `programme_generation_sessions` vs `conversations_programme`.
- Schéma DB proposé : faut-il un `programme_id` au lieu d'un
  `programme_session_id` côté drafts ? Lien direct vs lien indirect.
- TTL avant `abandonne` : 7 jours proposé, à arbitrer.
- Une session active max : OK pour V1 ?
- Le statut `modifie` côté drafts est-il utile, ou bien on garde juste
  `propose` / `rejete` / `consumed` ?
