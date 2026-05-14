# Sprint 37.F — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.E.

---

## F60a — Debug onboarding guidé

### Inspection du code

Lecture de :
- `components/onboarding-marque/BrandOnboardingHeaderCta.tsx` (le bouton)
- `components/onboarding-marque/BrandOnboardingTrigger.tsx` (le listener URL)
- `app/_actions/brand-onboarding.ts` (createBrandOnboardingSession)

### Cause identifiée (hypothèse forte)

Le bouton CTA fait `router.push('/ma-marque?onboarding=true')`. Quand le pilote
est déjà sur `/ma-marque`, le `useSearchParams` du Trigger devrait être réactif
(Next.js 15 App Router) — mais en pratique avec `force-dynamic` + cache RSC, la
mise à jour peut ne pas se propager au client component du Trigger. Le useEffect
ne re-fire pas, l'état reste 'idle' → la sheet ne s'ouvre jamais.

Secondaire — un double cast `as unknown as SupabaseClient as unknown as SupabaseClient`
sur la ligne 86 de brand-onboarding.ts (résidu Sprint 37.C replace_all trop large) :
inoffensif au runtime mais à nettoyer.

### Fix appliqué

1. **Trigger event-based** : ajout d'un listener `window.addEventListener('cfs-open-brand-onboarding')`
   en complément du URL param. Le bouton CTA dispatche un CustomEvent à chaque
   clic, ce qui force le re-render du Trigger même si URL n'a pas changé (cas
   double-clic) OU si useSearchParams n'est pas réactif.
2. Double cast nettoyé.
3. Logs `[onboarding]` aux étapes clés du trigger.
