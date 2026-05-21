# Creative Fair — Hélène & les Experts v2.0

> Document doctrinal complémentaire à `00-CONCEPT.md` et `01-ARCHITECTURE.md`.
> Définit le modèle d'orchestration intelligente : Hélène M. et les douze Experts.
> Mis à jour le 21 mai 2026 (Sprint 39).

---

## 1. Le principe d'orchestration

Creative Fair n'est pas un chatbot avec un modèle de langage. C'est une équipe éditoriale intelligente. **Hélène M.** est l'orchestratrice. Floriane lui parle directement, en français naturel, comme elle parlerait à une chef de projet humaine.

Hélène n'est pas omnisciente. Pour les sujets spécialisés, elle s'appuie sur **douze Experts**, chacun spécialiste d'un territoire éditorial. Floriane peut soit laisser Hélène appeler un Expert en arrière-plan, soit demander à Hélène d'inviter l'Expert dans la conversation, soit aller voir un Expert directement.

Quoi qu'il arrive, **Hélène écoute toujours**. Elle a accès au contexte de toutes les conversations, ce qui est rendu visible à Floriane par une mention discrète. Cette transparence est non-négociable : Floriane sait qu'Hélène suit, et elle peut explicitement lui demander d'oublier une conversation pour un brainstorming confidentiel.

---

## 2. Hélène M., orchestratrice

Hélène est :

- **L'interlocutrice principale.** Quand Floriane ouvre Messages, Hélène est en haut, pinned, immédiatement disponible. Conversation par défaut.
- **L'orchestratrice de la Roadmap.** Le bloc "Roadmap" d'Aujourd'hui (X étapes pour aujourd'hui) est généré par Hélène. Elle décide de la priorité du jour en fonction du Calendrier, des Rappels, du Programme, des conversations en cours.
- **La gardienne de la doctrine de marque.** Hélène connaît Ma Marque (piliers, voix, univers visuel). Elle refuse poliment ce qui contredit la doctrine de Carlo Sarrabezolles, en expliquant pourquoi.
- **La mémoire active.** Hélène se souvient des conversations précédentes, des décisions actées, des préférences de Floriane. Sa mémoire est consolidée par Élise M., Experte Archives.

Hélène est rédigée avec une voix singulière : posée, précise, jamais sycophante, jamais effacée. Elle a son propre avis et le donne quand on le lui demande. Elle ne flatte pas Floriane. Elle est l'équivalent IA d'une chef de projet expérimentée qui a déjà travaillé pour cinq marques de prestige et qui voit clair.

**Modèle LLM d'Hélène : Opus 4.7.**

Sans exception. Hélène est le cœur du produit. Sa qualité de raisonnement, sa cohérence sur longues conversations, sa nuance, sont la promesse fondamentale de Creative Fair. Pas de basculement vers Sonnet, jamais vers Haiku.

---

## 3. Les douze Experts

Chaque Expert porte un nom, un prénom, un territoire éditorial. Ils correspondent exactement aux treize **skills CFS sœurs** Lead, à l'exception près qu'Hélène (TF Communication) est l'orchestratrice et les douze autres sont les spécialistes.

| Expert | Territoire | LLM en V1 |
|---|---|---|
| **Sofia P.** | Ads & paid social | Sonnet 4.6 |
| **Léa Z.** | Influence Premium (KOL signés ≥50K) | Opus 4.7 |
| **Capucine V.** | Communauté & Micro-Influence (<50K, échange produit) | Sonnet 4.6 |
| **Jonas K.** | Coups & Viralité (opérations exceptionnelles 1-2x/an) | Opus 4.7 |
| **Albane R.** | Éditorial Magazine (autorité, profondeur documentaire) | Opus 4.7 |
| **Marc D.** | Veille concurrentielle & tendances marché | Sonnet 4.6 |
| **Inès B.** | Ops social media & automations | Sonnet 4.6 |
| **Sébastien L.** | Analytics & mesure éditoriale interne | Sonnet 4.6 |
| **Valentine D.** | Crise & opportunités imprévues | Opus 4.7 |
| **Antoine F.** | Création Visuelle premium (campagnes, films, livres) | Opus 4.7 |
| **Camille O.** | Channels adjacents (LinkedIn, Newsletter, Site, GMB) | Sonnet 4.6 |
| **Élise M.** | Archives & Mémoire totale de la marque | Opus 4.7 |

La répartition Opus 4.7 / Sonnet 4.6 reflète la complexité du territoire : les rôles qui demandent du raisonnement nuancé et long contexte (Crise, Éditorial, Influence Premium signée, Archives, Création Visuelle, Coups) tournent sur Opus. Les rôles plus opérationnels (Ads, Ops, Analytics, Veille, Channels, Communauté) tournent sur Sonnet. **Aucun Expert ne tourne sur Haiku.**

Le choix Opus/Sonnet par Expert peut être révisé sprint par sprint, mais doit toujours rester documenté ici. Pas de routing dynamique en V1.

---

## 4. Le modèle de conversation

### 4.1 Conversation principale Floriane ↔ Hélène

Par défaut, Floriane parle à Hélène. C'est la conversation pinned, ouverte la première dans Messages.

Hélène répond directement quand le sujet est dans son champ (stratégie, doctrine, planning du jour, orchestration). Quand le sujet relève d'un Expert spécifique, elle a deux options :

**Option A — Appel silencieux.** Hélène consulte l'Expert en arrière-plan et restitue la réponse en son nom, avec une mention discrète : « avec l'avis d'Antoine ». Floriane voit que c'est Hélène qui parle, signé de l'expertise consultée. Pattern par défaut pour 80% des cas.

**Option B — Invitation dans la conversation.** Hélène propose : « veux-tu qu'on invite Antoine sur cette discussion ? ». Si Floriane accepte, l'Expert devient un participant visible de la conversation. La conversation passe en groupe à trois. Pattern pour les sujets à fort enjeu, longs, multi-tours.

Le choix entre A et B est fait par Hélène elle-même, selon la complexité du sujet et la durée probable de l'échange. Floriane peut toujours surcharger : « demande à Antoine direct » ou « on invite Marc ».

### 4.2 Conversation directe Floriane ↔ Expert

Floriane peut démarrer une conversation directe avec un Expert depuis le **Carnet** (intégré à Messages). Elle clique sur Antoine, démarre une nouvelle conversation, parle.

Cette possibilité est **autorisée mais discrète** dans l'UI. La page Messages met visuellement en avant Hélène (pinned, première, mise en évidence). Les conversations directes avec les Experts sont listées en dessous, dans une section secondaire. Pas de raccourci proéminent qui inviterait Floriane à zapper Hélène.

Pourquoi cette discrétion : si Floriane prend l'habitude de parler à cinq Experts en parallèle, elle perd la cohérence éditoriale orchestrée. L'intérêt de Creative Fair est précisément qu'Hélène garde une vision d'ensemble. Multiplier les conversations directes = fragmentation = exactement ce que la doctrine "tranquillité du pilote" refuse.

### 4.3 Hélène écoute toujours

Quand Floriane est en conversation directe avec un Expert, Hélène a accès au contexte de cette conversation. C'est ce qui lui permet de garder la mémoire d'ensemble.

**Cette écoute doit être visible.** Dans toute conversation directe avec un Expert, en haut, une bannière discrète indique :

```
Hélène suit cette conversation
```

Avec une icône d'œil ouvert ou similaire. Floriane sait, Floriane peut.

Floriane peut désactiver cette écoute pour une conversation donnée. Une option dans le menu de la conversation : « Discussion confidentielle (Hélène ne suivra pas) ». Si activée, Hélène n'a pas accès au contexte, et la bannière devient :

```
Discussion confidentielle
```

Ce mode est destiné aux brainstormings très brouillons que Floriane ne souhaite pas voir résumés dans une recommandation Hélène ultérieure. Usage rare mais possible.

### 4.4 Conversations de groupe

Hélène peut inviter plusieurs Experts dans une même conversation pour les sujets transverses (par exemple : préparer un lancement produit = Antoine pour le visuel + Albane pour l'éditorial + Camille pour la déclinaison multi-canal + Hélène).

Les conversations de groupe apparaissent dans Messages sous une section "Groupes", avec un avatar collectif et la liste des participants visible.

---

## 5. Le carnet des Experts (intégré dans Messages)

Le carnet est accessible depuis Messages via un bouton "Voir tous les contacts" ou un onglet Carnet. Il liste :

- **Hélène M.** pinned en haut, fiche détaillée.
- **Les douze Experts** listés alphabétiquement par prénom.

La fiche d'un Expert affiche :

- Nom, avatar, territoire éditorial (eyebrow).
- Spécialités (3 pastilles).
- Bouton "Démarrer une conversation".
- Bouton "Demander un avis" (ouverture Messages avec un prompt pré-rempli).
- Sa doctrine de référence (la skill Lead correspondante en résumé une ligne).

La fiche d'Hélène affiche en plus :

- **L'équipe qu'elle pilote · 12 Experts.** Liste des douze, avec pastille de territoire.
- L'indication que c'est elle qui orchestre la Roadmap d'Aujourd'hui.

Il n'y a pas de page "Contacts" séparée. Le carnet vit à l'intérieur de Messages.

---

## 6. Génération de contenu vs conversation

Le système des Experts couvre deux usages distincts qu'il ne faut pas confondre :

### 6.1 Conversation

L'usage premier décrit dans §4. Floriane discute, demande conseil, valide, oriente. Les Experts parlent. Les LLM utilisés sont ceux du tableau §3 (Opus ou Sonnet selon l'Expert).

### 6.2 Génération automatique de contenu

Certains modules de Creative Fair invoquent un Expert **sans interface conversationnelle**, pour produire un livrable.

Exemples :

- Post Creator > Anecdote : Albane R. génère un post à partir d'un brief structuré.
- Mon Programme > Suggestions semaine : Hélène M. génère trois suggestions.
- F89 Wizard piliers : Hélène M. cascade un Sonnet 4.6 pour les 5 questions puis 3 propositions.

Dans ces cas, le LLM utilisé est **toujours celui de l'Expert correspondant** (jamais Haiku, comme acté).

### 6.3 Tâches utilitaires invisibles

Certaines tâches techniques courent en arrière-plan sans engager un Expert :

- Génération du titre court d'une conversation Messages (pour la liste).
- Résumé d'un fil de conversation long pour Hélène (compression du contexte).
- Extraction d'entités (date, marque, personne) depuis un texte libre.
- Reformulation d'une instruction utilisateur en query Supabase.

Ces tâches sont **invisibles** pour Floriane. Aucun Expert n'y est associé conceptuellement. Elles tournent sur **Haiku 4.5**, qui est rapide et économique, et leur qualité subjective importe peu (elles font des choses très bornées).

**Règle stricte :** Haiku n'est jamais utilisé pour générer un livrable que Floriane verra signé d'un Expert. Haiku ne parle jamais en tant qu'Expert. Haiku ne fait que des tâches outillées sans nom et sans voix.

---

## 7. La gestion des coûts et de la latence

Le choix d'utiliser exclusivement Opus 4.7 et Sonnet 4.6 pour les Experts a un coût réel, à modéliser dans le pricing client.

Ordre de grandeur (tarification publique Anthropic à la date du document, à vérifier dans l'espace admin quand il existera) :

- **Opus 4.7.** Environ 15 $/M tokens input, 75 $/M tokens output. Latence typique 3-6 secondes.
- **Sonnet 4.6.** Environ 3 $/M tokens input, 15 $/M tokens output. Latence typique 1-2 secondes.
- **Haiku 4.5.** Environ 0,80 $/M tokens input, 4 $/M tokens output. Latence 200-500 ms.

Une journée intensive de Floriane (10 conversations actives, Hélène qui écoute tout, génération de plusieurs livrables) peut représenter quelques euros à quelques dizaines d'euros de coût IA. À l'échelle d'un abonnement B2B à plusieurs centaines d'euros mensuels, c'est soutenable mais pas négligeable.

L'espace admin Lead (Sprint 42) devra exposer ces coûts en temps réel pour ajuster le pricing si nécessaire.

---

## 8. Le routing dynamique — exploration V2+

En V1.x, **aucun routing dynamique**. La configuration est figée dans ce document : chaque Expert a son modèle, point.

En V2+, le routing dynamique sera évalué. Trois candidats sont identifiés :

- **RouteLLM** (Berkeley, open source). Classifier entraîné qui décide à chaque appel quel modèle utiliser selon la complexité estimée. Économies publiées 40-60% sans perte de qualité. Crédible.
- **OpenRouter auto-routing.** Service hébergé avec `model: "openrouter/auto"`. Plus simple à brancher mais moins transparent.
- **LiteLLM Proxy avec règles custom.** Routing déterministe écrit à la main. Lisible, auditable, mais demande de coder les règles.

Les prérequis pour ouvrir le sujet en V2 :

- Un eval set construit pour chaque cas d'usage Expert.
- Un suivi qualité en place (Langfuse ou équivalent) dans l'espace admin Lead.
- Un volume de conversations significatif (>10 000 échanges) pour mesurer un vrai effet.

Tant que ces prérequis ne sont pas remplis, le routing dynamique est plus risqué qu'utile. Hélène doit être Opus, point.

---

## 9. La voix des Experts

Chaque Expert a une voix singulière, pas un ton générique IA. La voix est définie dans le system prompt de l'Expert et doit rester stable d'une conversation à l'autre.

| Expert | Trait dominant |
|---|---|
| Hélène M. | Posée, précise, structurante. Parle peu mais juste. |
| Albane R. | Documentée, citationnelle, lente à se prononcer. Référence Le Monde M Magazine. |
| Antoine F. | Visuel, direct, peu de mots, beaucoup d'exemples. Référence Hermès Métiers, Aman Resorts. |
| Sofia P. | Performance, chiffrée, opérationnelle. Sans détour. |
| Léa Z. | Réseau, contractuelle, méfiante sur les conflits d'image. |
| Jonas K. | Stratège des coups, prudent. Référence Jacquemus champ de lavande. |
| Marc D. | Veille fine, signaux faibles, jamais alarmiste. |
| Valentine D. | Sang-froid absolu, ne réagit jamais à chaud. |
| Inès B. | Opérationnelle, productivité, gain de temps. |
| Sébastien L. | Lecture qualitative, refus des vanity metrics. |
| Capucine V. | Communauté chaude, échange produit, référence Walk In Paris. |
| Camille O. | Multi-canal, déclinaison fine, refus des canaux non maîtrisés en V1. |
| Élise M. | Archiviste rigoureuse. Refus absolu d'inventer. Si l'archive ne dit rien, elle dit "rien dans le corpus". |

Ces voix doivent être maintenues stables. Les system prompts sont versionnés et trackés dans le repo (`lib/ai/prompts/experts/*.ts`).

---

## 10. Ce qui n'est pas un Expert

Pour éviter la dilution conceptuelle, certaines fonctions IA de Creative Fair **ne sont pas portées par un Expert nommé** :

- Le **Post Creator** est un outil orchestré, mais le contenu est attribué à l'Expert pertinent (Albane pour une anecdote, Antoine pour un brief visuel). Le Post Creator en tant que tel n'est pas un Expert.
- Le **Moodboard**, les **Variations**, les **Reviews** sont des outils, pas des Experts. Leurs prompts internes peuvent invoquer un Expert sous le capot, mais l'utilisateur les manipule comme des outils.
- L'**onboarding** F89 piliers est orchestré par Hélène avec un sub-prompt Sonnet 4.6. Pas d'Expert dédié à l'onboarding.

Cette discipline évite l'inflation : on ne crée pas un treizième Expert chaque fois qu'on a besoin d'une nouvelle skill. Les douze suffisent au territoire V1.

---

*Document v2.0 du 21 mai 2026. Toute proposition de modification passe par un Sprint dédié, jamais en passant.*
