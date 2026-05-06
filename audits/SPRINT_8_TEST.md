# Sprint 8 — Test génération brand book

## Principe

`/ma-marque/onboarding` propose 3 questions, 1 par écran. À la fin,
les réponses sont envoyées à `/api/ai/brand-book` qui :
1. Persiste les réponses dans `onboarding_answers`
2. Appelle Claude Opus 4.7 avec VOICE_SHEET_RULES + BRAND_BOOK_GENERATION_RULES
3. Parse le JSON retourné en BrandBook
4. Met à jour `brands.brand_book` et `brand_book_status = 'complete'`

## Test 1 — Onboarding 3 questions

1. Aller sur `/ma-marque/onboarding`
2. Voir 1/3 + question identité
3. Saisir une réponse, cliquer "Continuer"
4. Voir 2/3 + question audience
5. Saisir, "Continuer"
6. Voir 3/3 + question voix
7. Saisir, "Générer mon brand book"

## Test 2 — UX progressive

Pendant la génération :
- Voir le composant `BrandBookGeneration`
- Phrases qui évoluent toutes les 4s
- Skeleton pulsing

## Test 3 — Persistence onboarding_answers

```sql
select question_id, answer, source from onboarding_answers
where brand_id = '<id>' order by created_at;
```

Attendu : 3 lignes (identity, audience, voice), source = 'question',
answer = jsonb `{ "text": "..." }`.

## Test 4 — Brand book généré valide

```sql
select brand_book, brand_book_status from brands where id = '<id>';
```

Attendu :
- `brand_book_status = 'complete'`
- `brand_book` est un JSON valide avec les 7 clés (identity, voice,
  audience, territories, visual, taboos, goals)
- `territories` contient 5 à 7 entrées
- `voice.tone` est un array de 3 à 5 strings

## Test 5 — Redirection finale

Après génération réussie, redirect automatique vers `/ma-marque/brand-book`
qui affiche maintenant le brand book complet.

## Test 6 — Erreur de génération

Si l'IA renvoie un JSON invalide :
- Réponse 502 avec `{ error: "AI returned invalid JSON", raw: ... }`
- L'erreur s'affiche dans le formulaire d'onboarding
- Les réponses sont déjà persistées (pas de perte)

## Test 7 — Voice sheet respecté

Le brand book généré ne doit pas contenir :
- D'emoji
- De point d'exclamation
- Les mots interdits ("super", "génial", etc.)

## Verdict

- [ ] 3 questions affichées une par une
- [ ] Progress 1/3, 2/3, 3/3
- [ ] Phrases d'attente s'enchaînent pendant la génération
- [ ] Réponses sauvegardées dans `onboarding_answers`
- [ ] Brand book généré et persisté
- [ ] `brand_book_status` passe à 'complete'
- [ ] Redirect vers /ma-marque/brand-book à la fin
- [ ] Opus 4.7 utilisé (pas Sonnet)
- [ ] cache_control ephemeral sur le system prompt
