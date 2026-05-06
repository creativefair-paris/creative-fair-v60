# Sprint 2 — Configuration Supabase (actions manuelles)

## 1. Configurer les Redirect URLs

Supabase bloque les redirections vers des URLs non autorisées.
Il faut whitelist les deux URLs de callback.

1. Ouvrir https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq
2. **Authentication > URL Configuration**
3. Dans **Redirect URLs**, ajouter :
   ```
   http://localhost:3000/auth/callback
   https://creative-fair-v60.vercel.app/auth/callback
   ```
4. **Save**

Note : le callback est à `/auth/callback` (pas `/(auth)/callback` — le
route group n'affecte pas l'URL, mais `/auth/callback` est un dossier
propre hors groupe, ce qui donne l'URL `/auth/callback`).

## 2. Configurer le Site URL

Dans la même page **Authentication > URL Configuration** :

- **Site URL** : `https://creative-fair-v60.vercel.app`
- Pour le dev local, laisser `http://localhost:3000`

## 3. Vérifier l'envoi des emails magic link

Supabase a une limite d'envoi par défaut (3 emails/heure en plan gratuit).
Pour les tests, vérifier dans **Authentication > Logs** que les emails partent.

Si les emails n'arrivent pas :
- Vérifier les spams
- Vérifier les logs Supabase : **Authentication > Logs > Email**
- En plan gratuit, Supabase utilise son propre SMTP — suffisant pour les tests

Pour la production : configurer un SMTP custom dans
**Authentication > Email** (Resend, Postmark, etc.).

## 4. Créer un profil de test manuellement

Pour tester le flow complet (login → /aujourdhui avec données user) :

1. Créer un user auth dans **Authentication > Users** :
   - Email : ton email
   - **Auto Confirm User** : oui (pour ne pas attendre le lien)
2. Lier ce user à un tenant existant dans le SQL Editor :
   ```sql
   insert into profiles (id, tenant_id, email, role)
   select
     '<user-id-depuis-auth-users>',
     id,
     '<ton-email>',
     'owner'
   from tenants
   where slug = 'angelina';  -- ou tousentete, comptoir
   ```
3. Tester le magic link : envoyer un lien à ton email, cliquer, arriver sur /aujourdhui

## 5. Vérifier le flow complet

```
1. http://localhost:3000/login
2. Entrer l'email du user créé en étape 4
3. Cliquer "Recevoir mon lien de connexion"
4. Page de confirmation affichée
5. Ouvrir l'email, cliquer le lien
6. Redirect vers http://localhost:3000/auth/callback?code=...
7. Échange du code → session créée
8. Redirect vers /aujourdhui avec "Bonjour [prénom]"
9. Aller sur http://localhost:3000/calendar → redirect /login ✓
10. http://localhost:3000/logout → redirect /login ✓
```
