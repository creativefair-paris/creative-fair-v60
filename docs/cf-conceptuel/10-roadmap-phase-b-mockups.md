# 10-ROADMAP-PHASE-B-MOCKUPS — Plan de production

**Date** : 17 mai 2026  
**Branche** : `cf-conceptuel-0`  
**Objet** : Plan de production des mockups HTML phase B après les pivots conceptuels majeurs de la session du 16-17 mai.  
**Cible** : Tous les mockups validés visuellement par Lead avant Sprint 39 (implémentation).

---

## 1. État brut au 17 mai 2026

### Mockups vague 1 produits (~5h de travail)

| # | Mockup | État après pivots | Action |
|---|---|---|---|
| 01 | Aujourd'hui v2 | ❌ Obsolète | Refonte v3 (dock + widget Messages) |
| 02 | Mon Programme v1 (Calendar style) | ❌ Obsolète total | Refaire style Apple Santé |
| 03 | Conseiller v1 | ❌ Obsolète | Transformer en Messages |
| 04 | Bibliothèque v2 | ✅ Survit | Pas impactée |
| 05 | Ma Marque v1 | ⚠️ À ajuster | Sortir Équipe + Facturation vers Compte |

**Bilan brut** : 60% du travail mockup vague 1 doit être refait.  
**Bilan honnête** : c'est normal et même salutaire — la matière conceptuelle est infiniment meilleure maintenant.

### Mockups à créer (vague 2 + 3)

| # | Mockup | App référente | Statut |
|---|---|---|---|
| 01 | Aujourd'hui v3 | Home Screen iPadOS 26 | À créer |
| 02 | Mon Programme v2 | Apple Santé | À créer |
| 03 | Messages | iMessage + Contacts | À créer |
| 04 | Bibliothèque v2 | Apple Photos | ✅ Fait |
| 05 | Ma Marque v2 | Apple Settings (avancé) | À ajuster |
| 06 | Compte | Apple Settings (général) | À créer |
| 07 | Calendrier | Apple Calendar | À créer |
| 08 | Rappels | Apple Reminders | À créer |
| 09 | Brief (sous-section Ma Marque) | Apple Notes | À créer |
| 10 | Post Creator | Hybride Notes/Pages/Instagram | V1.5 detail |

**Total mockups à produire/refondre** : 9 + 1 V1.5 = 10 mockups.

---

## 2. Stratégie d'ordonnancement

### Critère principal — Différenciation produit

Mocker en premier les apps les plus **différenciantes** de CF (celles qui définissent la catégorie de produit nouvelle). Si elles sont visuellement convaincantes, le reste tombe en cohérence.

### Ordre recommandé (3 vagues)

**Vague 2A — Le cœur différenciant (P0 — semaine 1)**
1. **Mon Programme v2** (Apple Santé) — pivot le plus important, définit la catégorie produit
2. **Messages** (iMessage + Contacts intégré) — agence virtuelle, deuxième différenciant
3. **Aujourd'hui v3** (Home Screen) — point d'entrée, dépend des deux précédents pour le widget Messages

**Vague 2B — Les apps système du dock (P1 — semaine 2)**
4. **Calendrier** (Apple Calendar) — app dock
5. **Rappels** (Apple Reminders) — app dock  
6. **Compte** (Apple Settings général) — app dock

**Vague 2C — Apps métier et profondeur (P2 — semaine 3)**
7. **Ma Marque v2** (Apple Settings avancé) — refonte (ajustement)
8. **Brief** (Apple Notes pinned) — sous-section Ma Marque
9. **Post Creator** (hybride) — pour validation V1.5 architecture

---

## 3. Spécifications par mockup

### Mockup 01 — Aujourd'hui v3

**Source de réfacence** : Home Screen iPadOS 26  
**Doc référence** : `06-anatomie-ipados-26-liquid-glass.md` §3-4-6  
**Estimation** : 3h  
**Priorité** : P0

**Contenu** :
- Status bar iPadOS top
- Header personnalisé "Bonjour Floriane" + avatar
- Grille principale :
  - 3 widgets (Calendrier Large, Rappels Large, Messages Medium avec Hélène pinned)
  - 4 apps métier (Mon Programme, Bibliothèque, Ma Marque, Dossier Mes Outils)
  - Bandeau Doctrine du jour (citation depuis Brief)
- Dock Liquid Glass bottom avec 4 apps système (Compte, Calendrier, Rappels, Messages)
- Wallpaper crème CF default (avec gradients méchés)
- Bouton home (en bas centre — pattern Aujourd'hui v2)

**Différenciants à montrer visuellement** :
- Le dock distinct de la grille (séparation système vs métier)
- Le widget Messages avec Hélène pinned en haut (différenciateur)
- Le bandeau Doctrine en bas (CF signature)

---

### Mockup 02 — Mon Programme v2

**Source de référence** : Apple Santé  
**Doc référence** : `07-apps-apple-referentes.md` §1  
**Estimation** : 4h  
**Priorité** : P0 — **MOCKUP LE PLUS IMPORTANT**

**Contenu** :
- Sidebar gauche figée avec sections (Aperçu, Stratégie, Plan, Performance, Cohérence)
- Header sticky : "Mon Programme" + dernière analyse + avatar
- Section "Épinglés" — grille 2×2 avec 4 indicateurs vitaux :
  - Cohérence éditoriale (87/100, sparkline 30j)
  - Équilibre piliers (●●●●○, distribution)
  - Densité éditoriale (Régulière, sparkline)
  - Profondeur de matière (3.2×, tendance ▲)
- Section "Tendances" — narration audit du jour + recommandations actionables
- Section "Parcourir" — liste de catégories avec icônes colorées
- Section "Suggestions pour cette semaine" — cards avec boutons "Ajouter au Calendrier" / "Ajouter aux Rappels"
- Bottom search bar Liquid Glass (pattern unifié)

**Différenciants à montrer** :
- Les 4 indicateurs vitaux (différenciation hard avec autres SaaS)
- L'audit narratif (preuve d'intelligence éditoriale)
- Les suggestions actionables (interconnexion modules)

---

### Mockup 03 — Messages

**Source de référence** : iMessage + Contacts (fusionnés)  
**Doc référence** : `07-apps-apple-referentes.md` §4  
**Estimation** : 4h  
**Priorité** : P0

**Contenu** :
- Sidebar gauche (340px) figée avec :
  - Search bar top
  - Section "Épinglés" — grille cercles avatars (Hélène M. en premier, gradient lilas→indigo)
  - Section "Conversations" — liste avec avatars 44px + nom + preview + time
  - Section "Groupes" — conversations multi-doyens
  - Lien "Tous les contacts" en bas → ouvre vue Contacts
- Thread principal :
  - Header avec avatar + nom doyen + status (online/typing)
  - Bulles bleues (me) et blanches (Hélène)
  - Day separator
  - Message Hélène avec quick replies suggérées en dessous
  - Bouton "→ Ouvrir dans Post Creator" sous certaines bulles
- Composer bottom : input arrondi + send circulaire bleu + bouton "+"
- Variante : background personnalisé sur conversation

**Différenciants à montrer** :
- Hélène pinned système (différenciant majeur)
- Quick replies suggérées sous chaque message (CF signature)
- Bouton "Ouvrir dans Post Creator" (flux 1)

---

### Mockup 03bis — Contacts (sub-app de Messages)

**Source de référence** : Apple Contacts (3 panes)  
**Estimation** : 2h (peut être combiné avec Messages)  
**Priorité** : P0

**Contenu** :
- Three-pane layout iPad :
  - Pane 1 (220px) : listes ("Tous", "Doyens IA", "Mon Équipe humaine", "Collaborateurs externes")
  - Pane 2 (280px) : liste alphabétique des contacts avec section letters
  - Pane 3 (flex) : fiche détail du contact sélectionné
- Fiche détail doyen :
  - Avatar gradient grande taille
  - Nom + titre
  - Boutons "Message" / "Demander un avis"
  - Section "Spécialités" (tags)
  - Section "Bio"
  - Section "À solliciter quand..."
  - Section "Conversations récentes" (liens)
- Fiche détail humain :
  - Photo + nom + rôle CF (Owner/Editor/Viewer) + titre métier
  - Boutons "Message" / "Email"
  - Section "Permissions"
  - Section "Activité récente"

---

### Mockup 04 — Bibliothèque v2 ✅

**Statut** : déjà fait, validé visuellement (sauf images picsum qui chargent chez Ulysse)  
**Pas d'action**.

---

### Mockup 05 — Ma Marque v2

**Source de référence** : Apple Settings (avancé)  
**Estimation** : 2h (ajustement)  
**Priorité** : P1

**Action** : reprendre `05-ma-marque.html` existant et :
- **Sortir** les sections Équipe + Facturation (qui vont vers Compte)
- **Garder** les sections Identité / Voix / Visuel / Piliers / Brief / Audiences / Concurrents / Partenaires
- **Ajouter** section Wallpaper marque (upload, gradients, default)
- **Garder** layout sidebar Liquid Glass + hero card marque + cells iOS

---

### Mockup 06 — Compte

**Source de référence** : Apple Settings (général) — Apple ID page  
**Doc référence** : `07-apps-apple-referentes.md` §5  
**Estimation** : 2.5h  
**Priorité** : P1

**Contenu** :
- Sidebar gauche figée avec :
  - Hero card "Floriane Martin · Brand Manager" (avatar + nom)
  - Search bar
  - Sections : Profil / Équipe / Facturation / Notifications / Sécurité / Confidentialité / Préférences app / Aide
- Content pane droite :
  - Section ouverte par défaut : Profil
  - Cells avec icônes carrées colorées + label + value + chevron
- Page Équipe (cas spécial) :
  - Liste membres du tenant avec photo + rôle dropdown
  - Bouton "Inviter un membre"
  - Toggle "Mode revue éditoriale" (Owner only)

---

### Mockup 07 — Calendrier

**Source de référence** : Apple Calendar  
**Doc référence** : `07-apps-apple-referentes.md` §2  
**Estimation** : 3h  
**Priorité** : P1

**Contenu** :
- Sidebar gauche figée avec :
  - Search bar
  - Section "Mes calendriers" : Publications 🔵 / Business 🟣 / Échéances 🟠 (chacun avec checkbox circulaire colorée + count)
  - Section "Calendriers externes" : Google Calendar / Outlook (toggle)
- Toolbar haute :
  - Segmented control Day / Week / Month / Year
  - Flèches navigation
  - Bouton "Aujourd'hui"
  - Bouton "+"
- Vue Week :
  - Colonne heures (60px gauche)
  - 7 colonnes jours
  - Events colorés selon calendrier
  - Today highlighted en bleu
  - Hour cursor (ligne rouge)
- Variante events spéciaux Publications : mini-thumbnail Instagram preview + badge statut

---

### Mockup 08 — Rappels

**Source de référence** : Apple Reminders  
**Doc référence** : `07-apps-apple-referentes.md` §3  
**Estimation** : 2.5h  
**Priorité** : P1

**Contenu** :
- Sidebar gauche figée avec :
  - Search bar
  - Grille Smart Lists (4 cards colorées : Aujourd'hui 🔴 / Programmé 🔵 / Tout ⚫ / Drapeau 🟠)
  - Section "Mes Listes" : Publications, Briefs, Validation, Idées en réserve
  - Section "Tags" : pills cliquables
- Content pane :
  - Section ouverte : "Aujourd'hui"
  - Tâches groupées par sections temporelles (Matin / Après-midi)
  - Chaque tâche : checkbox circulaire + texte + meta (date, source, list)
  - Tâches avec badge "Suggéré par Mon Programme"
- Vue alternative Kanban (Columns) sur la liste "Validation"

---

### Mockup 09 — Brief (sous-section Ma Marque)

**Source de référence** : Apple Notes pinned  
**Doc référence** : `07-apps-apple-referentes.md` §7  
**Estimation** : 1.5h  
**Priorité** : P2

**Contenu** :
- Note pinned unique (pas de sidebar de notes multiples)
- Header : "📌 Brief épinglé · Carlo Sarrabezolles" + "Modifié le 12 mai 2026"
- Bouton "Modifier" top-right
- Body markdown rendu :
  - H1 Doctrine éditoriale
  - H2 Positionnement / Promesse / Ton de voix / Piliers narratifs / Citation anchor
  - Listes et blockquotes stylés
- Floating toolbar bottom (visible en mode édition) : titres, listes, checkboxes, image

---

### Mockup 10 — Post Creator (V1.5 detail)

**Source de référence** : Hybride Apple Notes + Pages + Instagram preview  
**Estimation** : 4h  
**Priorité** : P2 (V1.5)

**Contenu (à formaliser plus tard avec Lead)** :
- Sidebar gauche : templates par pilier
- Canvas central : éditeur avec preview Instagram inline
- Inspector panel droite : visuel, hashtags, programmation, alt-text, pilier, etc.
- Header avec breadcrumb (si depuis Messages : "Retour à conv Hélène")

---

## 4. Standards techniques pour les mockups

### Outils
- **HTML statique** dans `/home/claude/mockups/` avec :
  - `cf-tokens.css` partagé (palette, typo, espacements)
  - 1 fichier `.html` par mockup
  - `index.html` navigateur entre mockups
- **Playwright** pour screenshots automatisés (1440×900 retina dans `screenshots/`)
- **Pas de framework** (pas de React/Vue) — HTML/CSS/JS vanilla pour validation visuelle pure

### Conventions
- Tous les mockups commencent par :
  ```html
  <link rel="stylesheet" href="cf-tokens.css">
  <div class="wallpaper"></div>
  <div class="statusbar">...</div>
  ```
- Bouton "Index mockups" en **bas centre** (cohérent toutes apps)
- Wallpaper crème CF default sur tous les mockups (sauf Aujourd'hui qui peut tester variantes)
- Sidebar figée à 240-340px selon app
- Bottom search bar Liquid Glass sur Bibliothèque + Messages + Rappels + Contacts

### Validation visuelle
- Capture screenshot via Playwright
- Review visuelle Lead (Ulysse) → verdict binaire **Validé / Recalé**
- Si Recalé : feedback ciblé, refonte
- Stockage des screenshots dans `screenshots/<mockup-name>-viewport.png`

---

## 5. Estimation totale

| Vague | Mockups | Estimation cumul |
|---|---|---|
| 2A (différenciants P0) | Mon Programme + Messages + Aujourd'hui v3 | 11h |
| 2B (système P1) | Compte + Calendrier + Rappels | 8h |
| 2C (métier P2) | Ma Marque v2 + Brief + Post Creator | 7.5h |
| **Total** | **9 mockups** | **~26h** |

Si Ulysse veut accélérer : sauter Post Creator en vague 2C (V1.5 detail séparé) → 22.5h.

---

## 6. Ordre de validation recommandé

Pour valider efficacement sans gaspiller de temps :

1. **Phase A** — Mocker Mon Programme + Messages d'abord (les 2 différenciants)
2. **Pause review Lead** : valider que le pivot conceptuel est convaincant visuellement
3. **Si Validé** : continuer vague 2B et 2C
4. **Si Recalé** : ajustements ciblés sur ces 2 mockups avant d'avancer

C'est plus économe que de mocker tout et risquer de devoir tout refaire.

---

## 7. Décisions design transverses validées (rappel)

| Décision | État |
|---|---|
| `backdrop-filter: blur()` poussé (3 niveaux z1/z2/z3) | ✅ Validé |
| Wallpaper personnalisable par tenant | ✅ Validé |
| Wallpaper teinte sidebars de toutes les apps | ✅ Validé |
| Navigation Next.js fade (pas zoom iPadOS) | ✅ Validé |
| Widgets interactifs V1.5 (cocher rappel, deep-link) | ✅ Validé |
| Dock 4 apps : Compte, Calendrier, Rappels, Messages | ✅ Validé |
| Un seul écran d'accueil figé | ✅ Validé |
| Sidebar figée dans toutes les apps | ✅ Validé |
| Pattern unifié toutes apps (tab bars, search, etc.) | ✅ Validé |
| Memories/Souvenirs Bibliothèque activés V1.5 | ✅ Validé |
| Hélène pinned système (non détachable) | ✅ Validé |
| Pinned conversations Messages : max 9 | ✅ Validé |
| Contacts intégré dans Messages (sub-app) | ✅ Validé |
| Bottom search bar Liquid Glass dans toutes les apps | ✅ Validé |

---

## 8. Risques et points d'attention

### Risque 1 — Performance Liquid Glass
Trop de `backdrop-filter` simultanés = GPU saturé. À tester sur iPad Air baseline.  
**Mitigation** : max 3 panels Liquid Glass actifs sur viewport.

### Risque 2 — Lisibilité Liquid Glass clear
Le texte peut être illisible si wallpaper trop contrasté.  
**Mitigation** : mode "Tinted" par défaut (opacité 0.55-0.72), test light + dark.

### Risque 3 — Apple-like sans plagiat
Risque juridique de copie trop littérale (icônes, palette identité).  
**Mitigation** : **mimétisme conceptuel** OK (patterns, layouts), **plagiat visuel** non (icônes propres CF, palette CF v60).

### Risque 4 — Sur-design vs fonctionnel
Tentation de pousser les détails Liquid Glass au point d'ajouter du bruit.  
**Mitigation** : **subtraction-first**, retirer tout ce qui n'est pas indispensable.

### Risque 5 — Disparité entre mockups
Si chaque mockup est créé indépendamment, risque d'incohérences.  
**Mitigation** : `cf-tokens.css` partagé strict, statusbar + dock + bottom search bar identiques partout.

---

## 9. Workflow de production

```
[Ulysse Lead] dit "go" sur un mockup
       │
       ▼
[Claude Opus 4.7] code le mockup HTML/CSS/JS
       │
       ▼
[Playwright] capture screenshot 1440x900
       │
       ▼
[Claude] présente le screenshot + fichier HTML via present_files
       │
       ▼
[Ulysse Lead] review visuelle → Validé / Recalé
       │
       ├── Validé → suivant
       │
       └── Recalé → feedback ciblé → Claude refond → retour étape Playwright
```

---

## 10. Livrables phase B complète

### Fichiers attendus dans `/mnt/user-data/outputs/mockups/`
- `cf-tokens.css` (existant)
- `index.html` (navigateur entre mockups)
- `01-aujourd-hui.html` v3 (refondu)
- `02-mon-programme.html` v2 (refait Apple Santé)
- `03-messages.html` (nouveau)
- `03bis-contacts.html` (nouveau, sub-app)
- `04-bibliotheque.html` v2 (existant)
- `05-ma-marque.html` v2 (ajusté)
- `06-compte.html` (nouveau)
- `07-calendrier.html` (nouveau)
- `08-rappels.html` (nouveau)
- `09-brief.html` (nouveau, sous-section Ma Marque)
- `10-post-creator.html` (nouveau, V1.5 detail)

### Screenshots dans `screenshots/`
Un screenshot 1440×900 retina par mockup.

### Doc final de phase B
Après validation tous mockups par Lead : `11-phase-b-validation-finale.md` qui résume :
- Tous les mockups validés
- Captures d'écran
- Verdict Lead pour chaque
- Spécifications techniques implémentation Sprint 39+

---

**FIN DOCUMENT 10-ROADMAP-PHASE-B-MOCKUPS.md**
