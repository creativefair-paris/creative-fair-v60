# Sprint 37.I — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.H.

---

## F77 — Cause 404 fiche post identifiée

### Diagnostic

Lecture de `app/(programme)/programme/posts/[postId]/page.tsx` :
```typescript
const { data: rawPost } = await supabase
  .from('posts')
  .select(
    'id, programme_id, pilier_nom, date_prevue, format, structure_type, objectif_editorial, angle, caption_complete, visuel_url, statut, titre',
  )
  .eq('id', postId)
  .maybeSingle()
const post = rawPost as PostRow | null
if (!post) notFound()
```

**Cause exacte** : Le SELECT inclut les colonnes `caption_complete` et
`visuel_url` ajoutées par la **migration 024 Sprint 37.E F58**. Si cette
migration n'a PAS été appliquée à la DB du runtime (cas reproduit chez
Lead), Supabase retourne `data: null` ET `error: { code: '42703' }`
("column does not exist"). Le code ignore `error` et ne regarde que `data`,
ce qui déclenche `notFound()` → HTTP 404 sur tous les posts.

L'`error` Supabase n'est jamais loggué, d'où le diagnostic difficile.

### Fix appliqué

1. **SELECT défensif** : split en 2 requêtes
   - Requête principale : seulement les colonnes garanties depuis Sprint 37.D F34 (format, structure_type, objectif_editorial) et antérieures
   - Requête secondaire optionnelle : `caption_complete + visuel_url`, tolérante à l'erreur
2. **Logging de l'erreur Supabase** : si `data` est null, on log `error?.message` + `error?.code` pour diagnostic futur
3. **Migration 024 idempotente** déjà en place. Reste à appliquer côté infra (Lead).

### Validation runtime

Cet environnement (worktree) n'a pas accès au dev server Vercel/Supabase
runtime. Le fix code est livré ; Lead doit confirmer en local :
```bash
curl -I http://localhost:3000/programme/posts/127c069c-1e00-4a7b-8445-d74792def3ed
# attendu : HTTP/1.1 200 OK
```
