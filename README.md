# Creative Fair

Conseiller en communication digitale pour les acteurs culturels et leurs
marques. Multi-tenant Next.js 16 + Supabase + Anthropic Claude.

Version V1 — taguée `v1.0.0`.

## Stack
- Next.js 16 (App Router)
- TypeScript strict
- TailwindCSS v4 + design Liquid Glass
- Supabase (PostgreSQL + Auth + Storage, RLS multi-tenant)
- Anthropic Claude API (Opus 4.7 + Sonnet 4.6)
- Vercel hosting

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

Ouvrir http://localhost:3000.

## Provisionner un client

```bash
npx tsx scripts/configure-tenant.ts <slug>
```

Le script lit `seeds/<slug>-{tenant,theme,brand-book,business-calendar}.json`
et provisionne le tenant ou met à jour sa configuration.

3 clients pré-configurés : `angelina`, `tous-en-tete`, `comptoir-general`.

## Documentation

- **Récapitulatif V1** : [skills/V1_RECAP.md](skills/V1_RECAP.md)
- **Architecture** : [skills/01-ARCHITECTURE.md](skills/01-ARCHITECTURE.md)
- **Voix de marque** : [skills/02-VOICE_SHEET.md](skills/02-VOICE_SHEET.md)
- **Multi-tenant** : [skills/03-MULTI_TENANT.md](skills/03-MULTI_TENANT.md)
- **Design system Liquid Glass** : [skills/04-DESIGN_SYSTEM.md](skills/04-DESIGN_SYSTEM.md)
- **Documentation utilisateur** : [docs/user/](docs/user/)
- **Documentation admin** : [docs/admin/](docs/admin/)
- **Roadmap V2** : [docs/roadmap-v2.md](docs/roadmap-v2.md)
- **Audits sprint par sprint** : [audits/](audits/)

## Skills de référence

Tous les documents de référence sont dans `/skills/`. Commencer par
`/skills/V1_RECAP.md` pour avoir l'image complète, puis
`/skills/00-MASTER.md` pour la table des matières détaillée.
