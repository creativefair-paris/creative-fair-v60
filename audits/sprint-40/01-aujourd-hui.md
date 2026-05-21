# Audit Sprint 40 — Page Aujourd'hui

> Verdict global : **À refactorer**
> Doctrine de référence : `00-CONCEPT.md` §7 (Aujourd'hui = hub central), `01-ARCHITECTURE.md` §1 (Aujourd'hui hors section), §2.1 (sidebar globale visible ici uniquement), §3.1 (layout du hub).

---

## 1. Périmètre audité

Page principale du produit V2.0 — point d'entrée systématique de Floriane chaque matin. Le hub central.

### 1.1 Routes et layouts

- `app/(aujourd-hui)/layout.tsx` — shell vertical avec `<main flex-1>` (12 lignes, stub minimal).
- `app/(aujourd-hui)/aujourd-hui/page.tsx` — Server Component Aujourd'hui. Sprint 36.G refonte V3 "Tranquillité du pilote". ~600 lignes.

### 1.2 Composants client liés à Aujourd'hui

- `components/today/AFaireCetteSemaine.tsx`
- `components/today/BlocCetteSemaine.tsx`
- `components/today/CriticalBanner.tsx`
- `components/today/DemarrerCard.tsx`
- `components/today/SuggestedSignal.tsx`
- `components/today/TaskRow.tsx`

### 1.3 Layout split brief (legacy)

- `components/layouts/SplitBrief.tsx` — wrapper Split Brief 40/60 utilisé sur Aujourd'hui ET d'autres pages (sortira un jour).
- `components/split-brief/SplitBrief.tsx` — doublon ou variante (à investiguer).
- `app/(dev)/dev/split-brief/page.tsx` + `SplitBriefDemoClient.tsx` — demo dev.

### 1.4 Server actions et data

- `lib/aujourd-hui/load-data.ts` — agrège posts du jour, alerts, jalons.
- `lib/aujourd-hui/compute-stats.ts` — calcule des stats du jour.
- `lib/aujourd-hui/dates-fr.ts` — formatage des jours FR.
- `lib/aujourd-hui/suggestions.ts` — calcule les suggestions de la semaine.

### 1.5 Composants layout transverses utilisés

- `components/layout/PageHeader.tsx` — header sticky utilisé par toutes les pages.
- `components/layout/NavigationBar.tsx` — barre de navigation 4 destinations (legacy).
- `components/jalons/JalonHero.tsx` — bandeau d'alerte fondations.

### 1.6 Composants absents (doctrine V2.0)

- **Sidebar globale 8 destinations groupées TRAVAIL/ÉDITORIAL + 2 icônes système.** Inexistante. `NavigationBar.tsx` actuel = nav 4 destinations top-level legacy.
- **3 widgets Calendrier · Rappels · Messages.** Inexistants comme composants discrets.
- **Bloc Roadmap "X étapes pour aujourd'hui" généré par Hélène.** Inexistant. Le code actuel a un `<DemarrerCard>` orienté onboarding, et `<AFaireCetteSemaine>` orienté hebdo, mais aucune Roadmap orchestrée par Hélène.

---

## 2. Confrontation à la doctrine

### `app/(aujourd-hui)/aujourd-hui/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1 "Densité Aujourd'hui = option α stricte minimale… Trois widgets visibles uniquement : Calendrier, Rappels, Messages. Un bloc Roadmap visible uniquement". `00-CONCEPT.md` §14 décisions abandonnées "Apple Santé avec 4 indicateurs vitaux dans Mon Programme (exploration jamais validée)".
- **Constat factuel :** Le commentaire d'en-tête revendique "Refonte V3 sous doctrine Tranquillité du pilote", layout Split Brief 40/60, gauche = Prochaine action + État programme + État Ma Marque, droite = Aujourd'hui + Cette semaine + Suggéré.
- **Écart constaté :**
  1. Layout Split Brief 40/60 ≠ layout doctrinal "3 widgets + 1 Roadmap" sans split.
  2. Section "État programme" et "État Ma Marque" en gauche = anciens KPIs métier qui ne correspondent à aucun des 3 widgets canoniques (Calendrier · Rappels · Messages).
  3. Pas de Roadmap orchestrée par Hélène.
  4. Pas de sidebar globale 8 destinations.
  5. Présence de `JalonHero` (bandeau jalons fondations) hors doctrine V2.0.
  6. Code repose sur la persistance des concepts Sprint 36.G (Bloc 1/2/3 + A/B/C) au lieu de la cible V2.0.
- **Action proposée Phase 2 :** Refactor structurel complet. Réécrire `page.tsx` selon §3.1 doctrinal une fois que la sidebar globale 8 dest + les 3 widgets + Roadmap Hélène seront produits (Sprint 43+). En attendant, garder la page mais retirer le terme "dashboard" du commentaire d'en-tête + retirer mention "État du programme" / "État de Ma Marque" qui simule un contrôle par métriques.

### `app/(aujourd-hui)/layout.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1 (layout shell minimaliste).
- **Constat factuel :** 12 lignes, `<main flex-1>` sur `bg-[var(--color-background)]`.
- **Écart constaté :** Aucun. Stub léger qui ne préjuge de rien.
- **Action proposée Phase 2 :** Aucune.

### `components/today/CriticalBanner.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §3 "tranquillité du pilote en cockpit" — alertes oui, mais pas de pression artificielle. `00-CONCEPT.md` §11 palette `#FF3B30` urgence et destructif uniquement.
- **Constat factuel :** Composant client, ID `<critical-alert>`, affiche les alerts critiques actives sur la page Aujourd'hui.
- **Écart constaté :** À auditer pixel-près au Sprint 41 (couleurs, copie, vocabulaire). Le concept "bannière critique" est cohérent avec la doctrine si limité aux vraies urgences (alertes jalons fondations expirées, post programmé pour aujourd'hui sans visuel, etc.).
- **Action proposée Phase 2 :** Conserver. Vérifier copies via grep vocabulaire (cf. §10-transverse).

### `components/today/AFaireCetteSemaine.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1 "Trois widgets visibles uniquement : Calendrier, Rappels, Messages". `00-CONCEPT.md` §5 promesse 1 "Tu sais quoi faire aujourd'hui. En ouvrant l'app, Floriane voit son parcours du jour, généré et orchestré par Hélène."
- **Constat factuel :** Composant bloc B "Cette semaine" de la refonte Sprint 36.G. Liste des publications de la semaine, par jour.
- **Écart constaté :** Concept "à faire cette semaine" non listé parmi les 3 widgets canoniques (Calendrier · Rappels · Messages). Le widget Calendrier doctrinal couvre déjà la dimension temporelle.
- **Action proposée Phase 2 :** Refactor — soit fusionner dans le futur widget Calendrier (Sprint 43), soit supprimer. À trancher avec Lead.

### `components/today/BlocCetteSemaine.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** idem ci-dessus.
- **Constat factuel :** Doublon ou variante structurelle d'`AFaireCetteSemaine`.
- **Écart constaté :** Deux composants au libellé proche → ambigüité. Cible V2.0 = un widget Calendrier unique.
- **Action proposée Phase 2 :** Investiguer (doublon ?) et fusionner ou supprimer le résiduel.

### `components/today/DemarrerCard.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 décisions abandonnées "Onboarding 10 questions (remplacé par F89 wizard piliers 5 questions)" + §6 pilier 8 "Out of the Box Experience. Pas de configuration laborieuse, pas de vide initial décourageant. Au premier login, Floriane voit déjà sa marque, ses piliers, son calendrier — pré-remplis intelligemment par l'onboarding initial." + `01-ARCHITECTURE.md` §3.1 (densité α stricte minimale).
- **Constat factuel :** Card "Démarrer" avec des étapes (`DemarrerStep[]`). Type onboarding visible en home.
- **Écart constaté :** Le hub Aujourd'hui doctrinal V2.0 n'expose pas d'onboarding visible — Floriane voit son parcours du jour orchestré par Hélène. La doctrine V2.0 part du principe que l'onboarding est fait au login initial (B2B custom + pré-remplissage Lead).
- **Action proposée Phase 2 :** Recalé. Supprimer le composant et son usage dans `page.tsx`. Backup `archive/v1-leftovers/today/DemarrerCard.tsx` car a valeur historique (modèle Sprint 36.G).

### `components/today/SuggestedSignal.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2 "Mon Programme > Suggestions semaine : Hélène M. génère trois suggestions."
- **Constat factuel :** Carte de signal suggéré (rangée droite, bloc C de Sprint 36.G).
- **Écart constaté :** Concept "signal suggéré" en home pourrait être intéressant comme entrée des Suggestions, mais doctrine V2.0 localise les suggestions dans Mon Programme. Sur Aujourd'hui : pas de suggestion isolée — la Roadmap d'Hélène contient déjà l'agenda du jour.
- **Action proposée Phase 2 :** Refactor — soit migrer dans Mon Programme, soit supprimer si redondant avec la Roadmap.

### `components/today/TaskRow.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1 "La Roadmap n'a pas un nombre fixe d'étapes. Hélène génère 3 à 10 étapes selon la charge réelle du jour."
- **Constat factuel :** Ligne d'une tâche (Things 3-like).
- **Écart constaté :** Le concept "ligne de tâche" peut servir directement à la Roadmap V2.0 = excellent point de départ pour l'évolution. Aujourd'hui rattaché au bloc A "Aujourd'hui" de Sprint 36.G.
- **Action proposée Phase 2 :** Conserver — composant de bas niveau qui pourra servir à la Roadmap. Renommer si besoin pour clarifier la cible.

### `components/layouts/SplitBrief.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1 (pas de split 40/60 sur Aujourd'hui), §3.2 (autres pages = sub-sidebar 260px + content).
- **Constat factuel :** Wrapper 40/60. Utilisé sur Aujourd'hui (à dégager) ET sur Programme et autres (à dégager aussi).
- **Écart constaté :** Le pattern Split Brief n'est plus la cible V2.0. La nouvelle grammaire = sub-sidebar fixe 260px + content pane variable.
- **Action proposée Phase 2 :** Garder le composant **temporairement** pour limiter la casse, mais le marquer comme **deprecated** dans son commentaire d'en-tête. Migration progressive Sprint 41+. Backup pas nécessaire (toujours dans git).

### `components/split-brief/SplitBrief.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** idem.
- **Constat factuel :** Doublon avec `components/layouts/SplitBrief.tsx` (à vérifier).
- **Écart constaté :** Doublon à clarifier.
- **Action proposée Phase 2 :** Investiguer + supprimer le moins utilisé. `proposed-deletions.md`.

### `app/(dev)/dev/split-brief/page.tsx` + `SplitBriefDemoClient.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `01-ARCHITECTURE.md` §8 structure du repo — pas de section `(dev)` dans la doctrine. `00-MASTER.md` "Server Components par défaut, Pas de configuration laborieuse".
- **Constat factuel :** Route demo dev pour expérimenter le Split Brief.
- **Écart constaté :** Route dev exposée en prod = anti-pilier Apple #6 Uncompromising Polish.
- **Action proposée Phase 2 :** Supprimer toute la section `app/(dev)/`. Backup vers `archive/v1-leftovers/dev/`.

### `components/jalons/JalonHero.tsx` + `components/jalons/JalonGuardDialog.tsx` + `lib/jalons/check-jalons.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Méthode pédagogique 4 mois (V60-pre)" abandonnée. `00-CONCEPT.md` §3 anti-référence "Pas de métriques inventées qui simulent un contrôle (Cohérence/Équilibre/Densité/Profondeur sont retirées du produit)." `10-SACRED.md` "Pas de gamification, jamais. Pas de streaks, pas de badges, pas de XP, pas de quêtes."
- **Constat factuel :** Système de "jalons fondations" qui force Floriane à compléter les fondations Ma Marque en N étapes avant d'accéder à des fonctionnalités avancées. Bandeau hero + dialog de garde.
- **Écart constaté :** Mécanique de progression forcée = gamification soft. Contredit "tranquillité du pilote". Floriane sait ce qu'elle a à faire, elle n'a pas besoin d'un sas obligatoire.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/jalons/`. Supprimer aussi tous les usages dans page.tsx, MarqueGroup.tsx, etc.

### `lib/aujourd-hui/load-data.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.1, `04-MULTI_TENANT.md` (RLS).
- **Constat factuel :** Charge posts du jour, alerts, brand, jalons.
- **Écart constaté :** Le chargement de `jalons` ne sera plus utile une fois `components/jalons/` supprimé. Reste à valider que le helper utilise bien `createClient()` côté serveur (pas `createAdmin`).
- **Action proposée Phase 2 :** Retirer la branche jalons. Auditer createAdmin (cf. §10-transverse §1).

### `lib/aujourd-hui/compute-stats.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §3 anti-référence "Pas de métriques inventées".
- **Constat factuel :** Calcule des stats sur les posts du jour.
- **Écart constaté :** Le mot "stats" et la nature même du fichier sont à examiner — si stats = "combien de posts", on garde ; si stats = "score d'engagement / cohérence", on retire.
- **Action proposée Phase 2 :** Investiguer le contenu Sprint 41, refactoriser ou supprimer.

### `lib/aujourd-hui/dates-fr.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `03-VOICE_SHEET.md` §2 sentence case + français.
- **Constat factuel :** Formatage de dates FR (`jourCourantFr`, `nomDuJourFr`, `semaineRangeFr`).
- **Écart constaté :** Aucun.
- **Action proposée Phase 2 :** Aucune.

### `lib/aujourd-hui/suggestions.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2 "Suggestions semaine : Hélène M. génère trois suggestions."
- **Constat factuel :** Calcule des suggestions de la semaine côté serveur.
- **Écart constaté :** À déplacer vers Mon Programme dans la cible V2.0 (les suggestions ne vivent pas sur Aujourd'hui).
- **Action proposée Phase 2 :** Refactor — déplacer vers `lib/mon-programme/suggestions.ts` après création du module.

### `components/jalons/*` (déjà couvert ci-dessus)

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel]** — les 10 HTML Claude Design ne sont pas disponibles dans le repo.

La doctrine écrite couvre cependant l'essentiel :

- **Sidebar globale** visible uniquement ici : `01-ARCHITECTURE.md` §2.1 décrit exactement les 8 destinations groupées en TRAVAIL / ÉDITORIAL + 2 icônes système Compte/Aide. Aucun composant actuel ne correspond.
- **Page-header canonique** : `01-ARCHITECTURE.md` §3.3 décrit le pattern sticky transparent avec breadcrumb désactivé sur Aujourd'hui, H1 + date, avatar trailing. `PageHeader.tsx` existant à auditer Sprint 41.
- **Wallpaper saturated** : `01-ARCHITECTURE.md` §3.4 "Halos colorés (bleu CF, lilas, indigo, orange) animés en `drift` 18-30s. Réservé à Aujourd'hui uniquement." Le code actuel utilise `bg-halo` 1-5 dans `app/(outils)/outils/page.tsx` aussi — incohérence (cf. §10-transverse §3).
- **Densité α stricte minimale** : 3 widgets + 1 Roadmap. Le code actuel a un Split Brief 6 zones + jalon hero.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 2 |
| À refactorer | 10 |
| Recalés | 4 |
| Total fichiers Aujourd'hui audités | 16 |

Détail Recalés :
1. `components/today/DemarrerCard.tsx`
2. `components/jalons/JalonHero.tsx`
3. `components/jalons/JalonGuardDialog.tsx` (lié)
4. `app/(dev)/dev/split-brief/*` (+ deux fichiers internes)

Détail Validés :
1. `app/(aujourd-hui)/layout.tsx`
2. `lib/aujourd-hui/dates-fr.ts`

---

## 5. Recommandation pour Phase 2

**Phase 2 — actions structurantes sur la page Aujourd'hui :**

1. **Supprimer** (avec validation Lead via `proposed-deletions.md`) :
   - `components/jalons/JalonHero.tsx`
   - `components/jalons/JalonGuardDialog.tsx`
   - `lib/jalons/check-jalons.ts`
   - `components/today/DemarrerCard.tsx`
   - `app/(dev)/dev/split-brief/page.tsx`
   - `app/(dev)/dev/split-brief/SplitBriefDemoClient.tsx`
   - `app/(dev)/layout.tsx` (si plus aucun usage `(dev)`)

2. **Refactor automatiques** (modifications ciblées sans validation individuelle) :
   - Retirer toute mention du Sprint 36.G "Split Brief 40/60" du commentaire d'en-tête de `page.tsx`.
   - Retirer le bloc "État du programme" et "État de Ma Marque" qui simulent un contrôle métrique.
   - Retirer les imports/usages de `JalonHero`, `DemarrerCard`, `checkJalonStatus`.
   - Marquer `components/layouts/SplitBrief.tsx` comme `@deprecated` dans son commentaire (sans le supprimer car utilisé partout).

3. **Hors scope Sprint 40 — laissé à Sprint 43+** :
   - Création de la sidebar globale 8 dest groupées + 2 icônes système.
   - Création des 3 widgets Calendrier · Rappels · Messages.
   - Création de la Roadmap "X étapes pour aujourd'hui" orchestrée par Hélène.
   - Création des routes `/calendrier`, `/rappels`, `/bibliotheque`, `/messages` au top-level.

Sprint 40 = **purger ce qui contredit la doctrine V2.0**. La reconstruction des écrans cibles est un sprint séparé.

---

## 6. Cible doctrinale V2.0 — spec détaillée pour Sprint 43+

### 6.1 Layout canonique du hub (lecture mot à mot de `01-ARCHITECTURE.md` §3.1)

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

Densité **α stricte minimale** :
- Trois widgets visibles uniquement.
- Un bloc Roadmap.
- Pas d'État du programme. Pas de KPIs Cohérence/Équilibre/Densité/Profondeur. Aucune métrique inventée.
- Pas de Dernière activité.

### 6.2 Composition de la sidebar globale

`01-ARCHITECTURE.md` §2.1 :

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

- Eyebrows TRAVAIL/ÉDITORIAL : `11px / 600 / uppercase / letter-spacing 0.08em / color rgba(60,60,67,0.45)`.
- Pas de séparateur visuel agressif entre les sections.
- Icônes Compte + Aide en bas, sur une seule ligne, sans label.

### 6.3 Spec des 3 widgets

#### Widget Calendrier
- Aperçu compact de la semaine en cours (5-7 publications à venir).
- Date prochain post + heure.
- Cliquer → renvoie à `/calendrier` (top-level).

#### Widget Rappels
- 3-5 rappels non complétés du jour ou du lendemain.
- Échéance en retard → rouge `#FF3B30`.
- Cliquer → renvoie à `/rappels`.

#### Widget Messages
- Dernier message d'Hélène (si non lu).
- Conversation active si Floriane est en cours d'échange.
- Compteur de messages non lus discret.
- Cliquer → renvoie à `/messages` avec Hélène pinned.

### 6.4 Spec de la Roadmap orchestrée par Hélène

`01-ARCHITECTURE.md` §3.1 + `02-EXPERTS.md` §2 :

- Bloc unique en bas du content pane.
- Titre : "Aujourd'hui, voici ton parcours" ou similaire (sentence case, pas d'exclamation).
- **3 à 10 étapes** selon la charge réelle du jour (Hélène décide).
- Chaque étape = `<TaskRow>` (composant déjà existant — réutilisable depuis `components/today/TaskRow.tsx`).
- Hélène signature visible : "Préparé par Hélène M. à 7:42" en bas.
- Chaque étape peut être cliquée → ouvre le contexte pertinent (post à préparer, conversation à reprendre, calendrier à consulter).

### 6.5 Wallpaper saturated (le seul endroit autorisé)

`01-ARCHITECTURE.md` §3.4 :

- Halos colorés (bleu CF, lilas, indigo, orange) animés en `drift` 18-30s.
- Réservé à Aujourd'hui uniquement.
- `prefers-reduced-motion` désactive l'animation.
- `prefers-reduced-transparency` réduit l'opacité.

Le code actuel a `bg-halo-1..5` dans `styles/liquid-glass.css` ou `app/globals.css` — implémentation conforme.

### 6.6 Page-header canonique sur Aujourd'hui

`01-ARCHITECTURE.md` §3.3 :

- Sticky en haut, fond transparent.
- Padding vertical 24px ouvert, 12px compacté au scroll (classe `is-scrolled`).
- **Breadcrumb désactivé sur Aujourd'hui** (c'est le hub, pas de fil retour).
- H1 = "Aujourd'hui".
- Sous-titre = date au format français long (`vendredi 21 mai 2026`).
- Avatar utilisateur trailing à droite, niveau ligne H1.

### 6.7 Reconstruction depuis le HTML Aujourd'hui v3 Claude Design

Le HTML "Aujourd'hui v3" mentionné en brief §1 est la **source visuelle de référence** pour Sprint 43+. Sa lecture pixel-près permettra de :
- Caler les positions exactes des widgets (gap, sizes, alignment).
- Caler le visuel Liquid Glass z2 sur les cards widgets.
- Caler les animations de drift des halos.
- Caler la typo SF Pro Display H1 + sous-titre.

**Sprint 40 ne touche pas à cette reconstruction.** Il prépare en supprimant le legacy (DemarrerCard, JalonHero, etc.) et en marquant `@deprecated` Split Brief.
