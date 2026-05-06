# Sprint 19 — Module Programmer

## Objectif
Quand une publication est prête, l'utilisateur peut basculer en mode "Programmer" : trois onglets (Récap, Télécharger, Multi-canal). L'onglet Récap permet de fixer une date/heure et de programmer la publication.

## Fichiers créés
- `components/post-creator/Programmer.tsx` — composant client : récap (hook + angle + caption ou brief), input `datetime-local` (par défaut J+1 9h00), bouton "Programmer cette publication", confirmation textuelle. Onglets Télécharger et Multi-canal annoncent "Disponible bientôt".
- `audits/SPRINT_19_TEST.md`.

## Fichiers mis à jour
- `lib/posts/actions.ts` — ajoute `schedulePost(postId, scheduledFor: ISO)` qui met `status='scheduled'` + `scheduled_for=ISO` et revalide.
- `components/post-creator/PostCreatorLayout.tsx` — ajoute toggle Édition / Programmer dans l'en-tête, visible quand `status === 'ready'` ou `'scheduled'` (ou si un draft a déjà un hook ou un brief). Mode initial = `programmer` quand statut déjà `ready`/`scheduled`.
- `app/(app)/post-creator/[postId]/page.tsx` — récupère désormais `status` et `scheduled_for` et les passe au layout.

## Comportement attendu
1. Avant que la publication ne soit prête (statut `draft`/`in_progress` sans hook ni brief), aucun toggle ne s'affiche.
2. Dès que la publication a un hook ou un brief, le toggle Édition / Programmer apparaît.
3. À l'arrivée sur un post `status='ready'`, le mode `Programmer` s'ouvre automatiquement.
4. L'utilisateur fixe une date/heure puis "Programmer" → `schedulePost` → statut passe à `scheduled`, message de confirmation, redirection conservée (router.refresh).

## Sécurité / multi-tenant
- `schedulePost` ne fixe pas le brand_id (RLS s'en charge). Le post reste visible dans `posts` pour le bon tenant uniquement.
- Aucune écriture admin.

## À vérifier hors sandbox
- Le datetime-local en Safari iOS (UI native cohérente).
- Que le revalidatePath déclenche bien la mise à jour de `/calendrier` après programmation.

## Limites assumées
- Onglets Télécharger et Multi-canal sont volontairement vides ("Disponible bientôt") — Apple Pillar 6 (Uncompromising Polish) : aucune feature factice.
- Pas encore de notification d'échec spécifique si la date est dans le passé : à itérer si besoin.
