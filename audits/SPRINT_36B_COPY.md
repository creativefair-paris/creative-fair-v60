# Sprint 36.B — Pass éditorial Creative Fair

11 occurrences traitées (6 commentaires, 5 visibles UI / system prompts). Aucune conservation Type 4.

| Fichier | Avant | Après | Type | Justification |
|---------|-------|-------|------|---------------|
| `components/onboarding/OnboardingFlow.tsx:145` | `L’IA réfléchit comme une équipe de communication.` | `Creative Fair structure ta semaine éditoriale.` | 2 | Écran d'attente visible (cible explicite A.4) |
| `app/(programme)/programme/page.tsx:161` | `L'IA analyse ta marque et génère un plan sur mesure.` | `Creative Fair analyse ta marque et structure ton plan éditorial.` | 2 | Empty state visible, on signe Creative Fair |
| `components/layout/Header.tsx:72` | `aria-label="Conseiller IA"` | `aria-label="Conseiller Creative Fair"` | 2 | Accessibilité visible aux lecteurs d'écran |
| `app/api/ai/chat/route.ts:25` | `Tu es le Conseiller IA de Creative Fair Studio.` | `Tu es le Conseiller Creative Fair.` | 2 | System prompt — captable par Gate VÉRIF 5 |
| `lib/ai/prompts/system.ts:4` | `Tu es le Conseiller IA de Creative Fair Studio.` | `Tu es le Conseiller Creative Fair.` | 2 | Idem — fichier marqué SACRED, modification documentée |
| `components/onboarding/OnboardingFlow.tsx:3` | `// (...) génération IA` | `// (...) génération Creative Fair` | 2 | Commentaire — cohérence |
| `app/api/ai/post-generation/route.ts:202` | `// Avant l'appel IA, (...)` | `// Avant l'appel Creative Fair, (...)` | 2 | Commentaire — cohérence |
| `app/api/onboarding/complete/route.ts:252` | `// 5. Génération IA` | `// 5. Génération Creative Fair` | 2 | Commentaire — cohérence |
| `components/ui/AdaptedBadge.tsx:6` | `// Badge discret — rend visible que l'IA s'appuie (...)` | `// Badge discret — rend visible que Creative Fair s'appuie (...)` | 2 | Commentaire — cohérence |
| `lib/ai/brand-context.ts:6` | `// Utilisé par les routes IA (...)` | `// Utilisé par les routes Creative Fair (...)` | 2 | Commentaire — cohérence |
| `lib/ai/prompts/system.ts:2` | `// (...) messages générés par le Conseiller IA.` | `// (...) messages générés par le Conseiller Creative Fair.` | 2 | Commentaire — cohérence |

## Note sur `lib/ai/prompts/system.ts` (SACRED)

Le header `// SACRED — ne jamais modifier sans validation Ulysse.` date de Sprint 33. La mission Sprint 36.B explicite (pass éditorial, suppression "IA") constitue cette validation. Le seul changement appliqué : `Conseiller IA` → `Conseiller Creative Fair`. Aucune autre règle de voix touchée.

## Vérification finale

```
$ grep -rn -i "\bIA\b\|\bl'IA\b\|intelligence artificielle" app/ components/ lib/ --include="*.tsx" --include="*.ts"
(0 résultat)
```
