# Sprint 37.G — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.F.

---

## F67 — Cause identifiée (3e tentative)

### Diagnostic console fourni par Lead
```
[onboarding] event received {phase: 'idle'}          ← line 48
[onboarding] trigger fired, loading…                 ← line 80
[onboarding] event received {phase: 'loading'}       ← line 48
```

Phase passe à 'loading' mais ne va JAMAIS à 'sheet' ou 'resume-choice'.

### Cause exacte

`components/onboarding-marque/BrandOnboardingTrigger.tsx` ligne 102 — bug
React classique de "self-cancelling effect" :

```typescript
useEffect(() => {
  if (!triggered || phase.kind !== 'idle') return
  let cancelled = false
  ;(async () => {
    setPhase({ kind: 'loading' })   // ← TRIGGERS RE-RUN du même effet
    const resumable = await getResumableBrandOnboardingSession()
    if (cancelled) return            // ← VRAI car cleanup a posé cancelled=true
    ...
  })()
  return () => {
    cancelled = true                 // ← le cleanup pose cancelled=true
  }
}, [triggered, phase.kind])          // ← phase.kind dans deps = trigger cleanup
```

Séquence :
1. Premier rendu : `triggered=true`, `phase.kind='idle'` → effet s'exécute, async IIFE démarre, `setPhase('loading')` enqueue.
2. React applique le setState : `phase.kind` passe à `'loading'`.
3. Les deps `[triggered, phase.kind]` ont changé → React appelle le **cleanup de l'effet précédent** → `cancelled = true`.
4. L'effet re-fire, mais le guard `phase.kind !== 'idle'` retourne tôt (pas de nouveau async).
5. L'await initial dans l'IIFE résout → `if (cancelled) return` → **on n'atteint jamais le `setPhase({ kind: 'sheet' })`**.

Le phase reste donc bloqué en `'loading'` pour toujours.

Le second `event received {phase: 'loading'}` du log est probablement React StrictMode dev qui re-mount, ou un second clic du tester — non lié au bug racine.

### Fix appliqué

Retirer `phase.kind` des dépendances de l'effet. Le check `phase.kind !== 'idle'`
au début de l'effet reste actif (lu via closure), mais l'effet ne se re-fire
pas quand le phase change → pas de cleanup intempestif → l'IIFE async termine
proprement et appelle `setPhase({ kind: 'sheet' })`.

Logs structurés ajoutés à chaque étape (`before_resumable`, `before_create`,
`server_returned`, `phase_set_to_sheet`) pour future investigation si bug
revient.

### Test de validation

Comportement attendu après fix :
1. Click "Lancer un onboarding guidé" → CustomEvent
2. `[onboarding] event received {phase: 'idle'}`
3. `[onboarding] trigger fired, loading…`
4. `[onboarding] before_resumable`
5. `[onboarding] server_returned` (resumable found OU new session created)
6. `[onboarding] phase_set_to_sheet {id: '...'}`
7. La BrandOnboardingSheet apparaît à l'écran.
