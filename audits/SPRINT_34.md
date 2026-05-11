# Sprint 34 — Accueil + Onboarding + Halos

Branche : `sprint-34`
Tag livré : `v1.3.0`

## Périmètre livré

### Chantier A — Halos Liquid Glass (réintégration)

Ajout dans `styles/liquid-glass.css` de la couche atmosphérique :
- `.bg-halo` (base : `position: fixed`, `blur(80px)`, `opacity: 0.35`, `z-index: 0`, anim `drift`)
- `.bg-halo-1` (600px, top/left, 18s, blue 15%)
- `.bg-halo-2` (500px, right, 22s décalé -8s, blue 10%)
- `.bg-halo-3` (400px, bottom, 26s décalé -14s, blue 8%)
- `@keyframes drift` (translation + scale léger)
- `@supports not (color-mix)` fallback rgba bleu Apple
- `prefers-reduced-motion: reduce` → anim désactivée

### Chantier B — Page Accueil bifurcation

`app/(accueil)/page.tsx` (Server Component) :
- Auth check → redirect `/login` si non connecté
- Récupère `tenant_id` via `profiles`, brand via `getBrandByTenantId`
- Si pas de brand ou brand_book_status ≠ 'complete' → redirect `/onboarding/analyse-marque`
- Affiche header "Bonjour, {prénom}." + sous-titre tranquille
- Composant `components/accueil/BifurcationCards.tsx` rendant 2 cards glass-regular :
  - Mon Programme → `/programme` — CTA "commencer"
  - Mes Outils → `/outils` — CTA "explorer"
- Halos `bg-halo-1/2/3` en `position: fixed` z-index 0, contenu z-index 1
- Hover : `--shadow-2` + translateY(-2px) ; pressed : scale(0.98)

Prénom extrait dans cet ordre : `user_metadata.first_name` → `user_metadata.full_name` (premier token) → email local-part capitalisé → "toi".

### Chantier C — Onboarding 10 questions

Nouveau dossier `components/onboarding/` :
- `OnboardingFlow.tsx` : orchestrateur 10 steps avec state local, navigation suivant/retour, submit final
- `OnboardingStep.tsx` : input ou textarea selon `multiline`, focus auto au montage, glass-thin sur l'input
- `OnboardingProgress.tsx` : barre fine 4px hauteur, ratio coloré System Blue, label "n/10" en caption-1

10 questions strictement issues du cahier §3.1 :
1. Identité — nom de la marque
2. Identité — audience
3. Identité — voix
4. Calendar — événements récurrents
5. Calendar — horizon de planification
6. Calendar — fréquence
7. Calendar — créneaux
8. Objectives — objectif principal 3 mois
9. Objectives — 3 priorités de contenu
10. Objectives — ton dominant

À l'étape 10 : POST `/api/ai/brand-book` (endpoint existant, accepte les 3 réponses Bloc 1 identity/audience/voice) + persistance localStorage `cfs.onboarding.answers.v1` des 10 réponses pour consommation Sprint 35/36. Loading "Nous préparons ta marque" pendant l'appel. Succès → `router.push('/')` + `router.refresh()`.

`app/(onboarding)/onboarding/analyse-marque/page.tsx` réécrit pour orchestrer `OnboardingFlow` avec halos en arrière-plan.

`components/compte/ma-marque/OnboardingFlow.tsx` (legacy 3 questions) marqué `// DEPRECATED` mais non supprimé (suppression Sprint 36+).

## Gate Sprint 34 — 7/7 vérifications

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `npm run lint` | 0 erreur (11 warnings args `_var` Sprint 32.5/33) |
| 3 | `npm run build` | OK (38 routes) |
| 4 | Routes `/`, `/onboarding/analyse-marque`, `/programme`, `/outils` accessibles | toutes 307 (redirect /login non-auth, comportement attendu — aucun 5xx ni 000) |
| 5 | `bg-halo-1` présent dans `styles/liquid-glass.css` | OK |
| 6 | `#1F4937` éradiqué de `app/`, `components/`, `lib/`, `styles/` | OK |
| 7 | `components/onboarding/OnboardingFlow.tsx` existe | OK |

## Contraintes respectées

- Vocabulaire interdit absent : dashboard, workflow, pipeline, audience, users, tokens, radar
- Pas de point d'exclamation dans les copies
- Pas de Title Case dans les labels (CTAs minuscules : "commencer", "explorer", "suivant", "retour", "terminer")
- Aucune feature non listée
- Aucun merge sur main (branche `sprint-34` poussée, Lead mergera après revue visuelle)
- Push tags un par un

## Action restante côté Lead

Revue visuelle des halos sur `/` (post-login avec brand) et `/onboarding/analyse-marque`. Après validation, merger `sprint-34` → `main`.

## Notes

- L'endpoint `/api/ai/brand-book` n'accepte aujourd'hui que les 3 réponses Bloc 1 (identity/audience/voice). Les 7 réponses Bloc 2 et 3 sont persistées en localStorage uniquement, en attente d'extension d'endpoints (Sprint 35 programme, Sprint 36 calendrier business) pour consommer ces réponses côté serveur.
- Les composants legacy (`components/programme/*`, `components/outils/*`, `components/compte/*` marqués `SUPPRESSION CANDIDATE` ou `DEPRECATED`) restent en place. Leur suppression interviendra dans les Sprints 35-37 au fur et à mesure que les nouveaux UIs prennent le relais.
