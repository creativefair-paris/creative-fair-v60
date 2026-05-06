# Sprint 1 — Test multi-tenant (à compléter)

> À remplir **après** application des 3 migrations sur Supabase
> et exécution du test script.

## Procédure

```bash
cd /Users/ulysselemoine/Desktop/creative-fair-v60
npx tsx scripts/test-multi-tenant.ts
```

## Résultat attendu

```
Sprint 1 — Multi-tenant isolation test
Suffix: <timestamp>

→ Provisioning tenant A…
  ✓ tenant <uuid>, user <uuid>, brand <uuid>
→ Provisioning tenant B…
  ✓ tenant <uuid>, user <uuid>, brand <uuid>

=== Test 1: user A reads ONLY their own brand ===
  ✓ user A sees exactly their brand

=== Test 2: user A CANNOT read brand B ===
  ✓ user A cannot see brand B

=== Test 3: user B reads ONLY their own brand ===
  ✓ user B sees exactly their brand

=== Test 4: user B CANNOT read brand A ===
  ✓ user B cannot see brand A

=== Test 5: user A CANNOT insert brand into tenant B ===
  ✓ insert blocked: <message>

→ Cleaning up…
  ✓ cleaned

Result: 5 passed, 0 failed
```

## Résultat obtenu

```
[à coller ici après exécution]
```

## Verdict

- [ ] 5/5 tests passés → multi-tenant validé, on peut continuer Sprint 2
- [ ] Au moins 1 test échoué → blocage, voir `SPRINT_1_BLOCAGE.md`

## Si un test échoue

1. **Ne pas continuer le Sprint 1.**
2. Documenter le scénario qui a fuité dans `audits/SPRINT_1_BLOCAGE.md`.
3. Vérifier que `auth.user_tenant_id()` est bien créée :
   ```sql
   select pg_get_functiondef('auth.user_tenant_id'::regproc);
   ```
4. Vérifier que RLS est active sur la table qui fuit :
   ```sql
   select tablename, rowsecurity
   from pg_tables
   where schemaname = 'public';
   ```
5. Lister les policies sur la table qui fuit :
   ```sql
   select * from pg_policies where tablename = '<table>';
   ```
6. Préviens Ulysse avant toute modification.
