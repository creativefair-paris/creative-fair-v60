# Screenshots Sprint 38

Les captures Playwright doivent être produites côté Lead (Mac local avec
session Supabase active). Le script `_capture.mjs` à la racine du dossier
sprint-38 est prêt à être exécuté :

```bash
cd /Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
npm run dev &  # Démarrer le dev server
# Une fois la session auth créée et exportée dans .auth.json :
STORAGE_STATE=./audits/sprint-38/.auth.json node audits/sprint-38/_capture.mjs
```

Pourquoi la session Claude Code ne capture pas :
- Pas de Supabase env actif dans le worktree isolé.
- Pas d'auth valide (les pages protégées renvoient 302 vers `/login`).
- Pas de browser binaries Playwright préinstallés.

Pour chaque page auditée, le fichier markdown correspondant indique en
en-tête `Screenshot : à produire côté Lead via _capture.mjs` et l'audit
est conduit sur lecture du code source uniquement (conformément à la
clause "Recoveries autonomes" de la spec Sprint 38).
