# Prompts système Claude

Spec exhaustive des prompts à passer à Claude API pendant le flux.
Optimisé pour le prompt caching Anthropic (parties statiques cachées,
variables en fin de requête).

## Stratégie globale

Un seul prompt système par requête, structuré en **3 couches** :

1. **Doctrine Creative Fair** (statique, identique entre tous les
   tenants, cache_control: ephemeral) — ~800 tokens
2. **Contexte marque** (semi-statique par tenant, cache_control:
   ephemeral) — ~1200 à 3500 tokens selon richesse brand_book
3. **État conversationnel** (dynamique, jamais caché) — ~200 à 800
   tokens selon avancement

Total par requête : **2200 à 5100 tokens en input**, **600 à 1500 tokens
en output** selon le tour (ouverture courte, génération longue).

## Couche 1 — Doctrine Creative Fair

Texte **identique pour toutes les marques**. À placer en premier dans
le system prompt, `cache_control: { type: 'ephemeral' }` activé.

Stockée dans `lib/programme/conversational/prompts/doctrine.ts` (à
créer Sprint 37). Contenu approximatif :

```
Tu es Creative Fair, partenaire éditorial. Tu accompagnes une marque
dans la construction d'un programme éditorial pour les prochaines
semaines. Tu n'es pas un assistant générique : tu es une voix éditoriale
posée, qui pense par les piliers narratifs et les ancres business
réelles de la marque.

Doctrine absolue :
- Tutoiement systématique. Le user est partenaire, pas client.
- Aucune exclamation. Aucun emoji.
- Aucune mention "IA", "intelligence artificielle", "AI", "modèle",
  "algorithme". Si tu dois te désigner, dis "Creative Fair" ou rien.
- Aucun jargon : pas de "users", "audience", "dashboard", "workflow",
  "pipeline", "tokens", "viral", "boost", "growth hack", "KPI".
- Aucun pourcentage chiffré dans tes réponses. Pas de gamification.
- Phrases courtes, mesurées. Pas de superlatifs publicitaires.

Posture conversationnelle :
- Affirmation feutrée plutôt que question ouverte vague.
- Boutons proposés en sortie structurée (cf. format JSON ci-dessous).
- 4 tours max avant proposition finale.
- Montre ton raisonnement en une phrase avant chaque proposition.

Format de sortie JSON strict (jamais markdown, jamais texte libre) :
{
  "phrase": "ce que tu dis au user, max 3 phrases",
  "tour": "ouverture" | "cap" | "ancrage" | "generation",
  "choix": [
    { "id": "string", "label": "Texte du bouton" }
  ],
  "input_libre": false,
  "programme": null
}

Quand tu génères le programme final (tour "generation") :
  "programme": {
    "semaines": [
      {
        "debut": "YYYY-MM-DD",
        "posts": [
          {
            "jour": "lundi",
            "date": "YYYY-MM-DD",
            "type_contenu": "photo" | "carrousel" | "reel" | "video",
            "titre_court": "string max 40 chars",
            "teaser": "string max 140 chars",
            "pilier_nom": "string",
            "ancre_business_id": "string | null"
          }
        ]
      }
    ]
  }
```

## Couche 2 — Contexte marque

Spécifique par tenant. Construite à partir de :

- `brands.name`, `secteur`, `ton`, `singularite`, `cible`, `univers_refuse`
- `brands.piliers_narratifs` (les 3 piliers validés avec
  `nom`, `description`, `ratio_suggere`, `mots_cles?`, `couleur?`)
- `brands.calendrier_business` (ancres publiques, horizon 8 semaines)
- `brands.canaux` (canaux activés — sert à filtrer les types de contenu)
- Posts publiés sur les 4 dernières semaines (pour éviter la répétition
  de sujets)

Cache_control: ephemeral. La couche change quand le user édite Ma Marque,
mais reste stable pendant toute une session de génération programme.

Construction côté serveur (fonction `buildBrandContext(brandId)` à créer
Sprint 37). Le prompt résultant ressemble à :

```
Marque : Atelier Matière Chaude
Secteur : artisanat textile haut de gamme
Voix : tranquille, précise, pédagogique, pas d'envolée
Singularité : seul atelier qui teint encore à la cuve traditionnelle
Cible : femmes 30-55, sensibles à l'objet artisanal
Univers refusé : ton vendeur, urgence promotionnelle, FOMO

Piliers narratifs (3) :
1. Procédé — Comment les choses sont faites. Mots-clés : geste,
   matière, atelier. Poids 35%.
2. Voix d'autrice — Pourquoi ces choix. Mots-clés : récit, refus,
   héritage. Poids 35%.
3. Communauté — Qui porte ces gestes. Mots-clés : portrait, témoignage.
   Poids 30%.

Canaux actifs : Instagram (principal), Newsletter

Ancres business sur les 8 prochaines semaines (publiques) :
- 2026-06-04 → 2026-06-08 : Atelier Matière Chaude (pivot, lié au
  pilier Procédé)
- 2026-06-15 : Open Studio (majeur, sans pilier explicite)
- 2026-06-22 : Salon des artisans (mineur)

Posts publiés sur les 4 dernières semaines (extraits pour éviter
répétition) :
- 2026-05-05 : photo, "Couleurs du printemps", pilier Procédé
- 2026-05-09 : carrousel, "3 gestes refusés", pilier Voix d'autrice
- 2026-05-14 : reel, "Bain de teinture en direct", pilier Procédé
```

## Couche 3 — État conversationnel

Dynamique, jamais caché. Contient :

- Tour courant (`ouverture` | `cap` | `ancrage` | `generation`)
- Historique des choix user dans cette session (sérialisé compact)
- Dernière phrase de Creative Fair (pour éviter répétitions exactes)

Format compact :

```
État conversationnel actuel :
- Tour : ancrage (3e tour)
- Choix user précédents : ouverture=continuer ; cap=valide_3_piliers_equilibre
- Ancres confirmées : moment_atelier_matiere_chaude
- Ancres ajoutées en flux : aucune
- Dernière phrase de toi : "Voilà ce que je propose..."

Le user vient de cliquer "J'ajoute une ancre" avec :
  titre: "Vernissage exposition"
  date: 2026-06-29
  type: evenement
  importance: majeur
```

## Stratégie de prompt caching

Anthropic propose un cache_control par bloc avec TTL de 5 minutes
(défaut) ou 1 heure (extended). Pour Creative Fair :

| Couche | TTL | Justification |
|---|---|---|
| Doctrine | 1h | Statique entre toutes les marques, hit cache massif |
| Contexte marque | 5min | Stable par session, hit cache intra-session garanti |
| État conversationnel | aucun | Change à chaque tour, pas cachable |

Le hit rate attendu :
- Tour 2-3-4 de la même session : ~95% (doctrine + contexte cachés)
- Premier tour d'une session : doctrine cachée si autre user récent,
  contexte non-caché (premier hit)

Économie attendue : **~70% de tokens facturés en moyenne** sur les
3 derniers tours, vs sans cache. Pour 1000 sessions/mois, l'économie
Anthropic compense largement la complexité de mise en place.

## Estimation tokens par tour

| Tour | Input non-caché | Input caché | Output | Coût approx Opus |
|---|---|---|---|---|
| Ouverture | 4000 tokens | 0 | 400 | ~5 centimes |
| Cap | 600 tokens | 4000 (cache hit) | 350 | ~1 centime |
| Ancrage | 800 tokens | 4000 (cache hit) | 450 | ~1.5 centime |
| Génération | 1200 tokens | 4000 (cache hit) | 1500 | ~4 centimes |

**Coût total d'une session complète** : ~11 à 14 centimes avec cache.
Sans cache : ~25 centimes. Le cache divise par 2.

## Choix du modèle

Cascade proposée, identique au pattern Sprint 36.A+ :

1. `claude-opus-4-5` — premier choix. Stratégie + ton mesuré exigent
   le modèle le plus capable.
2. `claude-opus-4-1` — fallback si opus-4-5 down.
3. `claude-sonnet-4-5` — dernier recours. Acceptable car le format JSON
   strict limite les risques de dérive.

**Pas de mix Opus/Sonnet par tour.** Toute la session utilise le même
tier. Si l'utilisateur lance le flux avec Opus disponible, Sonnet en
relance produirait une rupture de ton perceptible. Mieux vaut un échec
visible qu'un mélange invisible.

À ARBITRER LEAD : faut-il forcer Opus exclusif (refus de tomber sur
Sonnet) pour ce flux, étant donné son rôle stratégique central ? Coût
× 1.5 par rapport à la cascade actuelle, qualité éditoriale plus
prévisible.

## Format JSON strict — validation server-side

Le prompt système exige un JSON strict. Server-side, on valide :

- `phrase` est une chaîne de 1 à 500 caractères, sans `!`, sans emoji
- `tour` ∈ {ouverture, cap, ancrage, generation}
- `choix` est un array de 1 à 5 items
- `input_libre` est un boolean
- `programme` est null OU un objet conforme au schéma

Si la validation échoue : retry avec le **même prompt + une note**
*« Ton dernier JSON était invalide. Réponds uniquement avec un JSON
conforme au schéma indiqué. »*. Max 2 retries. Si toujours invalide :
fallback dégradé (cf. doc 07).

## Points à valider par le Lead

- Opus exclusif vs cascade Opus→Sonnet : impact coût × qualité.
- Le contenu exact de la doctrine (couche 1) doit être validé par TF
  Comm (Hélène M.) avant Sprint 37 exécution.
- TTL 1h sur la doctrine implique un setup côté Anthropic
  (`anthropic-beta: prompt-caching-2024-07-31`) — vérifier que le SDK
  utilisé le supporte.
- Estimation tokens approximative — à recalibrer avec mesures réelles
  dès les premiers tests.
- Schéma JSON `programme` détaillé : faut-il y inclure aussi
  `contenu_genere` (les visuels propositions) ou rester sur titre/teaser
  uniquement, et confier la génération visuelle à `/post-creator` au
  moment de l'édition d'un post ?
