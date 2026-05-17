# 09-FLUX-INTERCONNEXION-MODULES — Les 6 flux canoniques

**Date** : 17 mai 2026  
**Branche** : `cf-conceptuel-0`  
**Objet** : Documentation des 6 flux canoniques d'interconnexion entre modules CF, formalisés pour guider la phase B mockups et l'implémentation Sprint 39+.

---

## Préambule — Le hub est composé d'apps mais c'est un système

La métaphore iPad est une métaphore d'organisation visuelle, pas une métaphore de cloisonnement. Chaque app CF a une vocation claire, mais **les flux entre apps sont la matière vivante du produit**.

Une marque ne se pilote pas dans une seule app. Elle se pilote par les **transitions** entre apps : Messages alimente Post Creator, Mon Programme alimente Rappels, Bibliothèque alimente Post Creator, Brief alimente tout.

Ces 6 flux sont les **artères** du système. La phase B mockups doit en montrer au minimum 3 visuellement.

---

## Convention de notation

Chaque flux est documenté en :
1. **Déclencheur** — l'action user qui ouvre le flux
2. **Chemin technique** — les tables/FK/deep-links impliqués
3. **UX visible** — ce que Floriane voit
4. **Persistance** — ce qui est gardé en base après
5. **Reversibilité** — Floriane peut-elle revenir en arrière ?

Pattern deep-link standard : `/<module>?from=<source>&context=<source_id>`

---

## FLUX 1 — Messages (Hélène) → Post Creator

### Contexte
Floriane discute avec Hélène d'un angle pour un post. Hélène propose une formulation. Floriane veut basculer dans Post Creator avec cet angle pré-rempli.

### 1.1 Déclencheur
Sous chaque message d'un doyen contenant une suggestion de post (détecté automatiquement par Claude), un bouton apparaît dans la bulle : **"Ouvrir dans Post Creator"**.

### 1.2 Chemin technique
```
1. User tap "Ouvrir dans Post Creator" sur message.id = msg_123
2. App-shell navigate vers /post-creator?from=messages&context=msg_123
3. Post Creator charge :
   - conversation_id depuis le message → contexte
   - content du message → préfill brouillon
   - sender_contact_id (Hélène) → tag "Suggéré par Hélène M."
4. Au save brouillon, posts.source_conversation_id = conversation_id du message source
```

### 1.3 UX visible

**Dans Messages**, sous la bulle d'Hélène :
```
┌──────────────────────────────────────────────────┐
│ 💬 Hélène M.                            14:32    │
│                                                  │
│ Pour cette anecdote sur l'atelier, je verrais    │
│ un angle "geste oublié" qui montre la précision  │
│ silencieuse du métier. Pas de bruit, juste la    │
│ main et le cuir.                                 │
│                                                  │
│ Proposition de hook :                            │
│ « Il y a un geste que personne ne photographie   │
│ jamais : celui de l'aiguille qui hésite. »       │
│                                                  │
│ [→ Ouvrir dans Post Creator]                     │
└──────────────────────────────────────────────────┘
```

**Dans Post Creator** après transition :
```
┌──────────────────────────────────────────────────┐
│ ← Retour à Messages > Conv Hélène M.             │
│                                                  │
│ Post Creator                  [Sauver brouillon] │
├──────────────────────────────────────────────────┤
│ 🏷  Suggéré par Hélène M. · Pilier Anecdote      │
│                                                  │
│ Caption :                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ « Il y a un geste que personne ne            │ │
│ │ photographie jamais : celui de l'aiguille    │ │
│ │ qui hésite. »                                │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ... (suite éditeur Post Creator)                 │
└──────────────────────────────────────────────────┘
```

### 1.4 Persistance
- Table `posts` créée avec `source_conversation_id = conversation_id`
- Liaison bidirectionnelle : possible de retrouver dans la conv Hélène tous les posts qui en sont issus (filtre `WHERE source_conversation_id = conv_id`)

### 1.5 Reversibilité
- Bouton "Retour à Messages" en breadcrumb top
- Si brouillon non sauvé : pop-up "Conserver le brouillon ?"
- Si sauvé : draft accessible depuis Bibliothèque > Publications > Brouillons

---

## FLUX 2 — Mon Programme (audit du jour) → Rappels (tâches auto)

### Contexte
L'audit quotidien de Mon Programme détecte un déséquilibre (pilier Manifeste sous-représenté). Il propose une action que Floriane peut accepter, ce qui crée automatiquement un Rappel.

### 2.1 Déclencheur
Dans Mon Programme > section "Tendances", chaque recommandation a un bouton **"Ajouter aux Rappels"**.

### 2.2 Chemin technique
```
1. Audit quotidien généré → INSERT INTO audits (...)
2. Audit narrative_text contient des recommendations[] jsonb :
   [{action: "Publier un post Manifeste", priority: "medium", target_module: "rappels"}]
3. User tap "Ajouter aux Rappels" sur recommandation[0]
4. INSERT INTO suggestions :
   source_module = 'mon_programme'
   source_id = audit_id
   target_module = 'rappels'
   suggestion_type = 'reminder'
   suggested_payload = {title, list_name, due_at, priority, tags}
   status = 'accepted'
5. INSERT INTO reminders :
   source_audit_id = audit_id
   source_suggestion_id = suggestion_id
   title, list_name, due_at, etc. depuis payload
6. Toast confirmation : "Rappel créé dans Publications"
```

### 2.3 UX visible

**Dans Mon Programme**, section Tendances :
```
┌──────────────────────────────────────────────────┐
│ TENDANCES                                        │
│                                                  │
│ • Le pilier Manifeste a perdu en intensité       │
│   ces 30 derniers jours (3 posts au lieu de 6).  │
│                                                  │
│ Recommandation :                                 │
│ Publier un post Manifeste cette semaine pour     │
│ rééquilibrer la distribution.                    │
│                                                  │
│ [Demander à Hélène] [Ajouter aux Rappels] [⨯]   │
└──────────────────────────────────────────────────┘
```

Après tap "Ajouter aux Rappels" :
```
✓ Rappel créé dans la liste "Publications"
  [Voir le rappel] (deep-link)
```

**Dans Rappels** après navigation :
```
┌──────────────────────────────────────────────────┐
│ Rappels > Publications                           │
├──────────────────────────────────────────────────┤
│ Cette semaine                                    │
│ ○ Publier un post Manifeste                      │
│   Avant vendredi · Pilier Manifeste              │
│   🏷  Suggéré par Mon Programme · 16 mai         │
└──────────────────────────────────────────────────┘
```

### 2.4 Persistance
- `audits` ← snapshot du jour
- `suggestions` ← entrée avec status='accepted', `resulting_object_type='reminder'`, `resulting_object_id=reminder.id`
- `reminders` ← tâche avec `source_audit_id` et `source_suggestion_id`

### 2.5 Reversibilité
- Décocher le rappel = marquer completed
- Supprimer le rappel = `reminders.deleted_at` (soft delete) — la suggestion reste avec status='accepted' mais resulting_object_id devient orphelin
- Refuser la suggestion = `suggestions.status='rejected'`, pas de rappel créé

---

## FLUX 3 — Brief Ma Marque → Post Creator (template depuis pilier)

### Contexte
Floriane veut créer un post Anecdote. Plutôt que partir d'une feuille blanche, elle clique sur "Créer un post depuis ce pilier" dans Ma Marque > Piliers.

### 3.1 Déclencheur
Dans Ma Marque > Piliers, sur chaque carte de pilier, bouton **"Composer depuis ce pilier"**.

### 3.2 Chemin technique
```
1. User tap "Composer" sur pillar.id = pilier_anecdote
2. Navigate vers /post-creator?from=ma_marque&pilier=pilier_anecdote
3. Post Creator charge :
   - pillars table : pilier name, description, tone, examples
   - brands table : voix, vocabulaire, citation anchor
   - Préfill caption avec template depuis pillar.template
   - Tag automatique : post.pilier_id = pilier_anecdote
4. Au save brouillon, posts.pilier_id = pilier_anecdote (déjà set)
```

### 3.3 UX visible

**Dans Ma Marque > Piliers** :
```
┌──────────────────────────────────────────────────┐
│ Piliers narratifs                                │
├──────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐            │
│ │ Anecdote       │ │ Manifeste      │            │
│ │ ●              │ │ ●              │            │
│ │ Détails du     │ │ Pourquoi le    │            │
│ │ métier, geste  │ │ métier compte  │            │
│ │ oublié.        │ │ aujourd'hui.   │            │
│ │                │ │                │            │
│ │ 62 posts · 3.2 │ │ 15 posts · ↓   │            │
│ │                │ │                │            │
│ │ [Composer] [⋯] │ │ [Composer] [⋯] │            │
│ └────────────────┘ └────────────────┘            │
└──────────────────────────────────────────────────┘
```

**Dans Post Creator** après tap "Composer" sur Anecdote :
```
┌──────────────────────────────────────────────────┐
│ ← Retour à Ma Marque > Piliers                   │
│                                                  │
│ Post Creator           [Sauver]  [Publier...]    │
├──────────────────────────────────────────────────┤
│ 🏷  Pilier Anecdote                              │
│                                                  │
│ Template Anecdote :                              │
│ « Il y a [...]  »                                │
│                                                  │
│ Ton à adopter :                                  │
│ - Lent, descriptif, observateur                  │
│ - Détails précis (pas généraux)                  │
│ - Pas d'exclamation                              │
│                                                  │
│ Exemples récents :                               │
│ - Post du 12 mai (412 likes, cohérence 92)       │
│ - Post du 28 avril (287 likes, cohérence 88)     │
│                                                  │
│ Caption :                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ [curseur prêt à taper]                       │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 3.4 Persistance
- `posts.pilier_id` set dès la création du draft
- Tracking pour Mon Programme : compte ce post dans la distribution piliers dès qu'il passe en `scheduled` ou `published`

### 3.5 Reversibilité
- Changement de pilier possible dans Post Creator (dropdown)
- Annulation = retour à Ma Marque sans draft créé

---

## FLUX 4 — Bibliothèque → Post Creator (réutiliser un visuel)

### Contexte
Floriane parcourt sa Bibliothèque, voit une photo de l'atelier qu'elle veut réutiliser pour un nouveau post.

### 4.1 Déclencheur
Sur une photo, long-press ou clic → menu contextuel avec **"Créer un post avec ce visuel"**.

### 4.2 Chemin technique
```
1. User tap "Créer un post" sur biblio_item.id = item_xyz
2. Navigate vers /post-creator?from=bibliotheque&item=item_xyz
3. Post Creator charge :
   - bibliotheque_items.url → préfill visual
   - bibliotheque_items.metadata → si pilier_suggéré, préfill pilier
   - bibliotheque_items.alt_text → préfill alt-text accessibility
4. Au save, INSERT INTO post_bibliotheque_items (post_id, item_id) — table de liaison
```

### 4.3 UX visible

**Dans Bibliothèque**, long-press sur une photo :
```
┌────────────────────────────────────┐
│ ┌────────────────┐                 │
│ │                │                 │
│ │   Photo        │                 │
│ │   atelier      │                 │
│ │                │                 │
│ └────────────────┘                 │
│ ┌──────────────────────────────┐   │
│ │ Créer un post avec ce visuel │   │
│ │ Ajouter à un album           │   │
│ │ Voir l'historique d'usage    │   │
│ │ Partager                     │   │
│ │ Supprimer                    │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### 4.4 Persistance
- Table de liaison `post_bibliotheque_items (post_id, item_id, position)` — à créer Sprint 39 si pas déjà existante
- Update du compteur **Profondeur de matière** : ce visuel est compté comme "utilisé ce mois" pour le calcul indicateur Mon Programme

### 4.5 Reversibilité
- Suppression du visuel du post = unlink dans la table de liaison
- Suppression du post entier = cascade DELETE sur post_bibliotheque_items (mais bibliotheque_items reste)

---

## FLUX 5 — Mon Programme → Calendrier (suggestion d'évènement)

### Contexte
Mon Programme suggère un RDV business (réunion de revue mensuelle) en fonction du contexte de la marque.

### 5.1 Déclencheur
Dans Mon Programme > section "Suggestions" (bas de page), card "Mon Programme suggère un évènement".

### 5.2 Chemin technique
```
1. Audit hebdomadaire détecte que la dernière réunion business date de >30 jours
2. INSERT INTO suggestions :
   source_module = 'mon_programme'
   target_module = 'calendrier'
   suggestion_type = 'event'
   suggested_payload = {title, starts_at, duration_minutes, category: 'business', participants: [...]}
   status = 'pending'
3. User tap "Ajouter au Calendrier"
4. INSERT INTO events :
   source_suggestion_id = suggestion.id
   title, starts_at, ends_at, category = 'business'
5. UPDATE suggestions SET status='accepted', resulting_object_id=event.id
6. Toast : "Évènement ajouté au Calendrier"
```

### 5.3 UX visible

**Dans Mon Programme**, section Suggestions :
```
┌──────────────────────────────────────────────────┐
│ SUGGESTIONS POUR CETTE SEMAINE                   │
├──────────────────────────────────────────────────┤
│ 🗓  Mon Programme suggère                         │
│    Réunion de revue mensuelle avec Antoine       │
│    Mardi 21 mai · 14h · 1h · Business            │
│                                                  │
│    Tu n'as pas eu de revue depuis 35 jours.      │
│    [Ajouter au Calendrier]  [Refuser]            │
└──────────────────────────────────────────────────┘
```

**Dans Calendrier** après ajout :
```
┌──────────────────────────────────────────────────┐
│ Calendrier > Semaine 21                          │
├──────────────────────────────────────────────────┤
│ Mardi 21 mai                                     │
│ 14:00 ┌─────────────────────────────────┐        │
│       │ 🟣 Revue mensuelle              │        │
│       │ Antoine F.                      │        │
│       │ 🏷  Suggéré par Mon Programme    │        │
│ 15:00 └─────────────────────────────────┘        │
└──────────────────────────────────────────────────┘
```

### 5.4 Persistance
- `events` avec `source_suggestion_id` set
- `suggestions.resulting_object_id` set

### 5.5 Reversibilité
- Suppression de l'event = standard, suggestion reste avec status='accepted' mais resulting_object_id devient orphelin
- Refuser dès le départ = `suggestions.status='rejected'`

---

## FLUX 6 — Messages (notification proactive Marc D.) → Mon Programme (focus indicateur)

### Contexte
Marc D. (doyen Veille) envoie un message proactif scheduled (récap hebdo) : "Le pilier Manifeste a perdu en intensité ce mois". Floriane veut ouvrir Mon Programme directement sur cet indicateur.

### 6.1 Déclencheur
Sous le message proactif de Marc, bouton **"Ouvrir l'indicateur dans Mon Programme"**.

### 6.2 Chemin technique
```
1. Trigger scheduled (lundi 9h) → INSERT INTO messages (sender = Marc, content auto-généré)
2. last_message_at de la conversation Marc remonte au top de la sidebar
3. Badge unread + notification iPadOS native
4. User tap message → ouvre conv Marc
5. Sous le message, bouton "Ouvrir l'indicateur"
6. Navigate vers /mon-programme?indicator=equilibre_piliers&from=messages&context=msg_id
7. Mon Programme ouvre directement sur la vue détaillée de cet indicateur
```

### 6.3 UX visible

**Dans Messages**, message de Marc :
```
┌──────────────────────────────────────────────────┐
│ 🌐 Marc D.                              Lun 9:00 │
│                                                  │
│ Récap hebdo de veille pour Carlo Sarrabezolles : │
│                                                  │
│ - Tendance "métiers oubliés" continue de monter  │
│ - Hermès a publié 3 posts type Anecdote          │
│ - Toi : ton pilier Manifeste a perdu 3 posts ce  │
│   mois (équilibre rompu)                         │
│                                                  │
│ [→ Ouvrir l'équilibre piliers dans Mon Programme]│
└──────────────────────────────────────────────────┘
```

**Dans Mon Programme** vue détaillée :
```
┌──────────────────────────────────────────────────┐
│ ← Retour à Messages > Conv Marc D.               │
│                                                  │
│ Mon Programme > Équilibre des piliers            │
├──────────────────────────────────────────────────┤
│ Distribution 30 derniers jours                   │
│                                                  │
│ ████████████ Anecdote      30% (recommandé 25%)  │
│ ███████      Manifeste     15% (recommandé 25%)  │
│ ████████████ Produit       35% (recommandé 35%)  │
│ ████████     Évènement     20% (recommandé 15%)  │
│                                                  │
│ Graphique de tendance                            │
│ [SVG sparkline mensuel par pilier]               │
│                                                  │
│ Recommandation :                                 │
│ Publier 2-3 posts Manifeste avant fin mai.       │
│ [Demander à Hélène] [Ajouter aux Rappels]        │
└──────────────────────────────────────────────────┘
```

### 6.4 Persistance
- Le message reste dans `messages` (historique de notification)
- `proactive_signals.last_fired_at` updated, `next_fire_at` recalculé (semaine prochaine)
- Pas de nouvel objet créé côté Mon Programme (juste une vue contextuelle)

### 6.5 Reversibilité
- Standard navigation back via breadcrumb

---

## Patterns transverses aux 6 flux

### Pattern A — Composant `<ContextBanner>`

Présent en haut de chaque app quand `?from=` dans l'URL :
```
┌──────────────────────────────────────────────────┐
│ ← Retour à <module source> > <context label>     │
└──────────────────────────────────────────────────┘
```

Format auto-généré depuis les params :
- `?from=messages&context=conv_123` → "Retour à Messages > Conv Hélène M."
- `?from=mon_programme&indicator=coherence` → "Retour à Mon Programme > Cohérence éditoriale"

### Pattern B — Badge `🏷 Suggéré par <module>`

Présent sur tout objet créé via un flux inter-module :
- Sur rappel : "Suggéré par Mon Programme"
- Sur post : "Suggéré par Hélène M."
- Sur évènement : "Suggéré par Mon Programme"

Tappable → deep-link vers la source.

### Pattern C — Quick replies sous chaque suggestion

Pour chaque suggestion ou recommandation, **2 boutons d'action principale** :
- **Action positive** (Ajouter / Composer / Ouvrir...)
- **Action négative** (Refuser / Plus tard)

Jamais plus de 2 boutons pour rester lisible.

### Pattern D — Toast de confirmation discret

Après action positive d'un flux, toast bottom :
```
✓ Rappel créé dans Publications
  [Voir]
```

Auto-dismiss 4s. Bouton "Voir" deep-link vers l'objet créé.

### Pattern E — Liaison bidirectionnelle FK

Pour chaque flux, FK dans les deux sens :
- `reminders.source_audit_id` permet de retrouver l'audit qui a créé le rappel
- Vue inverse via `WHERE source_audit_id = X` dans `reminders` permet de lister "Rappels issus de cet audit"

---

## Synthèse — Les 6 flux dans le mockup vague 2

| Flux | Mockup où le montrer | Priorité |
|---|---|---|
| 1. Messages → Post Creator | Messages mockup + Post Creator mockup | P1 |
| 2. Mon Programme → Rappels | Mon Programme mockup | P1 |
| 3. Brief → Post Creator | Ma Marque > Piliers + Post Creator | P2 |
| 4. Bibliothèque → Post Creator | Bibliothèque (déjà fait) + Post Creator | P2 |
| 5. Mon Programme → Calendrier | Mon Programme + Calendrier | P1 |
| 6. Messages → Mon Programme | Messages + Mon Programme | P1 |

**Minimum vital pour mockup vague 2** : flux 1, 2, 5, 6 (P1).

---

## Flux V2 — non documentés ici, à formaliser plus tard

- **Crise → Pause publication globale** (Valentine D. peut suggérer un pause auto)
- **Conseiller intégré in-context** (Hélène apparaît dans Post Creator pour valider)
- **Bibliothèque sémantique → Post Creator** (recherche d'image par description naturelle)
- **Multi-marques** (V2 : switch entre marques par swipe horizontal entre home screens)

---

**FIN DOCUMENT 09-FLUX-INTERCONNEXION-MODULES.md**
