# Éditer un tenant

Modifications de configuration d'un tenant déjà provisionné.

## Accès

`/admin/tenants/<slug>` — uniquement pour
`creativefair@1922.studio`.

## Onglet Thème

Permet d'ajuster :

- Sept couleurs (background, surface, text, textMuted, border, accent,
  accentForeground).
- Trois polices (display, body, mono).

Aperçu live à droite. Enregistrer applique au tenant immédiatement.

## Onglet Brand book

Édition JSON brute. Le format attendu suit le type `BrandBook` défini
dans `types/brand-book.ts` :

```json
{
  "identity": { "name": "...", "domain": "...", ... },
  "voice": { "tone": [...], "register": "casual|formal|mixed", ... },
  "audience": { "personas": [...], ... },
  "territories": [...],
  "visual": { "colors": [...], "fonts": [...], ... },
  "taboos": [...],
  "goals": { "primary": "...", "instagram": "..." }
}
```

L'enregistrement marque automatiquement le statut comme **complete**.

Le bouton « Reformater » indente proprement le JSON. Si le JSON est
invalide, une erreur s'affiche sans toucher la base.

## Onglet Calendrier business

Édition JSON brute, format `BusinessCalendar` (`types/business-calendar.ts`) :

```json
{
  "recurringEvents": [...],
  "upcomingLaunches": [...],
  "seasonality": [...],
  "industryEvents": [...]
}
```

Les quatre tableaux sont obligatoires (peuvent être vides).

## Onglet Utilisateurs

- Liste des profils du tenant (email, rôle).
- Formulaire d'invitation : email + rôle (owner / admin / member).
- L'invitation envoie un magic-link et crée le profil avec le rôle
  choisi.

## Modifier en masse via script

Pour pousser une mise à jour cohérente (ex : nouvelle saison de
calendrier business sur 3 tenants), passer par
`scripts/configure-tenant.ts` :

1. Mettre à jour le fichier `seeds/<slug>-business-calendar.json`.
2. Lancer `npx tsx scripts/configure-tenant.ts <slug>`.
3. Le script détecte le tenant existant et met à jour theme +
   brand_book + business_calendar.

## Bonne pratique

Les éditions JSON brutes sont puissantes mais risquées : un point-
virgule oublié et le formulaire refuse. Prévoir de copier-coller
depuis votre éditeur de texte plutôt que d'éditer dans le textarea du
navigateur.

V2 prévoit une UI graphique pour brand book et calendrier business.
