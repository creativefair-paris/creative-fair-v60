# Page : /outils/messages

## Métadonnées
- Route : `/outils/messages`
- Fichier source : `app/(outils)/outils/messages/page.tsx` (118 lignes)
- Composants liés : aucun composant dédié — la page rend inline une carte placeholder velvet + un lien vers `/outils/conseiller`. Pas de mockup catalogue dédié (`ToolMockup.tsx` ne handle pas `'messages'` — il faudra ajouter le case si la page passe à V1).
- Server / Client : Server Component (auth + redirect /login). Aucune interaction.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise)

## Lecture rapide
Page placeholder doctrine V1 : "Cet outil arrive bientôt." Vise la gestion des DM Instagram + commentaires (Doc 09 §5 scénario B5), reportée V2 avec l'intégration API Meta. La page tient le pattern doctrine v60 (auth + halos + PageHeader + breadcrumb + carte velvet + CTA fallback conseiller) et c'est exactement ce que Moodboard et Variations devraient devenir.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(outils)/outils/messages/page.tsx:25` — `background: var(--color-background)` ✅.
2. `app/(outils)/outils/messages/page.tsx:27-29` — 3 halos statiques (`bg-halo-1`, `bg-halo-2`, `bg-halo-3`). **Incohérence quantité** : bibliothèque + reviews utilisent 5 halos, messages en utilise 3. À uniformiser.
3. `app/(outils)/outils/messages/page.tsx:40-43` — PageHeader avec subtitle "DM et commentaires Instagram" et breadcrumb 3 niveaux.
4. `app/(outils)/outils/messages/page.tsx:54` — `maxWidth: 640` sur la section. Lecture confortable.
5. `app/(outils)/outils/messages/page.tsx:57-66` — carte placeholder : `className="glass-thin"`, `border-radius 16`, `padding 24px 26px`, `border 1px solid var(--color-separator)`. Tokens v60 ✅.
6. `app/(outils)/outils/messages/page.tsx:69-77` — `<h2>` font-size 18 + font-weight 600. Hiérarchie typo OK.
7. `app/(outils)/outils/messages/page.tsx:80-91` — `<p>` font-size 15 + line-height 1.6 + color secondary-label. Lisible.
8. `app/(outils)/outils/messages/page.tsx:95-103` — `<p>` font-size 13 + color tertiary-label : helper text avec lien vers Conseiller.
9. `app/(outils)/outils/messages/page.tsx:108` — `color: '#007AFF'` hardcoded pour le lien. Pas le token `var(--color-systemBlue)` ou similaire. Mais c'est le bleu CF officiel. Acceptable mais à tokeniser.
10. Aucun Liquid Glass z2/z3, juste `glass-thin` z1. Cohérent avec une page passive.
11. Aucune animation, aucune transition (rien à animer). ✅
12. Aucune trace de `#1F4937`. ✅
13. Aucun touch target interactif sauf le lien "Conseiller" — qui est inline texte (touch target dépend du `<Link>` rendu, généralement < 44 px en inline). Acceptable car c'est un lien tertiaire dans une phrase.
14. `app/(outils)/outils/messages/page.tsx:53` — `gap: 16` entre les deux éléments du `<section>`. Espacement système.
15. Aucun fond hardcodé hors `var(--color-background)`. ✅

### Verdict : **Validé**

### Justification
La page est conforme au pattern doctrine v60 : tokens crème, halos statiques, glass-thin sobre, hiérarchie typo correcte. La seule incohérence mineure est l'usage de 3 halos là où les autres pages outils en utilisent 5 — facile à corriger. Le lien `#007AFF` hardcoded est le bleu officiel CF, mais devrait passer par un token pour cohérence avec le design system.

### Recommandations
- **P2** : Aligner sur 5 halos (bg-halo-1 à 5) comme bibliothèque/reviews (`page.tsx:27-29`).
- **P2** : Remplacer `color: '#007AFF'` hardcoded par `var(--color-systemBlue)` ou un token équivalent (`page.tsx:108`).

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/messages/page.tsx:13` — `export const dynamic = 'force-dynamic'` ✅ (auth).
2. `app/(outils)/outils/messages/page.tsx:16-20` — auth check + redirect /login. ✅
3. Server Component pur (pas de `'use client'`, pas de hook). Trivial.
4. Aucune Server Action (rien à écrire).
5. Aucune query (rien à lire).
6. Aucune table DB référencée. Cohérent avec "reporté V2 API Meta".
7. Commentaire en-tête (lignes 1-6) explicite : "Reporté V2 avec l'intégration API Meta. Cette page place l'entrée dans /outils pour que le pilote sache qu'elle arrive, sans mock trompeur". Doctrine "subtraction over addition" + "pas de mensonge visuel" respectée.
8. `app/(outils)/outils/messages/page.tsx:8` — import `Link` next/link. ✅
9. Pas de hook dans Server. ✅
10. Pas de RLS car pas de data. Trivial.
11. `app/(outils)/outils/messages/page.tsx:107-111` — `<Link>` interne vers `/outils/conseiller`. Navigation Next-native. ✅
12. **Préparation V2 API Meta** : à anticiper schéma DB `instagram_dms`, `instagram_comments`, `tenant_id`, RLS. Aucune dette de stub orphelin pour l'instant.

### Verdict : **Validé**

### Justification
Code minimal, propre, sans surface d'attaque. Le commentaire d'en-tête explicite le pourquoi du placeholder (refus du mock trompeur). Auth respectée, séparation Server pure, navigation propre.

### Recommandations
- **P1** : Anticiper le schéma DB V2 (`instagram_dms`, `instagram_comments` avec `tenant_id`, RLS) dans la doc avant l'intégration API Meta.
- **P2** : Documenter le contrat OAuth Meta + scopes nécessaires (`instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`) en commentaire pour préparer V2.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(outils)/outils/messages/page.tsx:41` — titre "Messages" ✅ FR, sobre.
2. `app/(outils)/outils/messages/page.tsx:42` — subtitle "DM et commentaires Instagram". "DM" est un anglicisme adopté (direct message). Précis et utile.
3. `app/(outils)/outils/messages/page.tsx:43` — breadcrumb `{ label: 'Outils', href: '/outils' }`. **Pas de possessif "Mes Outils"**. Même incohérence que Bibliothèque + Reviews.
4. `app/(outils)/outils/messages/page.tsx:78` — "Cet outil arrive bientôt." Voix Floriane parfaite ✅.
5. `app/(outils)/outils/messages/page.tsx:89-91` — "Il te permettra de gérer tes DM clients et commentaires Instagram avec l'aide du conseiller, sans quitter Creative Fair." Tutoiement direct ✅. "Conseiller" minuscule ✅. Voix Floriane chaleureuse.
6. `app/(outils)/outils/messages/page.tsx:105-111` — "En attendant, tu peux poser une question au conseiller depuis Conseiller." Tutoiement ✅. "Conseiller" capitalisé en lien : incohérent avec "conseiller" minuscule dans la phrase précédente (ligne 91). À uniformiser.
7. Aucun vocabulaire interdit : pas de "users", "audience", "dashboard", "workflow", "viral", "boost", "engagement", "métrique", "KPI", "stats", "analytics".
8. Mention "Creative Fair" (ligne 91) : nom propre du produit, OK.
9. "Conseiller" capitalisé comme NOM DU PRODUIT vs "conseiller" minuscule comme RÔLE FONCTION : la doctrine impose "conseiller minuscule en UI". Donc ligne 110 devrait être "conseiller" minuscule (`<Link href="/outils/conseiller">conseiller</Link>`).

### Verdict : **Recalé partiel**

### Justification
Voix Floriane impeccable, tutoiement systématique, ton chaleureux ("sans quitter Creative Fair"). Deux fautes : (1) breadcrumb sans "Mes Outils" (défaut récurrent), (2) "Conseiller" capitalisé en lien (ligne 110) contredit la doctrine "conseiller minuscule en UI" appliquée correctement ligne 91.

### Recommandations
- **P0** : Remplacer `{ label: 'Outils' }` par `{ label: 'Mes Outils' }` dans breadcrumb (`page.tsx:43`).
- **P0** : Remplacer "Conseiller" capitalisé par "conseiller" minuscule dans le lien (`page.tsx:110`). Cohérence doctrine.
- **P2** : Documenter "DM" dans le glossaire doctrine comme anglicisme adopté.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. La page n'a aucune action utilisateur sauf le lien fallback vers Conseiller. Friction minimale ✅.
2. Loading state : la page est statique côté Server, pas nécessaire.
3. Error state : pas applicable.
4. Empty state : la page entière EST un empty state assumé. C'est exactement le pattern que Moodboard et Variations devraient adopter.
5. Pas de confirmation destructrice (rien à détruire).
6. Touch target : le lien "conseiller" inline texte mesure ~20 px de haut (font-size 13). **< 44 px.** Mais c'est un lien tertiaire dans une phrase, pas un CTA primaire — acceptable selon les WCAG.
7. Navigation prévisible : breadcrumb 3 niveaux + retour `/outils` + lien fallback vers `/outils/conseiller`. ✅
8. Le user qui arrive sur Messages sait : (1) ce qu'il aurait pu faire (DM + commentaires), (2) que c'est pas dispo, (3) où aller en attendant (conseiller). Workflow complet pour un état "bientôt".

### Verdict : **Validé**

### Justification
Workflow placeholder exemplaire. Le pilote n'est jamais en cul-de-sac. Le touch target inline du lien est sous 44 px mais c'est cohérent avec un lien tertiaire dans une phrase explicative — pas un CTA primaire.

### Recommandations
- **P2** : Si Sprint 38 prévoit V2 Messages, mocker le flow complet (liste conversations + thread DM + commentaires) avant de l'implémenter.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Cohérence doctrine "subtraction over addition"** : refus du mock trompeur, placeholder explicite. ✅
2. **Promesse "Il te permettra de gérer tes DM clients et commentaires Instagram avec l'aide du conseiller, sans quitter Creative Fair."** : doctrine sang-froid / TF Crise (Valentine D.) — le conseiller aide à NE PAS répondre à chaud sur les commentaires. Cohérent.
3. **Lien skill** : Messages, une fois livré, serait l'outil produit qui sert :
   - `cfs-ops-task-force` (Inès B.) — modération + community management quotidien.
   - `cfs-crise-task-force` (Valentine D.) — réponse aux commentaires sensibles avec sang-froid.
   - `cfs-conseiller` (Conseiller dans la stack) — pour rédiger les réponses.
4. **Doctrine "ne JAMAIS répondre à chaud"** : Messages doit forcer un délai/un drafting via le conseiller avant tout envoi. Ce n'est pas encore implémenté (V2) mais la promesse de la page le préfigure ("avec l'aide du conseiller").
5. **Tranquillité narrative** : le placeholder respecte la sobriété. Pas de "Bientôt ! Inscris-toi à la beta !", pas de "Stay tuned!". ✅
6. **Anti-gamification** : aucun mécanisme. ✅
7. Aucune trace de `#1F4937`. ✅
8. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : le pilote sait que Messages arrive, où aller en attendant. Doctrine.
9. **Phase 1 / Phase 2** : Messages est V2, donc post-Phase 2. Cohérent.
10. **Trilogie Organique/Outreach/Libre** : Messages opère sur l'Organique (réactions sur le feed) et l'Outreach (DM clients).
11. **Doctrine "fais cool, sois cool"** Floriane : "sans quitter Creative Fair" → promesse douce, presque casual, sans frime SaaS. ✅
12. **Refus du faux mock** : le commentaire en-tête mentionne explicitement "l'ancien mock B5 a été supprimé en F8". Subtraction over addition appliquée ✅.

### Verdict : **Validé**

### Justification
Page placeholder doctrinalement impeccable. Refus du mock trompeur, promesse douce, fallback explicite vers le conseiller (qui incarne la doctrine "réponse à froid"), ton Floriane. C'est exactement ce qu'un placeholder doit être. Hélène devrait demander à Moodboard et Variations d'imiter ce pattern.

### Recommandations
- **P1** : Servir de modèle de référence pour Moodboard et Variations (cf. audits 14 et 15).
- **P2** : Documenter dans la doctrine que ce pattern (auth + halos + PageHeader + breadcrumb + carte velvet + CTA fallback) est le placeholder standard CF v60.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ✅ Validé |
| Elena Archi | ✅ Validé |
| Sarah Copy | ❌ Recalé partiel |
| Marcus Workflow | ✅ Validé |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés

- **P0** :
  1. Remplacer `{ label: 'Outils' }` par `{ label: 'Mes Outils' }` dans breadcrumb (`page.tsx:43`).
  2. Remplacer "Conseiller" capitalisé par "conseiller" minuscule dans le lien (`page.tsx:110`). Doctrine UI.

- **P1** :
  1. Anticiper schéma DB V2 (`instagram_dms`, `instagram_comments`, RLS, `tenant_id`) en doc.
  2. Promouvoir cette page comme **modèle de placeholder doctrine** pour Moodboard + Variations.

- **P2** :
  1. Aligner sur 5 halos comme bibliothèque/reviews (`page.tsx:27-29`).
  2. Remplacer `#007AFF` hardcoded par `var(--color-systemBlue)` (`page.tsx:108`).
  3. Documenter "DM" comme anglicisme adopté.
  4. Documenter contrat OAuth Meta + scopes pour V2.
  5. Documenter le pattern placeholder dans la doctrine v60.

### Verdict global page
**Validé** — Page placeholder exemplaire. Doctrine respectée à la lettre, code minimal, UX claire, copy chaleureux. Les deux fautes (breadcrumb sans possessif + "Conseiller" capitalisé) sont des défauts cosmétiques faciles à corriger. Moodboard et Variations doivent imiter ce pattern.
