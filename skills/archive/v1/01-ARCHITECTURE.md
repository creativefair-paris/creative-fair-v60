# Creative Fair — Architecture v2.0

> Document doctrinal complémentaire à `00-CONCEPT.md`.
> Couvre la navigation, les layouts canoniques, le modèle hub central, le pattern de retour.
> Mis à jour le 20 mai 2026 (Sprint 39).

---

## 1. La carte du produit

Creative Fair compte dix pages principales en V1. Aucune autre page top-level n'est admise sans amendement de ce document.

| Page | Rôle | Section nav |
|---|---|---|
| **Aujourd'hui** | Hub central, point d'entrée systématique | (racine, hors section) |
| **Calendrier** | Vue temporelle des publications futures et événements | Travail |
| **Rappels** | Tâches à faire, format Things 3 | Travail |
| **Bibliothèque** | Mémoire éditoriale, publications passées format 4:5 | Travail |
| **Messages** | Conversations avec Hélène et les Experts, plus carnet | Travail |
| **Mon Programme** | Pilotage trimestriel et hebdomadaire de la marque | Éditorial |
| **Ma Marque** | Doctrine éditoriale, piliers, univers, ressources | Éditorial |
| **Mes Outils** | Catalogue des outils de création éditoriale | Éditorial |
| **Compte** | Profil utilisateur, plan, sécurité, apparence | Système (icône) |
| **Aide** | Support, à propos | Système (icône) |

**Contacts** n'est pas une page distincte. Le carnet de contacts est intégré dans **Messages** via un bouton "Voir tous les contacts" ou un onglet Carnet (à arbitrer à l'implémentation).

**Conseiller** n'est pas une page distincte. La conversation avec l'IA orchestratrice se fait via **Messages** où Hélène M. est pinned en permanence.

---

## 2. La navigation

### 2.1 Sidebar globale — visible dans Aujourd'hui uniquement

L'unique endroit où la navigation complète est exposée est la page **Aujourd'hui**. La sidebar globale liste les huit destinations principales groupées en deux sections nommées, plus une ligne d'icônes système en bas.

```
TRAVAIL
  ▸ Calendrier
  ▸ Rappels
  ▸ Bibliothèque
  ▸ Messages

ÉDITORIAL
  ▸ Mon Programme
  ▸ Ma Marque
  ▸ Mes Outils

[icône Compte]  [icône Aide]
```

Les icônes Compte et Aide sont sur **une seule ligne en bas de la sidebar**, sans label, juste l'icône. Tap dessus = ouverture de la page correspondante.

Les sections (TRAVAIL, ÉDITORIAL) sont des **eyebrows** typographiques `11px / 600 / uppercase / letter-spacing 0.08em / color rgba(60,60,67,0.45)`. Pas de séparateur visuel agressif.

### 2.2 Pas de sidebar globale ailleurs

Toutes les pages **autres qu'Aujourd'hui** sont autonomes : elles n'affichent pas la sidebar globale. Elles utilisent leur propre **sub-sidebar interne** quand elles ont besoin d'une navigation secondaire (ex : Ma Marque, Compte, Calendrier, Rappels, Mes Outils, Bibliothèque, Messages).

La navigation entre pages se fait par :

1. **Le fil d'Ariane.** Chaque page affiche en haut un breadcrumb du type `Aujourd'hui › Ma Marque`. Cliquer sur "Aujourd'hui" renvoie au hub central. Cliquer sur le segment de la page courante ne fait rien.
2. **Les widgets cliquables d'Aujourd'hui.** Le widget Calendrier ouvre Calendrier, le widget Rappels ouvre Rappels, etc.
3. **Les deep-links contextuels.** Une publication dans Bibliothèque peut renvoyer vers Mon Programme avec un contexte `?from=bibliotheque&context=postId`.

Ce modèle est délibéré. Il garantit que **Floriane revient au hub central plusieurs fois par jour**, ce qui maintient la vue d'ensemble. C'est l'inverse du modèle SaaS classique qui pousse l'utilisateur à errer dans des sous-pages sans jamais revoir le panorama.

### 2.3 Pourquoi pas 5 destinations top-level

La doctrine v60 originale prévoyait 5 destinations top-level (Aujourd'hui / Mon Programme / Ma Marque / Mes Outils / Conseiller). Cette nav est **dépassée** depuis le pivot de mai 2026.

Raisons documentaires :

- Cinq verbes éditoriaux suffisent à décrire le travail. Mais en pratique Floriane manipule aussi des objets temporels (Calendrier, Rappels) et de la mémoire (Bibliothèque) qui sont des **system apps** au sens iOS, distinctes des verbes éditoriaux.
- Le pattern Apple natif (Mail, Calendar, Reminders, Contacts, Messages comme apps séparées) est lisible immédiatement et n'ajoute pas de charge cognitive si la sidebar est bien hiérarchisée en sections.
- La sidebar globale visible **uniquement sur Aujourd'hui** + le retour systématique via fil d'Ariane reproduit l'expérience d'un Springboard iOS sans en avoir la lourdeur visuelle.

### 2.4 Pas de tabs, pas de bottom nav

Pas d'onglets en bas d'écran (style iOS app native). Pas de tabs horizontaux qui changent radicalement de contexte. La navigation est verticale (sidebar) ou en breadcrumb. Point.

---

## 3. Le layout canonique

### 3.1 Layout d'Aujourd'hui (le hub)

```
┌──────────────────────────────────────────────────────────┐
│  page-header  (sticky, breadcrumb désactivé, H1 + date)   │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  Content pane                               │
│  globale   │  ├─ 3 widgets (Calendrier · Rappels · Mes.) │
│  10 items  │  └─ Roadmap "X étapes pour aujourd'hui"     │
│  + 2 icons │                                             │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

Densité Aujourd'hui = option α stricte minimale, actée Sprint 39 :

- Trois widgets visibles uniquement : Calendrier, Rappels, Messages.
- Un bloc Roadmap visible uniquement : le parcours du jour orchestré par Hélène.
- **Pas d'État du programme.** Pas de KPIs Cohérence/Équilibre/Densité/Profondeur. Aucune métrique inventée.
- **Pas de Dernière activité.** Cette section, sympathique mais non actionnable, est retirée.

La Roadmap n'a pas un nombre fixe d'étapes. Hélène génère 3 à 10 étapes selon la charge réelle du jour. Si Floriane n'a que deux choses à faire, la Roadmap affiche deux étapes, pas une dilution artificielle à sept.

### 3.2 Layout des pages métier (toutes sauf Aujourd'hui)

```
┌──────────────────────────────────────────────────────────┐
│  page-header  (sticky, breadcrumb actif, H1, sous-titre)  │
├────────────┬─────────────────────────────────────────────┤
│  Sub-      │                                             │
│  sidebar   │  Content pane                               │
│  260px     │                                             │
│  (interne  │  (variant selon la page)                    │
│  à la      │                                             │
│  page)     │                                             │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

La sub-sidebar interne fait **260px** de large (constante actée). Sticky en haut (`top: 100px`), `height: fit-content`, fond `rgba(255,255,255,0.4)` avec `backdrop-filter: blur(16px)`, border `0.5px rgba(0,0,0,0.05)`, radius `14px`, padding `14px 12px`.

Le content pane occupe le reste, `gap: var(--s-6)` entre les deux panes.

En mobile (≤900px), le grid passe à une seule colonne et le sub-sidebar passe au-dessus du content.

### 3.3 Le page-header canonique

Tous les page-headers partagent la même grammaire :

- Sticky en haut, fond transparent (le wallpaper transparaît).
- Padding vertical 24px ouvert, 12px compacté (au scroll, classe `is-scrolled`).
- En contenu : breadcrumb `Aujourd'hui ›` (caché en mode compacté), H1 du nom de la page, sous-titre optionnel sous le H1.
- Avatar utilisateur trailing à droite, niveau de la ligne H1.

### 3.4 Le wallpaper

Deux variantes seulement :

- **Wallpaper neutral.** Crème nuancée diffuse, très léger gradient radial. Par défaut sur toutes les pages métier.
- **Wallpaper saturated.** Halos colorés (bleu CF, lilas, indigo, orange) animés en `drift` 18-30s. Réservé à Aujourd'hui uniquement, pour donner au hub central un caractère plus chaleureux.

Les anciennes versions affichaient des halos sur toutes les pages. **À supprimer.** Seul Aujourd'hui garde le wallpaper saturé.

---

## 4. Le mode mono-marque V1

Un utilisateur Creative Fair pilote une seule marque active. Conséquences architecturales :

- Pas de sélecteur de marque dans le header. Pas de switch.
- Compte > Marques n'affiche pas de liste — il y a un bloc unique "Ma Marque" qui renvoie vers la page Ma Marque.
- Ma Marque > sidebar > "Plan Pro · une marque active" est rédigé sans ambiguïté. Le bouton "Changer" est désactivé en V1.

Le multi-marque est ouvert en V2 sur un Plan Studio. L'architecture doit dès V1 prévoir le `tenant_id` partout (RLS multi-tenant strict sur Supabase) pour que la bascule V2 soit triviale. Mais l'UI V1 ne montre aucune mention multi-marque.

---

## 5. Le pattern de retour

Floriane doit pouvoir, depuis n'importe quel point du produit, revenir à Aujourd'hui en un clic.

Trois mécanismes garantissent ce retour :

1. **Le breadcrumb.** Toutes les pages ont `Aujourd'hui ›` cliquable en haut.
2. **Le raccourci clavier.** `Cmd/Ctrl + H` ramène à Aujourd'hui depuis n'importe où. (À implémenter Sprint 43+, pas critique V1.)
3. **Le logo CF dans le page-header.** À ajouter en V1.1 dans le coin haut gauche, cliquable, qui renvoie aussi à Aujourd'hui. (Pas dans les HTML actuels, à acter.)

---

## 6. Les états cross-pages

Certaines données circulent entre pages :

- **Une publication** peut exister dans Bibliothèque (archivée), dans Calendrier (programmée), dans Mon Programme (vue trimestrielle), dans Messages (discutée avec Hélène). Toutes ces vues pointent vers la même entité backend `posts.id`.
- **Une tâche** dans Rappels peut être créée par Hélène en conversation Messages, ou créée manuellement, ou générée automatiquement par la Roadmap d'Aujourd'hui.
- **Un pilier** dans Ma Marque (table `pillars`) est référencé par les publications (`posts.pilier_id`), par le programme (Mon Programme > Piliers actifs), par les suggestions de série (Mon Programme > Suggestions).

Le pattern technique pour exposer ce cross-context à l'utilisateur est `?from=<module>&context=<id>` dans les query params, capturé par un composant `<ContextBanner>` en haut de la page de destination qui dit par exemple : *« Tu viens de Messages — Hélène te propose cette publication »*, avec un retour rapide.

---

## 7. Le multi-tenant et la sécurité

Toutes les routes Server Actions, toutes les requêtes Supabase, doivent inclure un check `tenant_id` strict.

Le pattern fautif identifié au Sprint 38 — `createAdmin()` + `.eq("id", ...)` sans vérification d'appartenance — est interdit. Il est à éradiquer **avant tout client en production**.

Le pattern canonique :

```ts
const { data } = await supabase
  .from('table')
  .select()
  .eq('tenant_id', session.tenant_id)
  .eq('id', resourceId)
  .single()
```

Ou côté Server Action mutante : vérification d'ownership via une RPC dédiée qui croise `auth.uid()` et `tenant_id`. Le client n'envoie jamais son `tenant_id` — il est lu depuis la session côté serveur uniquement.

Cette discipline est non-négociable, même en V1 mono-marque, parce qu'elle conditionne la bascule V2 multi-marque sans surface d'attaque.

---

## 8. Le stack technique en bref

Pour mémoire, le stack est figé en V1 :

- **Frontend.** Next.js 16 (App Router), TypeScript, TailwindCSS v4 sans config (CSS-first), Lucide React pour les icônes.
- **Backend.** Supabase (Frankfurt eu-west, project `ugfnokdxdqaqapylafeq`), PostgreSQL avec RLS, Auth magic link.
- **IA.** Anthropic Claude (Opus 4.7, Sonnet 4.6, Haiku 4.5) via SDK officiel. Prompts cacheable.
- **Déploiement.** Vercel, branche `main` protégée, déploiements preview par sprint-X.
- **Convention de path composant.** `components/outils/mockups/` (App Router). Pas de mélange Pages Router / App Router.

Toute proposition d'ajout de dépendance majeure (autre LLM provider, autre framework, autre BDD) doit passer par un amendement explicite de ce document.

---

*Document v2.0 du 20 mai 2026. Toute proposition de modification passe par un Sprint dédié, jamais en passant.*
