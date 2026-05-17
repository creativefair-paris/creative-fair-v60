# 05-DECISIONS-SESSION-CF.0 — Synthèse maître

**Date** : 17 mai 2026  
**Branche** : `cf-conceptuel-0`  
**Objet** : Document maître consignant **toutes les décisions** prises lors de la session de design conceptuel CF.0 du 16-17 mai 2026.  
**Ce doc remplace** : les décisions éparpillées dans 04-architecture-cf-v60-v2.md (parties obsolètes) + 04b-decisions-angles-morts.md (intégré ici).

---

## Préambule — Le saut conceptuel de cette session

Avant la session : CF était un **SaaS B2B avec un chatbot IA et des modules**.

Après la session : CF est un **système d'exploitation pour la communication éditoriale**, métaphorisé comme un iPad personnel, avec :
- Une page d'accueil iPadOS 26 Liquid Glass (apps + widgets + dock)
- Une agence de communication virtuelle (Messages avec doyens IA)
- Un système de pilotage stratégique (Mon Programme = Apple Santé)
- Un wallpaper personnalisable par marque qui teinte toute l'UI

Ce n'est plus une catégorie connue. C'est un **OS de marque**.

---

## 1. Architecture finale — La carte des apps

### Page d'accueil iPadOS 26
```
┌──────────────────────────────────────────────────────────────┐
│ ⓪ STATUS BAR (heure, signal, wifi, battery)                  │
├──────────────────────────────────────────────────────────────┤
│ Bonjour Floriane                                       [F]   │
│                                                              │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐                 │
│ │ Widget      │ │ Widget      │ │ Widget   │                 │
│ │ Calendrier  │ │ Rappels     │ │ Messages │                 │
│ │ (Large 4x4) │ │ (Large 4x4) │ │ (Hélène) │                 │
│ │             │ │             │ │ (Med 4x2)│                 │
│ └─────────────┘ └─────────────┘ └──────────┘                 │
│                                                              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────────┐                              │
│ │Mon │ │Bibl│ │ Ma │ │Dossier │                              │
│ │Prog│ │    │ │Marq│ │Outils  │                              │
│ └────┘ └────┘ └────┘ └────────┘                              │
│                                                              │
│ Doctrine du jour                                             │
│ « Raconter avec la lenteur du métier... »                    │
├──────────────────────────────────────────────────────────────┤
│ DOCK Liquid Glass (4 apps système universelles)              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                  │
│ │Comp│ │Cale│ │Rapp│ │Mess│                                  │
│ │  ⚙ │ │ 📅 │ │ ✓  │ │ 💬 │                                  │
│ └────┘ └────┘ └────┘ └────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

### Inventaire complet des apps

**Dock (4 apps système)** :
1. ⚙️ **Compte** → Apple Settings (Réglages) — identité user
2. 📅 **Calendrier** → Apple Calendar — vue temporelle publications + business
3. ✓ **Rappels** → Apple Reminders — tasks/to-do
4. 💬 **Messages** → iMessage + Contacts — équipe d'experts + collaborateurs

**Grille principale (apps métier)** :
5. 🩺 **Mon Programme** → Apple Santé — pilotage stratégique de marque
6. 📚 **Bibliothèque** → Apple Photos — corpus visuel + documentaire
7. ⚙️✦ **Ma Marque** → Apple Settings avancé — identité de la marque
8. 📁 **Dossier Mes Outils** → Folder iPadOS contenant :
   - Post Creator (sera détaillé V1.5)
   - Moodboard (V2)
   - Variations (V2)
   - Reviews (V1.5)

**Widgets écran d'accueil** :
- Widget Calendrier (Large) — interactif, deep-link
- Widget Rappels (Large) — interactif, check direct
- Widget Messages (Medium) — Hélène pinned, preview last message
- Bandeau Doctrine (full-width) — citation depuis Brief

---

## 2. Apps Apple référentes — Mapping final

| App CF | App Apple référente | Niveau d'inspiration |
|---|---|---|
| **Page d'accueil** | iPadOS 26 Home Screen | 100% — Liquid Glass, dock, widgets, wallpaper |
| **Mon Programme** | Apple Santé | 100% — Aperçu / Épinglés / Tendances / Parcourir |
| **Calendrier** | Apple Calendar | 100% — vues Day/Week/Month/Year, sidebar calendriers |
| **Rappels** | Apple Reminders | 100% — Smart Lists, sections, columns view, tags |
| **Messages** | iMessage + Contacts (fusionnés) | 100% — sidebar conversations + pinned + thread bulles + sub-app Contacts |
| **Compte** | Apple Settings (général) | 100% — sidebar sections + cells |
| **Bibliothèque** | Apple Photos | 100% — Library/Collections + sidebar albums + grid |
| **Ma Marque** | Apple Settings (avancé) | 100% — sidebar avec hero card marque + cells |
| **Ma Marque > Brief** | Apple Notes (pinned note) | 100% — note épinglée single, toolbar floating, markdown |
| **Ma Marque > Piliers** | Apple Notes (cards) + wizard | Hybride |
| **Post Creator** | Hybride : Apple Notes + Pages éditeur + Instagram | À détailler V1.5 |
| **Reviews** | Apple Reminders (kanban view) | 80% — colonnes drag & drop |

---

## 3. Décisions techniques transversales

### Material design
- **`backdrop-filter: blur()` poussé** (pas refraction physique WebGL/SVG vraie)
- 3 niveaux Liquid Glass canoniques :
  - **z1** : surfaces ambient (sidebars, widgets) — blur 20-30px, opacity 0.55-0.65
  - **z2** : surfaces interactives (cards, rows hover) — blur 40px, opacity 0.7-0.85
  - **z3** : contrôles flottants (popovers, sheets) — blur 60px, opacity 0.94+

### Layout patterns
- **Sidebar figée** dans toutes les apps (pas de toggle collapse en V1.5)
- **Pattern unifié toutes apps** : sidebar + content pane
- **Three-pane** uniquement pour Messages (sidebar + conversation list + thread)
- **Wallpaper teinte** les sidebars Liquid Glass dans toutes les apps (cohérence visuelle marque)
- **Bottom search bar** Liquid Glass dans Bibliothèque + Messages + Rappels (pattern iOS 26)

### Navigation
- **Navigations Next.js classiques avec fade** (pas zoom iPadOS canonique en V1.5)
- **Bouton "← Aujourd'hui"** dans chaque app (top-left ou breadcrumb)
- **Deep-link convention** : `?from=<module>&context=<id>` pour toutes les transitions inter-apps

### Wallpaper
- **Personnalisable par tenant** (chaque marque choisit son wallpaper)
- Default : wallpaper crème CF générique avec gradients méchés
- Option : upload photo de la marque (ex: atelier Carlo Sarrabezolles)
- **Le wallpaper teinte toute l'UI** : icônes, sidebars, dock, folders

### Widgets
- **Interactifs dès V1.5** :
  - Cocher un rappel directement depuis le widget
  - Deep-link vers une publication précise depuis le widget Calendrier
- Multi tap targets sur Medium / Large / XL
- Smart Stack possible (V2)

### Memories / Souvenirs
- **Activés V1.5** dans Bibliothèque
- Auto-générés : "Il y a 1 an dans ta marque", "Same week last year"
- Cards 2:1 en tête de Library

---

## 4. Workflow d'équipe (Angle mort #1)

### Modèle iCloud minimal validé

**3 rôles** : `Owner` / `Editor` / `Viewer`

**Champ tenant** : `tenants.review_mode_enabled` BOOLEAN
- OFF par défaut : Editor publie directement
- ON : Editor soumet en `pending_review`, Owner valide

**Champ post** : `posts.review_status` ENUM NULL / `pending_review` / `approved` / `rejected`

### Permissions (résumé)

| Action | Owner | Editor | Viewer |
|---|---|---|---|
| Lire | ✅ | ✅ | ✅ |
| Créer brouillon | ✅ | ✅ | ❌ |
| Publier directement | ✅ | ✅* | ❌ |
| Valider/refuser | ✅ | ❌ | ❌ |
| Inviter membre | ✅ | ❌ | ❌ |
| Modifier rôles | ✅ | ❌ | ❌ |
| Modifier Ma Marque | ✅ | ✅ | ❌ |
| Facturation | ✅ | ❌ | ❌ |

*Editor : direct si `review_mode_enabled = false`, sinon `pending_review`.

### Module Compte > Équipe (UX)
- Liste des membres du tenant avec rôle dropdown
- Bouton "Inviter un membre" (email)
- Toggle "Mode revue éditoriale" (Owner only)
- **Synchronisation Contacts** : chaque membre humain devient un Contact accessible dans Messages

---

## 5. Interconnexion modules (Angle mort #2)

### Pattern validé : FK + Deep-links

**FK ajoutées (Sprint 39+)** :
```sql
ALTER TABLE reminders ADD COLUMN source_audit_id UUID REFERENCES audits(id) ON DELETE SET NULL;
ALTER TABLE reminders ADD COLUMN source_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE reminders ADD COLUMN source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE reminders ADD COLUMN source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL;
-- posts.pilier_id existe déjà (Sprint 37.K)
```

### Convention Deep-link

Pattern : `?from=<module>&context=<id>`

Exemples canoniques :
- `/post-creator?from=messages&context=<conversation_id>` (composer depuis conv avec doyen)
- `/calendrier?day=2026-05-23` (vue jour spécifique)
- `/bibliotheque?pillar=anecdote` (filtre par pilier)
- `/mon-programme?indicator=coherence&period=30d` (focus indicateur)
- `/rappels?list=publications` (smart list)

### Composant UI transverse `<ContextBanner>`
Bandeau discret en haut de chaque app quand `?from=` présent.  
Format : `← Retour à <module source>`

---

## 6. Résilience APIs (Angle mort #5)

### États publication validés

```sql
ALTER TABLE posts ADD COLUMN publish_status TEXT NOT NULL DEFAULT 'draft'
  CHECK (publish_status IN ('draft', 'scheduled', 'publishing', 'published', 'failed_retry', 'failed_manual'));
ALTER TABLE posts ADD COLUMN publish_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN publish_next_retry_at TIMESTAMPTZ NULL;
ALTER TABLE posts ADD COLUMN publish_error_log JSONB NULL;
```

### Retry auto invisible
- 3 tentatives espacées : 5min / 30min / 2h
- Worker cron Vercel toutes les 5 min
- Après 3 échecs → `failed_manual` + création auto Rappel "Republier"
- UX Floriane : ne voit JAMAIS les états intermédiaires `failed_retry`

### Badges visuels dans Calendrier + Mon Programme
- `scheduled` : point bleu pulsant
- `publishing` : spinner micro
- `published` : check vert subtil
- `failed_manual` : point orange + tâche Rappels

---

## 7. Notifications proactives des doyens

### 4 types de déclencheurs

| Type | Description | V1.5 ? |
|---|---|---|
| **`scheduled`** | Récurrence temporelle (récap hebdo, etc.) | ✅ Oui |
| **`event`** | Évènement interne CF (post `pending_review` depuis 48h) | ✅ Oui |
| **`threshold`** | Seuil franchi sur indicateur Mon Programme | ❌ V2 |
| **`external`** | API externe (Google Alerts, mention IG) | ❌ V2 |

### Table `proactive_signals` (à créer)
```sql
proactive_signals
├── id, tenant_id, contact_id (doyen)
├── trigger_type, trigger_config (jsonb)
├── conversation_id, message_content
├── status ('pending'|'sent'|'dismissed')
└── created_at, sent_at
```

### UX
- Badge rouge sur icône Messages dans le dock
- Notification iPadOS native (slide top)
- Conversation du doyen remonte en haut avec dot unread
- Message contient toujours une **action** ("Veux-tu en savoir plus ?")

---

## 8. Suggestions Mon Programme → Calendrier/Rappels

### Table `suggestions` (à créer)
```sql
suggestions
├── id, tenant_id
├── source_module ('mon_programme'|'messages'|'analytics')
├── source_id (référence audit, conversation)
├── target_module ('calendrier'|'rappels'|'bibliotheque')
├── suggestion_type ('event'|'reminder'|'collection')
├── suggested_payload (jsonb)
├── status ('pending'|'accepted'|'rejected'|'expired')
└── created_at, expires_at
```

### UX
- Dans Mon Programme, section "Suggestions" en bas de l'audit du jour
- Cards individuelles avec bouton [Ajouter au Calendrier] ou [Ajouter aux Rappels] + [Refuser]
- Si accepté → atterrit dans le module cible avec badge "Suggéré par Mon Programme"

---

## 9. Les 4 indicateurs vitaux de Mon Programme

| # | Indicateur | Échelle | Calcul | Source |
|---|---|---|---|---|
| 1 | **Cohérence éditoriale** | 0-100 | Analyse Claude chaque post vs doctrine → moyenne 30j | `posts` + `brands` |
| 2 | **Équilibre piliers** | Distribution % | Count `posts.pilier_id` 30j / objectifs `pillars` | `posts.pilier_id` + `pillars` |
| 3 | **Densité éditoriale** | Régularité | Déviation std intervalles `posts.published_at` 90j | `posts.published_at` |
| 4 | **Profondeur matière** | Ratio | Items Bibliothèque utilisés 30j / posts publiés 30j | `bibliotheque_items` + `posts.source_items` |

Affichage : **4 cards en grille 2x2** en haut de Mon Programme (section "Épinglés").  
Chaque card : valeur + tendance ▲▼ + sparkline mini.  
Tap → vue détaillée avec graphique de tendance + recommandation.

---

## 10. Messages → Système d'agence virtuelle

### Pinned système (non détachable)
- 📌 **Hélène M.** — Directrice de la Communication (avatar gradient lilas→indigo)

### Pinned suggérés (Floriane peut détacher)
- Doyens les plus consultés (apprentissage système)
- Max 9 pinned total (limite Apple iMessage)

### Contacts = sub-app intégrée à Messages
- 3 listes : **Doyens IA** / **Mon Équipe humaine** / **Collaborateurs externes**
- Trois-pane sur iPad : sidebar listes + middle contacts + right fiche détail
- **Synchronisation tenant** : chaque membre humain du tenant (Owner/Editor/Viewer) apparaît comme Contact

### Conversations
- Direct (1-on-1) avec un doyen ou un humain
- Groupes (multi-doyens, ex: "Capsule SS25" avec Hélène + Albane + Antoine)
- Backgrounds personnalisables par conversation

### Quick replies
- Sous chaque message d'un doyen, 2-3 pills suggestions

---

## 11. Synthèse — Ce qui change par rapport à la v1 du concept

| Domaine | Avant | Après cette session |
|---|---|---|
| **Page d'accueil** | Hub modulaire avec apps + widgets séparés | Page d'accueil iPadOS 26 avec **dock distinct** de la grille |
| **Mon Programme** | Apple Calendar style | **Apple Santé** — pilotage stratégique avec 4 indicateurs |
| **Calendar** | Fusionné dans Mon Programme | App séparée dans le dock |
| **Conseiller** | App AI séparée (chatbot) | **Supprimée** — fusionnée dans Messages |
| **Messages** | Inexistante comme app | App du dock avec Hélène pinned + 12 doyens + équipe humaine + Contacts intégrés |
| **Doyens Task Force** | Skills internes | **Personae jouables** comme contacts iMessage |
| **Compte vs Ma Marque** | Confusion | **Séparés clairement** : Compte = user, Ma Marque = marque |
| **Wallpaper** | Décoratif | **Teinte toute l'UI** (cohérence visuelle marque) |
| **Widgets** | Lecture seule | **Interactifs V1.5** |

---

## 12. Liste des documents de référence produits

Cette session produit **6 documents** à archiver dans `docs/cf-conceptuel/` :

1. **`05-decisions-session-cf-0.md`** — Ce document maître ⭐
2. **`06-anatomie-ipados-26-liquid-glass.md`** — Référence technique design system
3. **`07-apps-apple-referentes.md`** — Analyse détaillée des 7 apps Apple
4. **`08-architecture-tables-database.md`** — Schéma SQL des nouvelles tables
5. **`09-flux-interconnexion-modules.md`** — Les 6 flux canoniques entre apps
6. **`10-roadmap-phase-b-mockups.md`** — Plan de production des mockups

---

## 13. Instructions de commit

```bash
cd /Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60
git checkout cf-conceptuel-0
mkdir -p docs/cf-conceptuel
# Copier les 6 documents de référence
cp ~/Downloads/05-decisions-session-cf-0.md docs/cf-conceptuel/
cp ~/Downloads/06-anatomie-ipados-26-liquid-glass.md docs/cf-conceptuel/
cp ~/Downloads/07-apps-apple-referentes.md docs/cf-conceptuel/
cp ~/Downloads/08-architecture-tables-database.md docs/cf-conceptuel/
cp ~/Downloads/09-flux-interconnexion-modules.md docs/cf-conceptuel/
cp ~/Downloads/10-roadmap-phase-b-mockups.md docs/cf-conceptuel/

git add docs/cf-conceptuel/
git commit -m "docs(cf-0): session 16-17 mai — pivots conceptuels majeurs

- Mon Programme = Apple Santé (pas Calendar)
- Conseiller supprimé, fusionné dans Messages
- Dock 4 apps système + grille apps métier
- Compte != Ma Marque
- Hélène M. pinned système, doyens Task Force comme contacts
- Wallpaper personnalisable teintant toute l'UI
- Widgets interactifs V1.5
- Notifications proactives doyens (scheduled+event V1.5)
- Suggestions Mon Programme → Calendrier/Rappels
- 4 indicateurs vitaux validés

Refs: angles morts #1 (rôles), #2 (interconnexion), #5 (résilience)"
git push origin cf-conceptuel-0
```

---

## 14. État des mockups vague 1 après cette session

| Mockup | Statut | Action |
|---|---|---|
| 01 Aujourd'hui v2 | ❌ Obsolète | Refonte v3 avec dock 4 apps + widget Messages |
| 02 Mon Programme v1 | ❌ Obsolète | Refaire complètement style Apple Santé + 4 indicateurs |
| 03 Conseiller v1 | ❌ Obsolète | Devient Messages avec Hélène pinned + doyens |
| 04 Bibliothèque v2 | ✅ Survit | Pas impactée |
| 05 Ma Marque v1 | ⚠️ À ajuster | Sortir Équipe + Facturation vers Compte |

Nouveaux mockups à produire (vague 3) :
- 06 Compte (dock app, Settings style)
- 07 Calendrier (dock app, séparée de Mon Programme)
- 08 Rappels (dock app)
- 09 Messages (avec Contacts intégré)

---

**FIN DOCUMENT 05-DECISIONS-SESSION-CF-0.md**
