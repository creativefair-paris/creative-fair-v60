# Troubleshooting

Diagnostic des problèmes les plus courants côté admin.

## Le client ne reçoit pas son email d'invitation

1. Vérifier les spams.
2. Vérifier que le tenant a bien été créé : `SELECT * FROM profiles
   WHERE email = '<email>'`.
3. Si l'email existe mais qu'aucune invitation n'a été reçue : Supabase
   peut avoir rate-limité. Attendre 60s et renvoyer via l'onglet
   Utilisateurs.
4. Si l'email existe et que le profil pointe sur un autre tenant : cas
   conflit (V1 ne supporte pas un compte multi-tenant). Solution :
   utiliser un alias `prenom+marque@domaine.fr`.

## Le client se connecte mais voit le thème d'un autre tenant

Le thème est lu depuis `tenants.theme`. Vérifier :
- `SELECT slug, theme FROM tenants WHERE id = (SELECT tenant_id FROM
  profiles WHERE email = '<email>')`
- Que le thème est bien stocké avec la palette voulue.

Si la palette est correcte mais l'interface affiche le défaut : forcer
le rechargement (`Cmd+Shift+R`). Le contexte React peut conserver une
version stale après l'invitation.

## L'IA ignore le brand book

Symptôme : les générations IA (coaching, posts, conseiller) utilisent
un ton générique.

Vérifier :
1. `SELECT brand_book_status FROM brands WHERE tenant_id = ...` →
   doit être `complete`.
2. `SELECT brand_book FROM brands WHERE tenant_id = ...` → ne doit
   pas être null.
3. Si statut = `incomplete` mais brand_book non null : forcer
   `UPDATE brands SET brand_book_status = 'complete' WHERE id = ...`
   ou éditer via l'interface admin (l'enregistrement marque
   automatiquement le statut).

## Un post reste en `in_progress`

Le client a fermé Post Creator avant d'arriver à l'étape finale. Le
post reste en brouillon. Il peut le retrouver dans le calendrier (si
date programmée) ou via la liste des posts.

Pour forcer la suppression :
```sql
DELETE FROM posts WHERE id = '...' AND tenant_id = '...' AND status = 'in_progress';
```

## Les crédits ne se décomptent pas

Vérifier :
1. `SELECT * FROM credits_usage WHERE tenant_id = '...' ORDER BY
   created_at DESC LIMIT 10` → doit contenir des entrées récentes.
2. Si la table est vide : un appel IA a échoué silencieusement. Vérifier
   les logs Supabase Functions et les logs Anthropic.

## L'Anecdote live retourne 502

Cas connu (P1 ouvert, voir `SPRINT_27_BUGS.md` #101) : l'outil
`web_search_20250305` n'est pas activé sur le compte Anthropic.

Solution V1 : demander au client d'utiliser **Anecdote custom** à la
place et de saisir lui-même son actualité.

## Le streaming Conseiller s'interrompt

Cas connu (P1 ouvert, voir `SPRINT_27_BUGS.md` #103) : timeouts
serverless Vercel.

Solution V1 : encourager les réponses courtes côté prompt, ou ajouter
`maxDuration = 60` à la route si plan Vercel le permet.

## Logs et observabilité

V1 :
- **Logs Supabase** : auth events + db errors → console
  `supabase.com/dashboard/<project>/logs`.
- **Logs Anthropic** : usage par clé API → `console.anthropic.com`.
- **Logs Next.js** : Vercel logs côté production.

V2 prévue : Sentry runtime, métriques business par tenant.
