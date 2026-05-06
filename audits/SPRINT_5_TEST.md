# Sprint 5 — Test de la route /api/ai/chat (streaming SSE)

## Principe

`app/api/ai/chat/route.ts` reçoit `{ messages }` en POST, charge le contexte
de marque du tenant depuis Supabase, et stream la réponse Claude Sonnet 4.6
en Server-Sent Events (`data: {"text":"..."}` puis `data: [DONE]`).

## Test 1 — Sanity check API Anthropic

Être connecté, puis :

```bash
curl http://localhost:3000/api/ai/test
```

Attendu :
```json
{ "ok": true, "response": "Bonjour.", "usage": { ... } }
```

Si `"ok": false` → vérifier `ANTHROPIC_API_KEY` dans `.env.local`.

## Test 2 — Route streaming

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Présente-toi en une phrase."}]}'
```

Attendu : flux SSE avec plusieurs lignes `data: {"text":"..."}` puis `data: [DONE]`.

Si `401` → la session cookie n'est pas transmise par curl. Tester depuis le browser ou ajouter `-b` avec les cookies de session.

## Test 3 — Respect du voice sheet

Le texte retourné doit :
- Être en sentence case
- Ne pas contenir d'emoji
- Ne pas contenir de "!"
- Ne pas utiliser "super", "génial", "post", "content"

## Test 4 — Contexte de marque injecté

1. Vérifier que la table `brands` a une entrée pour le tenant connecté
2. Envoyer : `{"messages":[{"role":"user","content":"Quelle est ma marque ?"}]}`
3. La réponse doit mentionner le nom de la marque du tenant

## Résultat obtenu

```
[à remplir après exécution des tests]
```

## Verdict

- [ ] GET /api/ai/test → réponse Claude valide
- [ ] POST /api/ai/chat → stream SSE fonctionnel
- [ ] Voice sheet respecté (sentence case, pas d'emoji ni de !)
- [ ] Contexte marque injecté depuis la DB
