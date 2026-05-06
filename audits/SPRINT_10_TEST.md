# Sprint 10 — Test du coaching IA quotidien

## Principe

`/api/ai/coaching` (POST) génère le coaching du jour pour la marque
de l'utilisateur authentifié, puis l'insère dans `daily_coaching`.

- Modèle : `claude-opus-4-7`
- Idempotence : un seul coaching par `(brand_id, date)` (index unique)
- Caching : `VOICE_SHEET_RULES` + `COACHING_GENERATION_RULES` en `cache_control: ephemeral`
- Logging : `credits_usage` via service_role (estimation USD→EUR)

## Test 1 — Génération initiale

1. Aller sur `/aujourdhui` avec une marque dont le brand book est complet
2. Si aucun `daily_coaching` n'existe pour aujourd'hui :
   - `CoachingGenerator` doit s'afficher avec skeleton pulsant
   - Phrases douces qui défilent toutes les 3,5s
   - Après ~3-6s, la page se recharge automatiquement
   - `CoachingCard` affiche le texte généré + (si présent) le badge `Adapté à ton calendrier`

## Test 2 — Idempotence

1. Recharger `/aujourdhui` après une première génération
2. Vérifier qu'aucun nouvel appel API n'est fait
3. Vérifier en DB :
   ```sql
   select count(*) from daily_coaching
   where brand_id = '<brand>' and date = current_date;
   -- Attendu : 1
   ```

## Test 3 — JSON valide

L'API retourne `{ ok: true, coaching: { content: { text, suggestions[] }, ... } }`.

Si Claude renvoie autre chose qu'un JSON valide :
- HTTP 502 + `{ error: 'AI returned invalid JSON', raw: '...' }`
- Le `CoachingGenerator` affiche l'état d'erreur avec bouton "Réessayer"

## Test 4 — Logging crédits

```sql
select feature, model, tokens_input, tokens_output, cost_eur
from credits_usage
where feature = 'coaching'
order by created_at desc
limit 1;
```

Attendu : ligne récente avec `feature = 'coaching'`, tokens > 0, `cost_eur` > 0.

## Test 5 — Sans brand book

1. Créer un user dont la `brand` n'a pas encore de `brand_book`
2. Appeler `/aujourdhui`
3. La génération doit fonctionner avec un contexte minimal
   ("brand book non rempli") — le coaching restera générique mais
   ne doit pas crasher.

## Test 6 — Multi-tenant

1. Tenant A génère son coaching
2. Tenant B charge `/aujourdhui` → ne doit PAS voir le coaching de A
3. RLS sur `daily_coaching` filtre par `tenant_id`

## Variables d'environnement requises

- `ANTHROPIC_API_KEY` — clé Anthropic
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — pour `logCreditsUsage`
