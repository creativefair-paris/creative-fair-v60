# Sprint 21 — Suggestions contextuelles

## Objectif
Ajouter une primitive de suggestion contextuelle, déclenchée par l'état réel de l'utilisateur (pas par l'IA). Premier point d'application : page Aujourd'hui.

## Fichier créé
- `components/ui/ContextualSuggestion.tsx` — composant client avec titre, corps, CTA (Link interne), bouton X de masquage. Persistance via `localStorage` (clé optionnelle `storageKey`) pour ne pas réafficher après dismiss.

## Fichier mis à jour
- `app/(app)/aujourdhui/page.tsx` — récupère `brand_book_status` et compte des publications prévues sur 7 jours. Affiche :
  1. Suggestion "Ton brand book n'est pas complet" si `brand_book_status === 'incomplete'`.
  2. Sinon, suggestion "Aucune publication prévue cette semaine" si `upcomingPostsCount === 0`.

## Stratégie
- **Pas d'IA** : la suggestion dépend uniquement de l'état observable.
- **Pas de duplication** : Ma marque montre déjà l'état "incomplet" sur sa page d'index ; ici on l'amène à l'attention sur la home, mais une seule des deux conditions s'affiche à la fois.
- **Réversible** : un clic sur X enregistre `dismissed` en localStorage, plus de réaffichage tant que la clé existe.

## À vérifier hors sandbox
- Que le `count` Supabase fonctionne avec RLS (devrait).
- Que la suggestion ne réapparaît pas après dismiss (localStorage persistant).
- Que la mise à jour du brand_book_status à `complete` fait disparaître la première suggestion au prochain rendu.

## Limites assumées
- Pas de suggestion sur Post Creator (post draft >3 jours) : nécessiterait une lecture serveur côté layout post-creator. À itérer.
- Pas de suggestion sur Calendar : déjà couvert par `SuggestionsPanel` (Sprint 13).
- Pas de suggestion sur le Conseiller : pas d'état naturel à signaler.
