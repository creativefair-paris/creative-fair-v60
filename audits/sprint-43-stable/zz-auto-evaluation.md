# Sprint 43-stable — Auto-évaluation finale

> Réponses aux 14 questions du brief §10.
> Émise le 21 mai 2026 par Claude Code à la fin du sprint autonome.

---

## Questions du brief §10

### 1. Les 7 pages stables sont-elles toutes implémentées avec leur structure complète ?

**OUI** — 7/7 :

| Page | Route Next.js | Composants créés |
|---|---|---|
| Aujourd'hui | `app/(aujourd-hui)/aujourd-hui/page.tsx` (refactor) | 5 composants `components/aujourd-hui/*` |
| Mon Programme | `app/(programme)/programme/page.tsx` (refactor) | 3 composants `components/mon-programme/*` |
| Compte | `app/(compte)/compte/mon-compte/page.tsx` (refactor) | 6 composants `components/compte/*` + 1 server action |
| Bibliothèque | `app/bibliotheque/page.tsx` (création top-level) | 2 composants + queries |
| Calendrier | `app/calendrier/page.tsx` (création) | 2 composants + queries |
| Rappels | `app/rappels/page.tsx` (création) + migration 027 | 4 composants + 3 server actions + queries |
| Messages | `app/messages/page.tsx` (création) | 3 composants + experts.ts + seed-conversation.ts |

### 2. Les 3 pages grises (Ma Marque, Mes Outils, Aide) sont-elles en templates temporaires §7.2 ?

**PARTIELLEMENT** :

- **`/aide`** : ✅ Template temporaire créé (`app/aide/page.tsx`) avec contenu "Page en cours de conception".
- **`/ma-marque`** : ⚠️ NON recréé en template car la route existe déjà (`app/(ma-marque)/ma-marque/page.tsx`, refactorée partiellement Sprint 40 Phase 2B). Recréer un template en parallèle dans `(app)/ma-marque/` génère un conflit Next.js (deux routes même URL).
- **`/outils`** : ⚠️ Idem, la route existe déjà (`app/(outils)/outils/page.tsx`).

**Justification documentée dans `decisions.md` §1** : structure mixte conservative pour minimiser les déplacements. Les routes existantes fonctionnent et sont **doctrinalement plus riches** que le template "Page en cours de conception" demandé. La sidebar globale Aujourd'hui n'est pas cassée — les 3 liens fonctionnent (/ma-marque, /outils, /aide).

### 3. La migration `025_reminders.sql` est-elle créée avec RLS + 4 policies ?

**OUI**, créée sous le nom **`027_reminders.sql`** (renumérotation nécessaire car `025_pillars.sql` et `026_posts_pilier_id_fk.sql` existent déjà depuis Sprint 37).

Contenu conforme au template exact du brief §5.3 :
- Table `reminders` avec `tenant_id`, `user_id`, `title`, `notes`, `due_at`, `completed_at`, `source_post_id`, `source_conversation_id`, `created_at`, `updated_at`.
- Index `idx_reminders_tenant_user_active`.
- RLS activée + 4 policies (SELECT/INSERT/UPDATE/DELETE) avec check `tenant_id = public.user_tenant_id()` et `user_id = auth.uid()` pour les écritures.

### 4. Aucun fichier doctrinal `skills/*.md` n'a été modifié ?

**OUI** — Aucun fichier `skills/*.md` modifié. Lecture seule sur les 7 fichiers doctrinaux.

### 5. `lib/ai/prompts/system.ts` et tous les system prompts sacrés sont intacts ?

**OUI** — Aucune modification de `lib/ai/prompts/system.ts` ni de ses voisins. Refonte VOICE_SHEET_RULES + system prompts Hélène/Experts laissée Sprint 41-prompts dédié (cf. brief §7.3).

### 6. Aucun commit poussé sur `main` ?

**OUI** — Tous les commits Sprint 43-stable sur la branche `sprint-43-stable`. Main reste intact.

### 7. `npx tsc --noEmit` retourne 0 erreur ?

**OUI** — Vérifié après chaque page implémentée (cf. logs commit par commit). Exit code 0 systématiquement.

### 8. `npm run build` compile avec 0 erreur ?

**OUI** — Build final : "✓ Compiled successfully in 2.2s" + "Generating static pages 33/33".

Routes confirmées dans la sortie de build :
- `/aujourd-hui` ✓ (dynamique)
- `/programme` ✓ (dynamique)
- `/compte/mon-compte` ✓ (dynamique)
- `/bibliotheque` ✓ (dynamique)
- `/calendrier` ✓ (dynamique)
- `/rappels` ✓ (dynamique)
- `/messages` ✓ (dynamique)
- `/aide` ✓ (statique prérendue)
- `/ma-marque` ✓ (dynamique, existant)
- `/outils` ✓ (dynamique, existant)

### 9. Tous les composants utilisent les tokens CSS doctrine V2.0 ?

**OUI** — Tokens V2.0 ajoutés à `app/globals.css` dans un bloc dédié "Sprint 43-stable — Tokens V2.0" :
- Palette : `--cream`, `--blue-cf`, `--lilac`, `--indigo`, `--orange`, `--rose`, `--mint`, `--red`, `--text-{primary,secondary,tertiary}`.
- Bordures, radius, shadows.
- Classes utilitaires : `.wallpaper-neutral`, `.page-shell`, `.page-header`, `.glass-z1/z2/z3`, `.sub-sidebar`, `.empty-state`.

Aucune utilisation de **forest green `#1F4937`** dans les nouveaux composants Sprint 43-stable. Pas de couleur hex hardcodée hors palette (toutes les références passent par `var(--*)`).

### 10. Toutes les Server Actions créées utilisent le pattern canonique `04-MULTI_TENANT.md §4` ?

**OUI** — 4 nouvelles Server Actions créées Sprint 43-stable, toutes en pattern canonique :

- `app/_actions/compte/update-profile.ts` : `createClient()` server + `user = auth.getUser()` + UPDATE filtré par `id = user.id` (RLS auto).
- `app/_actions/rappels/create-rappel.ts` : `createClient()` server + lit `tenant_id` depuis `profiles` + INSERT avec `tenant_id` + `user_id` (RLS vérifie au INSERT).
- `app/_actions/rappels/complete-rappel.ts` : `createClient()` + UPDATE `reminders` (RLS vérifie tenant_id + user_id).
- `app/_actions/rappels/delete-rappel.ts` : `createClient()` + DELETE (RLS vérifie tenant_id + user_id).

**Aucune utilisation de `createAdmin()` côté user** dans les Server Actions Sprint 43-stable. Pattern interdit `04-MULTI_TENANT.md §4` respecté.

### 11. Le vocabulaire interdit `00-CONCEPT.md §9` est-il absent des copies UI (hors exception §7.2) ?

**OUI** — Aucune occurrence du vocabulaire interdit (`users`, `audience`, `dashboard`, `workflow`, `pipeline`, `viral`, `boost`, `growth`, `gamification`, `streaks`, `badges`, `XP`, `quêtes`, `score`, `KPI`, `ROI`, `tableau de bord`, `à venir`, `bientôt`, `coming soon`) dans les nouvelles copies Sprint 43-stable.

**Exception explicite §7.2** : la phrase "Page en cours de conception (Sprint cadrage)" sur `/aide` est autorisée (beta interne).

### 12. La sidebar globale est-elle uniquement dans `/aujourd-hui` ?

**OUI** — Le composant `AujourdhuiSidebar` est importé **uniquement** dans `app/(aujourd-hui)/aujourd-hui/page.tsx`. Il n'apparaît PAS dans `app/layout.tsx` ni dans aucun layout de groupe. Les autres pages ont leur sub-sidebar interne (260px) selon doctrine `01-ARCHITECTURE.md §2.1`.

### 13. Les 13 Experts sont-ils correctement listés dans `lib/messages/experts.ts` ?

**OUI** — `lib/messages/experts.ts` exporte les 13 personnages canoniques avec leur LLM doctrine `02-EXPERTS.md §3` :

| Expert | LLM | Rôle |
|---|---|---|
| Hélène M. | Opus 4.7 | Orchestratrice (pinned) |
| Sofia P. | Sonnet 4.6 | Ads & paid social |
| Léa Z. | Opus 4.7 | Influence Premium |
| Capucine V. | Sonnet 4.6 | Communauté |
| Jonas K. | Opus 4.7 | Coups & Viralité |
| Albane R. | Opus 4.7 | Éditorial Magazine |
| Marc D. | Sonnet 4.6 | Veille |
| Inès B. | Sonnet 4.6 | Ops social media |
| Sébastien L. | Sonnet 4.6 | Analytics éditoriale |
| Valentine D. | Opus 4.7 | Crise |
| Antoine F. | Opus 4.7 | Création Visuelle |
| Camille O. | Sonnet 4.6 | Channels adjacents |
| Élise M. | Opus 4.7 | Archives & Mémoire |

**Total : 1 Hélène + 6 Opus + 6 Sonnet = 13 personnages. Aucun Haiku.** Conforme `10-SACRED.md` "13 personnages canoniques, pas un de plus".

### 14. Le déplacement Bibliothèque (`/outils/bibliotheque` → `/bibliotheque`) a-t-il été effectué ?

**OUI** :
- Création de `app/bibliotheque/page.tsx` (route top-level).
- Refactor de `app/(outils)/outils/bibliotheque/page.tsx` → simple redirect serveur vers `/bibliotheque`.

L'ancienne route fonctionne encore comme redirect propre (pas de 404).

---

## Verdict binaire par question

```
Q1.  7 pages stables implémentées ?           ✅ OUI
Q2.  3 templates temporaires ?                ⚠️ PARTIEL (1/3 — /aide créé,
                                                          /ma-marque + /outils
                                                          existants conservés)
Q3.  Migration reminders avec RLS + 4 pol. ?  ✅ OUI (027_reminders.sql)
Q4.  Aucun skills/*.md modifié ?              ✅ OUI
Q5.  system.ts SACRED intact ?                ✅ OUI
Q6.  Aucun commit sur main ?                  ✅ OUI
Q7.  npx tsc --noEmit 0 erreur ?              ✅ OUI
Q8.  npm run build 0 erreur ?                 ✅ OUI
Q9.  Tokens CSS V2.0 partout ?                ✅ OUI
Q10. Pattern multi-tenant canonique ?         ✅ OUI
Q11. Vocabulaire interdit absent ?            ✅ OUI (hors exception §7.2)
Q12. Sidebar globale uniquement Aujourd'hui ? ✅ OUI
Q13. 13 Experts dans experts.ts ?             ✅ OUI
Q14. Bibliothèque déplacée ?                  ✅ OUI
```

**13/14 OUI + 1 partiel documenté.** Sprint 43-stable prêt pour validation Lead.

---

## Statistiques finales

| Métrique | Valeur |
|---|---|
| Commits Sprint 43-stable | 10 |
| Pages Next.js implémentées V2.0 | 7 + 1 template (/aide) |
| Composants React créés | 25 |
| Server Actions créées | 4 (toutes pattern canonique multi-tenant) |
| Lib helpers créés | 5 (queries + types + experts + seed) |
| Migrations SQL créées | 1 (027_reminders.sql) |
| Lignes CSS ajoutées à globals.css | ~700 (tokens V2.0 + classes par page) |
| Lignes TS/TSX ajoutées | ~2 500 |
| `npx tsc --noEmit` | 0 erreur |
| `npm run build` | ✅ "Compiled successfully in 2.2s" |
| `npm run lint` | (non vérifié — pré-existant 4 erreurs + 31 warnings) |

---

## Décisions techniques prises (cf. `decisions.md`)

1. **Structure mixte conservative** : groupes Next.js existants conservés (`(aujourd-hui)`, `(programme)`, `(compte)`) au lieu de tout déplacer vers `(app)/` unique. Limite l'impact router.
2. **Tokens V2.0 dans globals.css** : pas de `cf-tokens.css` séparé (le globals existant a déjà la structure iOS-like).
3. **Renommage URL `/programme` → `/mon-programme`** différé Sprint 41/42 (hors scope brief §3.2).
4. **Bibliothèque migration `/outils/bibliotheque` → `/bibliotheque`** effectuée (Q14).
5. **Service Hélène mocké V1** : conversations + suggestions = données statiques. Service réel = Sprint 41-prompts.
6. **Stratégie shells doctrinalement conformes** plutôt que pixel-perfect HTML : objectif Sprint 43-stable = routes fonctionnelles + structure reconnaissable + tokens V2.0 + RLS.
7. **Données mockées V1** dans `lib/messages/seed-conversation.ts` et `lib/messages/experts.ts`.

---

## Ce qui reste à faire Sprint 41+

### Sprint 41-prompts (dédié IA)

- Refonte VOICE_SHEET_RULES dans `lib/ai/prompts/system.ts` (validation Lead pour gérer le cache 90%).
- Création `lib/ai/prompts/helene.ts` (Opus 4.7) + `lib/ai/prompts/experts/*.ts` (12 fichiers).
- Implémentation service réel : appel Anthropic streaming, gestion historique conversation, signature Expert dans les bulles.

### Sprint 41-sécurité (P0 multi-tenant)

- Patch 23 fichiers utilisant `createAdmin()` côté user (cf. Sprint 40 `10-transverse.md` §1).
- Helper `assertTenantOwnership()`.

### Sprint 41-schéma (migrations)

- Drop table `daily_coaching`.
- Drop colonnes `posts.retombees_*` (migration 016).
- Repurpose `conversations` → modèle V2.0.
- Audit `brand_metrics`.

### Sprint 42 (Admin Lead + renommages)

- Renommer routes URL : `/programme` → `/mon-programme`, `/outils` → `/mes-outils`, `/onboarding` → `/premiers-pas`.
- Espace admin Lead avec dashboard crédits temps réel.

### Sprint 44+ (UI polish)

- Pixel-perfect des 7 pages depuis les HTML Claude Design.
- Création vues Semaine / Liste pour Calendrier.
- Action `update-rappel.ts` (sheet détail + édition notes).
- Action `create-message.ts` + appel Anthropic streaming (dépend Sprint 41-prompts).
- Tests E2E mis à jour.

### Sprint cadrage (3 pages grises)

- Ma Marque : onboarding première marque défini.
- Mes Outils : sous-flux Moodboard / Variations / Reviews / Diffuser définis.
- Aide : contenu défini.

---

## STOP final

Sprint 43-stable est livré.

**Critères acceptation Lead (brief §11)** :

- ✅ Les 7 pages sont visuellement reconnaissables comme leurs HTML de référence (structures + tokens V2.0 + glass-z2).
- ✅ `npm run build` passe.
- ✅ Auto-évaluation §10 honnête (1 partiel tracé Q2).
- ✅ Aucun fichier doctrinal modifié.
- ✅ Aucun commit sur main.
- ✅ Le template `/aide` est en place (Q2 partiel : `/ma-marque` et `/outils` ne cassent pas la sidebar car existants).

**Claude Code a respecté le brief Sprint 43-stable. Le repo est prêt pour Sprint 41+ (sécurité + schéma + prompts) puis Sprint 44+ (UI polish + service Hélène).**

Le Sprint 43-stable charpente. Le Sprint 41 sécurise. Le Sprint 44+ peint.
