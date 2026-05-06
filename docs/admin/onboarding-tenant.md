# Onboarding d'un nouveau tenant

Procédure pour provisionner un nouveau client Creative Fair de zéro.
Réservée aux comptes admin (`creativefair@1922.studio`).

## Prérequis

- Avoir conduit la visio de cadrage avec le client.
- Disposer d'un brand book et calendrier business pré-remplis (voir
  modèles dans `seeds/`).
- Connaître l'email du futur owner du tenant.
- Avoir choisi le slug (URL identifier — minuscules, tirets).

## Procédure recommandée — via script

Pour un client B2B custom standard, le plus simple est de passer par
le script `scripts/configure-tenant.ts` :

1. Préparer 4 fichiers dans `seeds/` :
   - `seeds/<slug>-tenant.json` (name, slug, plan, ownerEmail)
   - `seeds/<slug>-theme.json`
   - `seeds/<slug>-brand-book.json`
   - `seeds/<slug>-business-calendar.json`

2. Lancer :
   ```bash
   npx tsx scripts/configure-tenant.ts <slug>
   ```

3. Le script :
   - Insère la ligne `tenants` (avec theme + plan).
   - Insère la ligne `brands` (avec brand_book + business_calendar +
     status `complete`).
   - Envoie une invitation email à l'owner.
   - Insère le profil owner.

4. Le client reçoit un email magic-link et peut se connecter.

## Procédure manuelle — via interface admin

Pour un B2C ou un client qui doit remplir lui-même son brand book :

1. Se connecter avec `creativefair@1922.studio`.
2. Aller sur `/admin/tenants`.
3. Cliquer « + Créer un tenant ».
4. Remplir nom, slug (auto-généré), plan, email owner.
5. Soumettre — le tenant est créé avec un thème par défaut.
6. Cliquer « Configurer » sur le tenant créé.
7. Onglet **Thème** → ajuster les couleurs.
8. Onglet **Brand book** → coller le JSON pré-rempli (ou laisser vide
   pour B2C qui se chargera de l'onboarding lui-même).
9. Onglet **Calendrier business** → coller le JSON.
10. Onglet **Utilisateurs** → vérifier l'invitation owner et inviter
    d'autres utilisateurs si besoin.

## Vérifications post-onboarding

- Le client a reçu son email d'invitation.
- En se connectant, il arrive sur `/aujourdhui` avec sa palette de
  couleurs.
- Le brand book affiche le statut **Complet** dans Ma marque (si
  pré-rempli).

## Cas particuliers

### Email déjà existant

Si l'email du futur owner est déjà associé à un autre tenant Creative
Fair, l'invitation échoue avec « User already registered » (P1 connu,
voir `audits/SPRINT_27_BUGS.md` #102). Solution V1 : utiliser un
alias email (ex : `prenom+marque@domaine.fr`) ou inviter le user
manuellement avec un autre rôle.

### Tenant à supprimer

La suppression de tenant n'est pas implémentée en V1. Pour désactiver
un tenant, modifier directement en base :
```sql
UPDATE tenants SET enabled_channels = '{}' WHERE slug = '...';
```
Une vraie procédure de suppression cascade est planifiée V2.
