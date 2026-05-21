# Sprint 43-stable — Implémentation Next.js des 7 pages stables

> Brief Lead pour Claude Code · session autonome unique.
> Mission : reconstruire en Next.js 16 (App Router) les 7 pages doctrinalement stables de Creative Fair V2.0, depuis les maquettes HTML produites avec Claude Design.
> Branche : `sprint-43-stable`, depuis `sprint-40-audit-purge` HEAD `da57c92`.
> Émis le 21 mai 2026 par le Lead.

---

## 1. Contexte non-négociable

Le repo est dans un état post-Sprint 40 propre :
- Doctrine V2.0 figée dans `skills/*.md` (commit `46e3ebe` sur `sprint-39-doctrine`).
- Audit Phase 1 livré (`audits/sprint-40/01` à `10`).
- Phase 2B exécutée (commit final `3dd2b00`) : 92 fichiers supprimés, 100 backups dans `archive/v1-leftovers/`, branche `cf-conceptuel-0` taggée et supprimée, build OK.
- HTML Claude Design commités dans `docs/design-mockups/` (commit `da57c92`).

**Les 7 fichiers `skills/*.md` sont la source de vérité unique.** Toute décision contredisant ces fichiers est refusée par Claude Code, **sauf** dans les zones explicitement marquées "beta interne" ci-dessous (§7.2).

**Les 10 HTML Claude Design dans `docs/design-mockups/` sont la spec visuelle.** Claude Code lit chaque HTML page par page avant d'implémenter la page Next.js correspondante. Pas d'extrapolation : si un détail visuel n'est pas dans le HTML, Claude Code documente le manque dans `decisions.md` et continue.

---

## 2. Périmètre — 7 pages IN, 3 pages OUT

### 2.1 Pages dans le périmètre (7 stables)

Ces 7 pages sont doctrinalement claires et leurs HTML Claude Design sont complets :

| # | Page | Route Next.js | HTML référence |
|---|---|---|---|
| 1 | Aujourd'hui | `app/(app)/aujourd-hui/page.tsx` | `docs/design-mockups/01-aujourd-hui-v3.html` |
| 2 | Mon Programme | `app/(app)/mon-programme/page.tsx` | `docs/design-mockups/02-mon-programme.html` |
| 3 | Bibliothèque | `app/(app)/bibliotheque/page.tsx` | `docs/design-mockups/03-bibliotheque-v2.html` |
| 4 | Messages | `app/(app)/messages/page.tsx` | `docs/design-mockups/03-messages.html` + `03bis-contacts.html` (carnet fusionné) |
| 5 | Calendrier | `app/(app)/calendrier/page.tsx` | `docs/design-mockups/07-calendrier.html` |
| 6 | Rappels | `app/(app)/rappels/page.tsx` | `docs/design-mockups/08-rappels.html` |
| 7 | Compte | `app/(app)/compte/page.tsx` | `docs/design-mockups/06-compte.html` |

### 2.2 Pages hors périmètre (3 grises)

Ces 3 pages sont en zones grises et ne sont **PAS** implémentées dans Sprint 43-stable :

| Page | HTML existe ? | Raison du report |
|---|---|---|
| **Ma Marque** | `docs/design-mockups/05-ma-marque.html` existe MAIS onboarding première marque non défini | Attend Sprint cadrage |
| **Mes Outils** | `docs/design-mockups/02-mes-outils-v2.html` existe MAIS sous-flux Moodboard/Variations/Reviews/Diffuser non définis | Coquille vide à créer en Sprint 43-stable (voir §7.2), Sprint Post Creator complétera |
| **Aide** | Pas de HTML | Attend Sprint cadrage |

### 2.3 Hors scope Sprint 43-stable

- **Pas de modification de `lib/ai/prompts/system.ts`** ni d'aucun system prompt Expert sacré (préservé pour Sprint 41-prompts dédié).
- **Pas de patch faille multi-tenant P0** (Sprint 41-sécurité dédié). Mais Claude Code applique le pattern canonique `04-MULTI_TENANT.md` §4 pour TOUTE nouvelle Server Action créée Sprint 43-stable.
- **Pas de page d'authentification** (login, signup, magic link) — assumée existante et fonctionnelle.
- **Pas d'admin Lead `/lead`** (Sprint 42 dédié).
- **Pas de tests E2E** ajoutés ni mis à jour — Sprint 44+ dédié.

---

## 3. Stack technique non-négociable

Selon `01-ARCHITECTURE.md` :

- **Next.js 16** App Router (et non Pages Router).
- **TypeScript strict**, zéro `any` (sauf exception documentée dans `decisions.md`).
- **Server Components par défaut**. Client Component uniquement si interactivité nécessaire (state, event handlers, hooks `use`). Marqueur `"use client"` en haut de fichier.
- **Supabase** côté serveur : `createClient()` (helper `lib/supabase/server.ts` existant). Côté client uniquement pour les composants où la doctrine `04-MULTI_TENANT.md` l'autorise.
- **Tailwind CSS** pour le styling utilitaire + classes CSS custom dans `app/globals.css` pour les composants complexes (Liquid Glass z2, wallpaper, etc.).
- **Lucide React** pour les icônes (stroke 1.6). Pas d'autre librairie d'icônes.
- **Pas de librairie d'animation externe** (Framer Motion interdit en V1) — transitions CSS only.
- **App Router conventions** : `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` par route.

---

## 4. Patterns de référence

### 4.1 Page de référence dans le repo

La page la plus saine post-Sprint 40 est `app/(app)/aujourd-hui/page.tsx`. **Claude Code commence par la lire en entier** avant d'implémenter quoi que ce soit. Il en extrait :

- Pattern d'import (Server Component, types, helpers Supabase).
- Pattern de fetch des données initiales en Server Component.
- Pattern de passage aux Client Components.
- Pattern de structure du fichier `page.tsx` (commentaire d'en-tête, exports).

Si `aujourd-hui/page.tsx` contient encore du code legacy V1 (à vérifier par Claude Code), il le **note dans `decisions.md`** et applique uniquement les patterns conformes doctrine V2.0.

### 4.2 Patterns CSS depuis les HTML mockups

Les 10 HTML dans `docs/design-mockups/` partagent un système de tokens CSS unifié. Le fichier `00-tokens-preview.html` documente les variables (à lire avant tout). Tokens principaux :

```css
--cream: #FBFAF7;
--blue-cf: #007AFF;
--lilac: #A78BFA;
--indigo: #6366F1;
--orange: #FB923C;
--rose: #F472B6;
--mint: #10B981;
--red: #FF3B30;
--text-primary: #1C1C1E;
--text-secondary: #737373;
```

Patterns visuels :
- **Wallpaper neutre crème** sur toutes les pages (`.wallpaper-neutral`).
- **Page header sticky** avec breadcrumb + h1 + subtitle (`.page-header` + compaction au scroll).
- **Page shell** max-width centré (`.page-shell`, 1440px sauf Mon Programme 1080px).
- **Liquid Glass z2** sur les cards principales (background `rgba(251, 250, 247, 0.72)` + `backdrop-filter: blur(40px) saturate(200%)`).
- **Sub-sidebar 260px** sur les pages éditoriales (Bibliothèque, Calendrier, Rappels, Compte) — **PAS** sur Aujourd'hui (sidebar globale) ni Mon Programme (single column) ni Messages (2 panes).

### 4.3 Translation HTML → Next.js

**Claude Code n'inclut PAS les HTML inline dans les routes Next.js.** Les HTML sont des spec visuelles, pas du code à copier-coller. Pour chaque page, Claude Code :

1. Lit le HTML de référence en entier.
2. Identifie les composants logiques (cards, listes, sub-sidebar, etc.).
3. Crée les composants React correspondants dans `components/<page>/`.
4. Style avec Tailwind + classes custom dans `app/globals.css` (réutilisant les tokens).
5. Connecte les données Supabase via Server Component.

---

## 5. Architecture cible

### 5.1 Arborescence à créer

```
app/(app)/
├── aujourd-hui/                       (déjà existe — à refactorer selon §6.1)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── mon-programme/                     (déjà existe — à refactorer selon §6.2)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── bibliotheque/                      (à créer — actuellement sous /outils/bibliotheque)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── messages/                          (à créer entièrement — page absente du repo)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── calendrier/                        (à créer entièrement)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── rappels/                           (à créer entièrement)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
└── compte/                            (déjà existe — à refactorer selon §6.7)
    ├── layout.tsx
    ├── page.tsx
    ├── loading.tsx
    └── error.tsx

components/
├── aujourd-hui/
│   ├── AujourdhuiSidebar.tsx          (sidebar globale 8 destinations)
│   ├── AujourdhuiWidgetCalendrier.tsx
│   ├── AujourdhuiWidgetRappels.tsx
│   ├── AujourdhuiWidgetMessages.tsx
│   └── AujourdhuiRoadmap.tsx
├── mon-programme/
│   ├── MonProgrammeSuggestions.tsx
│   ├── MonProgrammePiliers.tsx
│   └── MonProgrammeHeatmap.tsx
├── bibliotheque/
│   ├── BibliothequeSubSidebar.tsx
│   ├── BibliothequeGrille.tsx
│   ├── BibliothequeItem.tsx
│   └── BibliothequeDetail.tsx
├── messages/
│   ├── MessagesListePane.tsx
│   ├── MessagesThreadPane.tsx
│   ├── MessagesConversation.tsx
│   ├── MessagesInputBar.tsx
│   └── MessagesCarnetExperts.tsx      (Contacts fusionné selon Sprint 39 décision)
├── calendrier/
│   ├── CalendrierSubSidebar.tsx
│   ├── CalendrierVueMois.tsx
│   ├── CalendrierVueSemaine.tsx
│   ├── CalendrierVueListe.tsx
│   └── CalendrierPostCard.tsx
├── rappels/
│   ├── RappelsSubSidebar.tsx
│   ├── RappelsListe.tsx
│   ├── RappelsItem.tsx
│   └── RappelsInputNouveau.tsx
└── compte/
    ├── CompteSubSidebar.tsx
    ├── CompteSectionProfil.tsx
    ├── CompteSectionMarques.tsx
    ├── CompteSectionPlan.tsx
    ├── CompteSectionSecurite.tsx
    └── CompteSectionApparence.tsx

lib/
├── aujourd-hui/queries.ts             (loadTodayData)
├── mon-programme/queries.ts           (loadProgrammeData)
├── bibliotheque/queries.ts            (loadBibliothequeItems avec filtres)
├── messages/queries.ts                (loadConversations + loadConversationMessages)
├── calendrier/queries.ts              (loadCalendrierPosts par range)
├── rappels/queries.ts                 (loadReminders avec sections)
└── compte/queries.ts                  (loadAccountData)

app/_actions/
├── messages/
│   ├── create-message.ts
│   └── update-conversation.ts
├── calendrier/
│   └── (vide V1 — création de post = Sprint Post Creator)
├── rappels/
│   ├── create-rappel.ts
│   ├── complete-rappel.ts
│   ├── update-rappel.ts
│   └── delete-rappel.ts
└── compte/
    └── update-profile.ts
```

### 5.2 Layouts partagés

**Layout (app) global** : `app/(app)/layout.tsx` doit déjà exister. Vérifier qu'il :
- Charge le wallpaper neutre crème.
- N'embarque PAS la sidebar globale (elle est uniquement dans Aujourd'hui selon doctrine `01-ARCHITECTURE.md §2`).
- N'embarque PAS de header global (chaque page a son header sticky).

Si ce layout contient encore du legacy V1, le refactorer minimalement (suppression imports obsolètes, alignement doctrine).

### 5.3 Base de données

**Tables existantes** (déjà créées, RLS active) :
- `tenants`, `brands`, `posts`, `conversations`, `messages` (le cas échéant), `alerts`, `library_documents`, `users`/`auth.users`.

**Tables à créer en Sprint 43-stable** : **AUCUNE.**

Cas particulier : la table `reminders` n'existe pas encore (cf. audit `08-rappels.md`). Pour Sprint 43-stable, Claude Code crée la migration `025_reminders.sql` qui inclut RLS + 4 policies, **selon le template exact de `08-rappels.md §6.3`**. C'est la seule nouvelle table autorisée.

```sql
-- supabase/migrations/025_reminders.sql

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

Pour Messages : si une table `conversations` ou `messages` existe déjà dans le schéma (ce qui est probable post-Sprint 40), Claude Code la repurpose pour Hélène + Experts. **Aucune nouvelle table créée pour Messages.** Si la table n'existe pas, Claude Code note dans `decisions.md` "À créer Sprint 44+" et implémente Messages avec données mockées en attendant.

---

## 6. Spécifications page par page

### 6.1 Aujourd'hui

**HTML de référence** : `docs/design-mockups/01-aujourd-hui-v3.html` (2154 lignes).

**Particularité** : c'est la **seule page qui embarque la sidebar globale** (8 destinations + 2 icônes système). Toutes les autres pages ont leur sub-sidebar interne.

**Structure** :
- `<header class="page-header">` sticky avec breadcrumb absent (Aujourd'hui est la racine), h1 "Aujourd'hui", subtitle date.
- `<aside class="sidebar">` à gauche, 240px, 8 destinations groupées :
  - **TRAVAIL** : Calendrier, Rappels, Bibliothèque, Messages
  - **ÉDITORIAL** : Mon Programme, Ma Marque, Mes Outils
  - **2 icônes système** en bas : Compte, Aide
- `<main class="page-shell">` central avec 3 widgets + Roadmap.

**Densité α stricte** (selon `01-ARCHITECTURE.md §3.1`) :
- Widget Calendrier (3 prochaines publications).
- Widget Rappels (tâches du jour).
- Widget Messages (3 derniers échanges).
- Roadmap orchestrée par Hélène (étapes du jour).
- **Pas d'autre widget.** Pas de "État du programme", pas de "Cohérence", pas de "Dernière activité".

**Données à charger en Server Component** :
- Nom utilisateur (auth.users).
- Nom de la marque (brands.name).
- 3 prochaines publications (posts ordonnés par date_prevue ASC limit 3).
- Rappels du jour (reminders du jour courant).
- 3 dernières conversations Messages (conversations limit 3).

**Refactor de l'existant** : `app/(app)/aujourd-hui/page.tsx` existe déjà. Claude Code le réécrit complètement selon le HTML de référence. Les anciens widgets non doctrinaux ont déjà été retirés en Sprint 40 (DemarrerCard, JalonHero supprimés).

### 6.2 Mon Programme

**HTML de référence** : `docs/design-mockups/02-mon-programme.html` (386 lignes).

**Particularité** : single column max-width 1080px (`mp-shell`), pas de sub-sidebar.

**3 sections doctrine** :
1. **Suggestions pour cette semaine** (3 cards Liquid Glass z2 avec bordure gauche colorée par type : "À planifier", "Série recommandée", "À déléguer").
2. **Piliers actifs · trimestre en cours** (5 pills horizontaux : Anecdote, Produit, Événement, Manifeste, Coulisses + nombre de publications).
3. **Calendrier éditorial · 30 jours** (heatmap 15×2 cellules colorées par pilier + légende + CTA "Ouvrir dans Calendrier").

**Interdits doctrinaux** :
- **PAS** de métriques inventées (Cohérence, Équilibre, Densité, Profondeur).
- **PAS** de pourcentages chiffrés globaux ("Score programme : 87%").
- **PAS** d'animation au mount (pas de barre qui se remplit).

**Données à charger** :
- 3 suggestions IA (générées par Hélène — en V1, données mockées si pas de service Hélène implémenté).
- Comptage publications par pilier (groupBy `posts.pilier` sur le trimestre en cours).
- Publications des 30 prochains jours par jour + pilier (pour la heatmap).

### 6.3 Bibliothèque

**HTML de référence** : `docs/design-mockups/03-bibliotheque-v2.html` (969 lignes).

**Structure** :
- Sub-sidebar gauche `.sub-sidebar` 260px (filtres piliers, période, recherche).
- Content droite : grille 4:5 format Instagram, 3 colonnes desktop, 2 tablette, 1 mobile.
- Clic sur item → sheet de détail latérale ou modal.

**Données à charger** :
- `posts` filtrés par `statut IN ('published', 'published_external', 'archive')` + filtres pilier/période.
- Affichage : visuel (placeholder gradient si pas de média) + caption + pilier + date.

**Cas particulier** : la page Bibliothèque actuelle est sous `/outils/bibliotheque`. Claude Code la déplace vers `/bibliotheque` (top-level) selon doctrine `01-ARCHITECTURE.md §1`. L'ancienne route reste cassée 404 (acceptable beta interne).

### 6.4 Messages (Contacts fusionné)

**HTML de référence** :
- `docs/design-mockups/03-messages.html` (619 lignes) pour la conversation.
- `docs/design-mockups/03bis-contacts.html` (645 lignes) pour le carnet Experts qui est **fusionné** dans Messages.

**Structure 2 panes** :
- Pane gauche `.ms-pane-list` (~320px) : liste des conversations + bouton "Voir tous les contacts" qui ouvre le carnet en sheet/modal.
- Pane droite `.ms-pane-thread` : conversation ouverte style iMessage Apple.

**Conversation style iMessage** :
- Bulles bleues alignées à droite (moi).
- Bulles grises alignées à gauche (Hélène ou Expert).
- Mention visible "Hélène écoute toujours" en bandeau, même en conversation directe avec un Expert.
- Input bas avec attachements + envoyer.

**13 Experts** (selon `02-EXPERTS.md`) :
- Hélène M. orchestratrice (pinned en haut du carnet).
- 12 spécialistes : Sofia P., Léa Z., Capucine V., Jonas K., Albane R., Marc D., Inès B., Sébastien L., Valentine D., Antoine F., Camille O., Élise M.

**Données V1** :
- Liste conversations (mockées si table `conversations` n'a pas la structure adéquate).
- Carnet 13 Experts (données statiques en `lib/messages/experts.ts`).
- Messages échangés (mockés V1).

**Note** : la création d'un vrai service Hélène orchestratrice avec appel Anthropic est **hors scope Sprint 43-stable**. Sprint 41-prompts dédié. Pour Sprint 43-stable, la conversation est non-fonctionnelle (input désactivé ou affiche "Service Hélène en cours de configuration").

### 6.5 Calendrier

**HTML de référence** : `docs/design-mockups/07-calendrier.html` (625 lignes).

**Structure** :
- Sub-sidebar `.sa-sidebar` 260px : mini-calendrier + filtres piliers + bouton "Nouvelle publication".
- Content droite : 3 vues toggleables (Mois / Semaine / Liste).

**Vues** :
- **Mois** (par défaut) : grille 7 colonnes × 5-6 lignes, cellules cliquables avec mini-cards posts.
- **Semaine** : timeline 7 jours.
- **Liste** : chronologique.

**Interactions** :
- Clic sur post → page dédiée `/calendrier/[postId]` (à créer selon spec `07-calendrier.md §6.4` — preview Instagram 4:5 + métadonnées + actions + historique révisions).
- Bouton "Nouvelle publication" → ouvre Post Creator (Sprint Post Creator dédié, donc en Sprint 43-stable affiche "Post Creator en cours de configuration").
- Bouton "Préparer ce post" sur une carte post → idem.

**Données** :
- `posts` avec `date_prevue` dans la range affichée + `tenant_id = public.user_tenant_id()`.

### 6.6 Rappels

**HTML de référence** : `docs/design-mockups/08-rappels.html` (562 lignes).

**Structure** :
- Sub-sidebar `.sa-sidebar` : filtres rapides ("Tous", "Aujourd'hui", "Cette semaine", "Complétés").
- Content droite : sections temporelles Apple Reminders style.

**Sections affichées** :
1. **En retard** (rouge `#FF3B30` si échéance dépassée).
2. **Aujourd'hui**.
3. **Demain**.
4. **Cette semaine** (J+2 à J+7).
5. **Plus tard** (J+8 et au-delà).
6. **Sans date**.

**Interactions** :
- Input "Ajouter un rappel..." en haut → enter crée.
- Check circle gauche → coche/décoche.
- Clic sur titre → sheet détail (notes, source, échéance).
- Swipe (desktop : actions au hover) → marquer fait ou supprimer.

**Migration** : `025_reminders.sql` selon §5.3.

**Server Actions** : `create-rappel.ts`, `complete-rappel.ts`, `update-rappel.ts`, `delete-rappel.ts` selon le pattern canonique `04-MULTI_TENANT.md §4`.

### 6.7 Compte

**HTML de référence** : `docs/design-mockups/06-compte.html` (459 lignes).

**Structure** :
- Sub-sidebar `.sa-sidebar` : navigation entre sections (Profil, Marques, Plan, Sécurité, Apparence).
- Content droite : section sélectionnée.

**5 sections** :
1. **Profil** : nom, email, avatar, langue.
2. **Marques** : bloc unique "Ma Marque" qui renvoie vers la page Ma Marque (pas de liste multi-marque V1, doctrine `01-ARCHITECTURE.md §4`).
3. **Plan et facturation** : plan actuel, historique factures (mockées V1).
4. **Sécurité** : changement mot de passe, sessions actives, "Se déconnecter".
5. **Apparence** : thème clair/auto (pas de dark mode V1 sauf si déjà supporté).

**Server Action** : `update-profile.ts` pour modifier nom/avatar/langue.

**Note doctrine §4** : Compte n'embarque PAS de sélecteur de marque dans le header. Si l'ancien Compte avait un sous-arbre `/compte/ma-marque/*`, il a été supprimé en Sprint 40 Phase 2B Bloc 17. Claude Code ne le recrée pas.

---

## 7. Cas spéciaux

### 7.1 Sidebar globale Aujourd'hui

Selon `01-ARCHITECTURE.md §2`, la sidebar globale 8 destinations est **uniquement visible dans Aujourd'hui**. Sur toutes les autres pages, c'est la sub-sidebar interne qui prend la place.

Implémentation : `AujourdhuiSidebar.tsx` est un composant React imbriqué dans `app/(app)/aujourd-hui/page.tsx` uniquement, **pas** dans `app/(app)/layout.tsx`. Les liens dans la sidebar pointent vers `/calendrier`, `/rappels`, `/bibliotheque`, `/messages`, `/mon-programme`, `/ma-marque`, `/outils`, `/compte`, `/aide`.

Pour les routes manquantes (`/ma-marque`, `/outils`, `/aide`) : le lien existe dans la sidebar et mène à une page **temporairement vide** (voir §7.2).

### 7.2 Pages absentes mais référencées dans la sidebar

Selon décision Lead "beta interne" (chat 21 mai 2026 22h47) : on accepte temporairement de contredire `00-CONCEPT.md §6 pilier 6 "Zéro bientôt, zéro à venir"` parce qu'il n'y a pas de testeurs externes.

Pour `/ma-marque`, `/outils`, `/aide` : Claude Code crée des routes Next.js **minimales** avec un état vide explicite :

```tsx
// app/(app)/ma-marque/page.tsx (template temporaire Sprint 43-stable)
export default function MaMarquePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <h1 className="header-h1">Ma Marque</h1>
        <p className="header-subtitle">Identité éditoriale</p>
      </header>
      <section className="empty-state">
        <p>Page en cours de conception (Sprint cadrage).</p>
      </section>
    </main>
  );
}
```

Idem pour `/outils` et `/aide`. Ces 3 pages sont créées pour ne pas casser la sidebar globale, mais leur contenu réel viendra :
- `/ma-marque` après Sprint cadrage (onboarding défini).
- `/outils` en coquille + Sprint Post Creator complète.
- `/aide` après Sprint cadrage.

### 7.3 Service Hélène et Experts non implémenté en Sprint 43-stable

Sprint 43-stable construit les **shells de Messages et Mon Programme** sans réellement appeler l'API Anthropic. Les conversations affichent des messages mockés (par exemple un dialogue d'exemple Hélène ↔ utilisateur en `lib/messages/seed-conversation.ts`). Les suggestions Mon Programme sont mockées.

Le service réel (appel Anthropic Opus 4.7 / Sonnet 4.6 selon Expert, gestion conversation streaming) est **Sprint 41-prompts dédié**.

### 7.4 Routes legacy résiduelles

Suite à Sprint 40 Phase 2B, certaines routes legacy sont supprimées (`/outils/conseiller`, `/outils/messages`, `/programme/retombees`, etc.). Claude Code ne les recrée pas et **ne touche pas** à d'éventuelles entrées résiduelles dans les composants `OutilsCatalog.tsx` ou similaire — ces refactors ont déjà été faits Sprint 40 Phase 2B.

---

## 8. Workflow opérationnel

### 8.1 Setup initial

```bash
cd /Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
git checkout sprint-40-audit-purge
git pull
git checkout -b sprint-43-stable
mkdir -p audits/sprint-43-stable
```

### 8.2 Ordre d'exécution

Claude Code procède page par page dans cet ordre exact (du plus simple au plus complexe pour minimiser les régressions) :

```
8.2.1  Lecture en entier de skills/00-MASTER.md, 00-CONCEPT.md, 01-ARCHITECTURE.md, 02-EXPERTS.md, 04-MULTI_TENANT.md, 10-SACRED.md
8.2.2  Lecture en entier de docs/design-mockups/00-tokens-preview.html
8.2.3  Lecture en entier de app/(app)/aujourd-hui/page.tsx (pattern de référence)
8.2.4  Lecture en entier de app/(app)/layout.tsx
8.2.5  Création de archive/v1-leftovers/sprint-43-leftovers/ (si refactor d'existants génère des backups)
       → commit chore(sprint-43-stable): setup branche + archive folder

8.2.6  Page 1/7 — Aujourd'hui (refactor existant)
       → lecture docs/design-mockups/01-aujourd-hui-v3.html
       → refactor app/(app)/aujourd-hui/page.tsx + création composants components/aujourd-hui/*
       → npx tsc --noEmit (doit passer)
       → commit feat(sprint-43-stable): page Aujourd'hui v2.0

8.2.7  Page 2/7 — Mon Programme (refactor existant)
       → lecture docs/design-mockups/02-mon-programme.html
       → refactor app/(app)/mon-programme/page.tsx + création composants components/mon-programme/*
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Mon Programme v2.0

8.2.8  Page 3/7 — Compte (refactor existant)
       → lecture docs/design-mockups/06-compte.html
       → refactor app/(app)/compte/page.tsx + création composants components/compte/*
       → server action update-profile.ts (pattern multi-tenant canonique)
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Compte v2.0

8.2.9  Page 4/7 — Bibliothèque (déplacement /outils/bibliotheque → /bibliotheque)
       → lecture docs/design-mockups/03-bibliotheque-v2.html
       → création app/(app)/bibliotheque/* + composants components/bibliotheque/*
       → lib/bibliotheque/queries.ts (loadBibliothequeItems avec filtres)
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Bibliothèque v2.0 top-level

8.2.10 Page 5/7 — Calendrier (création)
       → lecture docs/design-mockups/07-calendrier.html
       → création app/(app)/calendrier/* + composants components/calendrier/*
       → lib/calendrier/queries.ts
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Calendrier v2.0

8.2.11 Page 6/7 — Rappels (création + migration SQL)
       → lecture docs/design-mockups/08-rappels.html
       → création supabase/migrations/025_reminders.sql
       → création app/(app)/rappels/* + composants components/rappels/*
       → 4 server actions rappels (pattern multi-tenant canonique)
       → lib/rappels/queries.ts + lib/rappels/types.ts
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Rappels v2.0 + migration 025

8.2.12 Page 7/7 — Messages (création, données mockées)
       → lecture docs/design-mockups/03-messages.html + 03bis-contacts.html
       → création app/(app)/messages/* + composants components/messages/*
       → lib/messages/experts.ts (13 Experts données statiques)
       → lib/messages/seed-conversation.ts (conversation mockée)
       → npx tsc --noEmit
       → commit feat(sprint-43-stable): page Messages v2.0 (mocké, service Sprint 41-prompts)

8.2.13 Templates temporaires pour /ma-marque, /outils, /aide selon §7.2
       → commit feat(sprint-43-stable): templates temporaires 3 pages grises

8.2.14 npm run build (doit compiler avec 0 erreur)
       → commit chore(sprint-43-stable): build validation

8.2.15 Production audits/sprint-43-stable/zz-auto-evaluation.md selon §10
       → commit docs(sprint-43-stable): auto-évaluation finale

8.2.16 git push origin sprint-43-stable
       → STOP final
```

### 8.3 Discipline d'attente

À la fin du push final, Claude Code écrit dans `audits/sprint-43-stable/decisions.md` un résumé des décisions techniques prises (notamment pour les zones où la doctrine était silencieuse) et **STOP**. Le Lead valide manuellement le matin suivant.

---

## 9. Quality gates

### 9.1 Validation TypeScript après chaque page

`npx tsc --noEmit` doit retourner 0 erreur **après chaque page implémentée**. Si erreur, Claude Code investigue avant de continuer (pas de commit avec des erreurs TS).

### 9.2 Build final

`npm run build` doit compiler avec 0 erreur à la fin de Sprint 43-stable. Warnings tolérés s'ils étaient pré-existants au Sprint 40 (cf. `zz-auto-evaluation.md` Sprint 40 finale : 4 erreurs + 31 warnings lint pré-existants).

### 9.3 Anti-patterns refusés

Claude Code refuse en autonomie les actions suivantes, même si une lecture rapide pourrait le suggérer :

- **Modifier les 7 fichiers `skills/*.md`.** La doctrine est figée.
- **Modifier `lib/ai/prompts/system.ts` ou tout system prompt sacré.** Sprint 41-prompts dédié.
- **Créer de nouvelles tables SQL hors `025_reminders.sql`.** Tout autre besoin de schéma → noter dans `decisions.md` pour Sprint 44+.
- **Réintroduire des composants supprimés en Sprint 40 Phase 2B** (DemarrerCard, JalonHero, Conseiller V1, Coaching daily, Retombées V1, etc.). Vérifier `archive/v1-leftovers/` mais ne pas récupérer.
- **Utiliser le pattern `createAdmin()` côté user.** Toute Server Action utilise le pattern canonique `04-MULTI_TENANT.md §4`.
- **Inventer des métriques.** Pas de "Score programme", pas de "Cohérence", pas de "Densité". Les seuls chiffres affichés sont des comptages factuels (X publications, Y rappels).
- **Utiliser le forest green `#1F4937` ou tout vert forêt.** Palette V2.0 stricte (`00-CONCEPT.md §11`).
- **Utiliser du vocabulaire interdit dans les copies UI** : "users", "audience", "dashboard", "workflow", "pipeline", "viral", "boost", "growth", "gamification", "streaks", "badges", "XP", "quêtes", "score", "KPI", "ROI", "tableau de bord", "à venir", "bientôt", "coming soon". Liste complète dans `00-CONCEPT.md §9`. **Exception §7.2** : la mention "Page en cours de conception (Sprint cadrage)" est autorisée sur les 3 pages temporaires car beta interne.
- **Pousser sur main.** Branche `sprint-43-stable` uniquement.
- **Tagger.** Pas de git tag. Lead les fait manuellement à la fin si pertinent.

---

## 10. Auto-évaluation finale

À la fin de l'étape 8.2.15, Claude Code rédige `audits/sprint-43-stable/zz-auto-evaluation.md` qui répond aux questions suivantes :

1. Les 7 pages stables sont-elles toutes implémentées avec leur structure complète ?
2. Les 3 pages grises (Ma Marque, Mes Outils, Aide) sont-elles en templates temporaires §7.2 ?
3. La migration `025_reminders.sql` est-elle créée avec RLS + 4 policies ?
4. Aucun fichier doctrinal `skills/*.md` n'a été modifié ?
5. `lib/ai/prompts/system.ts` et tous les system prompts sacrés sont intacts ?
6. Aucun commit poussé sur `main` ?
7. `npx tsc --noEmit` retourne 0 erreur ?
8. `npm run build` compile avec 0 erreur ?
9. Tous les composants utilisent les tokens CSS doctrine V2.0 (pas de forest green, pas de couleurs hardcodées hors palette) ?
10. Toutes les Server Actions créées utilisent le pattern canonique `04-MULTI_TENANT.md §4` ?
11. Le vocabulaire interdit `00-CONCEPT.md §9` est-il absent des copies UI (hors exception §7.2) ?
12. La sidebar globale est-elle uniquement dans `/aujourd-hui` ?
13. Les 13 Experts sont-ils correctement listés dans `lib/messages/experts.ts` avec leurs LLM (Hélène + 6 Opus, 6 Sonnet) ?
14. Le déplacement Bibliothèque (`/outils/bibliotheque` → `/bibliotheque`) a-t-il été effectué ?

Verdict binaire par question. Si une seule réponse est NON, `decisions.md` mentionne ce qui reste à faire et un Sprint 43-stable correctif peut être planifié.

---

## 11. Critères d'acceptation Lead

Le Lead valide Sprint 43-stable si et seulement si :

- Les 7 pages sont visuellement reconnaissables comme leurs HTML de référence.
- `npm run build` passe.
- L'auto-évaluation §10 est honnête (NON tracé dans `decisions.md`).
- Aucun fichier doctrinal modifié.
- Aucun commit sur `main`.
- Les 3 templates temporaires §7.2 sont en place pour ne pas casser la sidebar globale.

---

*Brief Sprint 43-stable émis le 21 mai 2026 à 12h30 par le Lead. Lecture conjointe obligatoire avec `skills/00-MASTER.md`, `00-CONCEPT.md`, `01-ARCHITECTURE.md`, `02-EXPERTS.md`, `04-MULTI_TENANT.md`, `10-SACRED.md`, et les 10 HTML dans `docs/design-mockups/`. Toute proposition d'amendement passe par commit Lead sur la branche `sprint-43-stable`.*
