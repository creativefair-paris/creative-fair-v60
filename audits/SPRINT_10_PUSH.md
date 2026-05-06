# Sprint 10 — Notification push PWA (à configurer plus tard)

## État

Pas configuré dans ce sprint. À planifier après le Sprint 26 (Liquid Glass + stabilisation produit).

## Pourquoi pas maintenant

La notification push à 8h chaque matin nécessite :
- Un service worker PWA configuré
- Un cron côté serveur (Supabase pg_cron ou Vercel Cron) qui :
  1. Génère les coachings du jour pour tous les tenants actifs
  2. Pousse une notification web push au navigateur du dirigeant
- L'enregistrement explicite du device avec `Notification.requestPermission()` puis `pushManager.subscribe()` lors de l'onboarding

Tant que le produit n'est pas stable côté UX et que la beta est restreinte, on génère le coaching **au premier chargement** de la page Aujourd'hui (lazy generation côté client).

## Comportement actuel (Sprint 10)

1. Page Aujourd'hui chargée
2. Server component lit `daily_coaching` (today, current brand)
3. Si présent → `CoachingCard` (card finale)
4. Si absent → `CoachingGenerator` (client) :
   - Auto-trigger `POST /api/ai/coaching` au mount
   - Skeleton + phrases douces pendant la génération (Opus 4.7, ~3-6 s)
   - À la réussite : `router.refresh()` → la page recharge avec la card finale

## Ce qu'il faudra ajouter (post-Sprint 26)

1. Cron pg_cron quotidien (UTC 06:00 = 08:00 Paris en hiver) :

   ```sql
   select cron.schedule(
     'daily-coaching-generation',
     '0 6 * * *',
     $$ select net.http_post(
          url := 'https://<host>/api/cron/daily-coaching',
          headers := jsonb_build_object('x-cron-secret', '<secret>')
        ) $$
   );
   ```

2. Endpoint `/api/cron/daily-coaching` qui :
   - Vérifie le header `x-cron-secret`
   - Liste les brands actives
   - Pour chaque brand : génère + insert dans `daily_coaching`
   - Pour chaque user du tenant : envoie une push notification

3. Côté client : enregistrement web push + service worker + manifest PWA

4. UI : CTA "Recevoir mon coaching à 8h" dans `/mon-compte`

## Décision

À ne pas faire maintenant. Documenter ici pour ne pas oublier. La génération lazy actuelle est suffisante pour la beta restreinte.
