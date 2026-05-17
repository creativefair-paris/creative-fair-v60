# 08-ARCHITECTURE-TABLES-DATABASE — Schéma SQL complet

**Date** : 17 mai 2026  
**Branche** : `cf-conceptuel-0`  
**Objet** : Référence SQL des nouvelles tables et altérations issues de la session de design CF.0.  
**Cible Sprint** : Sprint 39 (après hotfix 38.5 sécurité multi-tenant).

---

## Préambule

Ce document liste **uniquement les nouveautés** par rapport à la base actuelle (`creative-fair-v60` au tag `v1.6.0`). Les tables existantes (`tenants`, `profiles`, `brands`, `pillars`, `posts`, `bibliotheque_items`, etc.) ne sont pas redécrites.

**Migrations Supabase** : numéroter à partir de `025` (les 24 dernières migrations vont jusqu'à `024_runtime_validation.sql`).

---

## 1. Nouvelles tables — Messages & Contacts

### `contacts`

Table des contacts d'un tenant : doyens IA (Hélène M. + 12 doyens Task Force) + humains de l'équipe + collaborateurs externes.

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identité
  contact_type TEXT NOT NULL CHECK (contact_type IN ('doyen_ai', 'team_human', 'external')),
  name TEXT NOT NULL,
  role TEXT, -- "Directrice de la Communication", "Photographe", etc.
  bio TEXT,
  avatar_url TEXT,
  avatar_gradient JSONB, -- {start: '#A78BFA', end: '#6366F1'} pour doyens
  
  -- Spécificités doyens IA
  task_force TEXT, -- 'communication', 'veille', 'ads', etc. (NULL si humain/externe)
  specialities TEXT[], -- tags : ['stratégie', 'éditorial', 'doctrine']
  pinned_system BOOLEAN DEFAULT FALSE, -- Hélène M. = TRUE (non détachable)
  default_for_tenant BOOLEAN DEFAULT FALSE, -- doyen présent par défaut chez tous les tenants
  
  -- Spécificités humains
  linked_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- si team_human, link vers user CF
  email TEXT, -- pour externes (collaborateurs hors plateforme)
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT contact_type_consistency CHECK (
    (contact_type = 'doyen_ai' AND task_force IS NOT NULL) OR
    (contact_type = 'team_human' AND linked_profile_id IS NOT NULL) OR
    (contact_type = 'external')
  )
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_type ON contacts(tenant_id, contact_type);
CREATE INDEX idx_contacts_pinned ON contacts(tenant_id) WHERE pinned_system = TRUE;
```

### `conversations`

Conversations dans Messages (direct ou groupe).

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('direct', 'group')),
  name TEXT, -- auto-généré pour direct ("Hélène M."), custom pour group ("Capsule SS25")
  
  -- Pinning user (Hélène toujours pinned via contacts.pinned_system, autres pinnable par user)
  pinned_by_user BOOLEAN DEFAULT FALSE,
  pinned_order INT, -- ordre des pinned (1-9 max)
  
  -- Background custom (iOS 26)
  background_type TEXT CHECK (background_type IN ('default', 'photo', 'gradient', 'animated')),
  background_config JSONB,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  unread_count INT DEFAULT 0
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_pinned ON conversations(tenant_id, pinned_order) WHERE pinned_by_user = TRUE;
CREATE INDEX idx_conversations_last_message ON conversations(tenant_id, last_message_at DESC);
```

### `conversation_participants`

Participants d'une conversation (le tenant user lui-même + 1 ou N contacts).

```sql
CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Soit user du tenant, soit contact
  user_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (conversation_id, COALESCE(user_profile_id, contact_id)),
  CONSTRAINT participant_exclusive CHECK (
    (user_profile_id IS NOT NULL AND contact_id IS NULL) OR
    (user_profile_id IS NULL AND contact_id IS NOT NULL)
  )
);
```

### `messages`

Messages d'une conversation.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Sender : soit user, soit contact
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'contact')),
  sender_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Contenu
  content TEXT NOT NULL,
  content_html TEXT, -- rendu markdown si applicable
  attachments JSONB, -- [{url, type, name}]
  
  -- Quick replies suggérées (auto-générées par Claude pour les messages des doyens)
  suggested_replies JSONB, -- [{label, payload}]
  
  -- Reactions (iOS Tapbacks)
  reactions JSONB, -- {heart: [user_id, ...], thumbsup: [...]}
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  
  -- Pour les messages générés par Claude (doyens IA)
  generated_by_model TEXT, -- 'sonnet-4.6', 'opus-4.7'
  generation_tokens INT,
  
  CONSTRAINT sender_consistency CHECK (
    (sender_type = 'user' AND sender_user_id IS NOT NULL AND sender_contact_id IS NULL) OR
    (sender_type = 'contact' AND sender_contact_id IS NOT NULL AND sender_user_id IS NULL)
  )
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

---

## 2. Nouvelles tables — Calendrier & Rappels

### `events`

Évènements du Calendrier (publications, business, échéances).

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identification
  title TEXT NOT NULL,
  description TEXT,
  
  -- Catégorie (= calendrier dans la sidebar)
  category TEXT NOT NULL CHECK (category IN ('publication', 'business', 'deadline', 'external')),
  color_override TEXT, -- optionnel, par défaut depuis category
  
  -- Temporel
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE iCal format
  timezone TEXT DEFAULT 'Europe/Paris',
  
  -- Lien éventuel vers post (si category = 'publication')
  linked_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Lien éventuel vers participants
  participants_contacts UUID[], -- IDs de contacts
  
  -- Lien externe (si category = 'external')
  external_calendar_id TEXT, -- Google Calendar ID, Outlook, etc.
  external_event_id TEXT,
  
  -- Provenance (FK suggestions)
  source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL,
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_events_tenant_time ON events(tenant_id, starts_at);
CREATE INDEX idx_events_category ON events(tenant_id, category);
CREATE INDEX idx_events_linked_post ON events(linked_post_id);
```

### `reminders`

À créer si pas déjà existant — sinon ALTER pour les FK source.

```sql
-- À VÉRIFIER en Sprint 39 si la table existe déjà.
-- Si NON :
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Contenu
  title TEXT NOT NULL,
  notes TEXT,
  
  -- Liste (Mes Listes CF)
  list_name TEXT NOT NULL DEFAULT 'Publications', -- 'Publications', 'Briefs', 'Validation', 'Idées'
  
  -- Smart List criteria (calculé runtime, pas stocké) — Aujourd'hui, Programmé, Drapeau, etc.
  
  -- Métadonnées
  due_at TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high')),
  tags TEXT[],
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Sous-tâches (parent_id pour hiérarchie)
  parent_reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
  
  -- Section dans la liste (kanban columns)
  section_name TEXT,
  position_in_section INT,
  
  -- Provenance (FK sources)
  source_audit_id UUID, -- REFERENCES audits(id) — si table audits créée Sprint 39
  source_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL,
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_reminders_tenant ON reminders(tenant_id);
CREATE INDEX idx_reminders_due ON reminders(tenant_id, due_at) WHERE completed = FALSE;
CREATE INDEX idx_reminders_list ON reminders(tenant_id, list_name);
CREATE INDEX idx_reminders_flagged ON reminders(tenant_id) WHERE flagged = TRUE AND completed = FALSE;

-- Si la table reminders existe DÉJÀ :
-- ALTER TABLE reminders ADD COLUMN source_audit_id UUID;
-- ALTER TABLE reminders ADD COLUMN source_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
-- ALTER TABLE reminders ADD COLUMN source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
-- ALTER TABLE reminders ADD COLUMN source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL;
```

---

## 3. Nouvelles tables — Pilotage stratégique

### `suggestions`

Suggestions polymorphes inter-modules (Mon Programme → Calendrier/Rappels, Messages → Post Creator, etc.).

```sql
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Source
  source_module TEXT NOT NULL CHECK (source_module IN (
    'mon_programme', 'messages', 'analytics', 'bibliotheque', 'audit'
  )),
  source_id UUID, -- ID dans la table source (audit_id, conversation_id, etc.)
  
  -- Cible
  target_module TEXT NOT NULL CHECK (target_module IN (
    'calendrier', 'rappels', 'post_creator', 'bibliotheque', 'mon_programme'
  )),
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'event', 'reminder', 'post_draft', 'collection', 'audit_action'
  )),
  
  -- Contenu de la suggestion
  title TEXT NOT NULL,
  description TEXT,
  suggested_payload JSONB NOT NULL, -- structure dépend de target_module
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'expired'
  )),
  
  -- Si acceptée, ID de l'objet créé (event, reminder, post, etc.)
  resulting_object_id UUID,
  resulting_object_type TEXT,
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- auto-expiration après X jours
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_suggestions_tenant_status ON suggestions(tenant_id, status);
CREATE INDEX idx_suggestions_source ON suggestions(source_module, source_id);
CREATE INDEX idx_suggestions_pending ON suggestions(tenant_id, expires_at) WHERE status = 'pending';
```

### `proactive_signals`

Signaux proactifs envoyés par les doyens (récap hebdo, alerte, etc.).

```sql
CREATE TABLE proactive_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Émetteur (doyen)
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Déclencheur
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'scheduled', -- récurrence temporelle (récap hebdo, etc.)
    'event',     -- évènement interne CF (post pending_review depuis 48h)
    'threshold', -- seuil franchi sur indicateur Mon Programme (V2)
    'external'   -- signal externe (V2)
  )),
  trigger_config JSONB NOT NULL, -- {recurrence: 'weekly', day: 'monday', hour: 9} ou {threshold: {indicator: 'coherence', op: '<', value: 70}}
  
  -- Cible (conversation où arrive le message)
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL, -- template à inject dans Claude pour générer le message
  
  -- Status (V1.5 : scheduled + event seulement)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'expired', 'one_shot_done'
  )),
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_fired_at TIMESTAMPTZ,
  next_fire_at TIMESTAMPTZ, -- pour scheduled, calculé à chaque fire
  
  CONSTRAINT trigger_v15_only CHECK (
    trigger_type IN ('scheduled', 'event') -- threshold/external = V2
  )
);

CREATE INDEX idx_signals_tenant ON proactive_signals(tenant_id);
CREATE INDEX idx_signals_active ON proactive_signals(status, next_fire_at) WHERE status = 'active';
```

### `audits`

Audits stratégiques générés par Mon Programme (snapshots des 4 indicateurs vitaux).

```sql
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Date de l'audit (snapshot)
  audit_date DATE NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'daily' CHECK (audit_type IN ('daily', 'weekly', 'monthly', 'on_demand')),
  
  -- Indicateurs (snapshot)
  coherence_score INT, -- 0-100
  coherence_sparkline JSONB, -- 30 derniers points
  pillar_distribution JSONB, -- {anecdote: 30, manifeste: 15, produit: 35, evenement: 20}
  pillar_imbalance TEXT, -- pilier sous-représenté ou NULL
  density_metric TEXT CHECK (density_metric IN ('régulière', 'irrégulière', 'concentrée')),
  density_sparkline JSONB,
  matiere_ratio NUMERIC(4, 2), -- ex: 3.2
  matiere_trend TEXT CHECK (matiere_trend IN ('up', 'stable', 'down')),
  
  -- Narration générée
  narrative_text TEXT, -- "Le pilier Manifeste a perdu en intensité..."
  recommendations JSONB, -- [{action, target_module, payload}]
  
  -- Méta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by_model TEXT
);

CREATE INDEX idx_audits_tenant_date ON audits(tenant_id, audit_date DESC);
```

---

## 4. Altérations sur tables existantes

### `tenants` — Mode review éditoriale

```sql
ALTER TABLE tenants ADD COLUMN review_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE;
```

### `profiles` — Rôles équipe

```sql
ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'editor'
  CHECK (role IN ('owner', 'editor', 'viewer'));
```

### `posts` — États publication, review, sources

```sql
-- Review status (Angle mort #1)
ALTER TABLE posts ADD COLUMN review_status TEXT
  CHECK (review_status IS NULL OR review_status IN ('pending_review', 'approved', 'rejected'));

-- Publication status (Angle mort #5)
ALTER TABLE posts ADD COLUMN publish_status TEXT NOT NULL DEFAULT 'draft'
  CHECK (publish_status IN (
    'draft', 'scheduled', 'publishing', 'published', 'failed_retry', 'failed_manual'
  ));
ALTER TABLE posts ADD COLUMN publish_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN publish_next_retry_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN publish_error_log JSONB;

-- Sources (Angle mort #2)
ALTER TABLE posts ADD COLUMN source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN source_suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL;
-- posts.pilier_id existe déjà (Sprint 37.K)
-- posts.brand_id existe déjà
```

### `bibliotheque_items` — Souvenirs & enrichissement

```sql
-- Pour les Memories/Souvenirs auto-générés
ALTER TABLE bibliotheque_items ADD COLUMN is_memory_anchor BOOLEAN DEFAULT FALSE;
ALTER TABLE bibliotheque_items ADD COLUMN memory_collection TEXT; -- 'il_y_a_un_an', 'same_week_last_year'

-- Pour la recherche sémantique (V2 — embeddings)
ALTER TABLE bibliotheque_items ADD COLUMN embedding_vector VECTOR(1536); -- pgvector
ALTER TABLE bibliotheque_items ADD COLUMN search_text TSVECTOR;
CREATE INDEX idx_biblio_search ON bibliotheque_items USING GIN(search_text);

-- Liens posts utilisant cet item (pour calcul Profondeur de matière)
-- Cette relation existe via posts.source_items (à vérifier Sprint 39)
```

### `brands` — Wallpaper personnalisable + Brief

```sql
-- Wallpaper de la marque
ALTER TABLE brands ADD COLUMN wallpaper_type TEXT DEFAULT 'cream_default'
  CHECK (wallpaper_type IN ('cream_default', 'photo', 'gradient_custom'));
ALTER TABLE brands ADD COLUMN wallpaper_config JSONB; -- {url, tint, opacity} ou {colors: [...]}

-- Brief épinglé (note unique, markdown)
ALTER TABLE brands ADD COLUMN brief_markdown TEXT;
ALTER TABLE brands ADD COLUMN brief_citation_anchor TEXT; -- citation hero affichée sur la page d'accueil
ALTER TABLE brands ADD COLUMN brief_updated_at TIMESTAMPTZ;
```

---

## 5. Tables existantes inchangées mais importantes (référence)

| Table | Use case Sprint 39 |
|---|---|
| `tenants` | Multi-tenant, ajout `review_mode_enabled` |
| `profiles` | User CF, ajout `role` |
| `brands` | Identité marque, ajout wallpaper + brief |
| `pillars` | 4 piliers narratifs (Anecdote/Manifeste/Produit/Évènement) |
| `posts` | Publications + brouillons, ajouts massifs FK et statuts |
| `bibliotheque_items` | Matière documentaire + Memories |

---

## 6. Vues utiles pour Mon Programme

### Vue `mon_programme_coherence_30d`

```sql
CREATE OR REPLACE VIEW mon_programme_coherence_30d AS
SELECT 
  tenant_id,
  brand_id,
  DATE(published_at) AS day,
  AVG(coherence_score) AS daily_coherence
FROM posts
WHERE 
  published_at >= NOW() - INTERVAL '30 days'
  AND publish_status = 'published'
  AND coherence_score IS NOT NULL
GROUP BY tenant_id, brand_id, DATE(published_at)
ORDER BY day;
```

### Vue `mon_programme_pillar_distribution_30d`

```sql
CREATE OR REPLACE VIEW mon_programme_pillar_distribution_30d AS
SELECT 
  tenant_id,
  brand_id,
  pilier_id,
  COUNT(*) AS post_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY tenant_id, brand_id), 1) AS percentage
FROM posts
WHERE 
  published_at >= NOW() - INTERVAL '30 days'
  AND publish_status = 'published'
GROUP BY tenant_id, brand_id, pilier_id;
```

### Vue `mon_programme_density_90d`

```sql
CREATE OR REPLACE VIEW mon_programme_density_90d AS
WITH intervals AS (
  SELECT 
    tenant_id,
    brand_id,
    published_at,
    LAG(published_at) OVER (PARTITION BY tenant_id, brand_id ORDER BY published_at) AS prev_published_at
  FROM posts
  WHERE published_at >= NOW() - INTERVAL '90 days' AND publish_status = 'published'
)
SELECT 
  tenant_id,
  brand_id,
  STDDEV(EXTRACT(EPOCH FROM (published_at - prev_published_at)) / 86400.0) AS density_stddev_days,
  AVG(EXTRACT(EPOCH FROM (published_at - prev_published_at)) / 86400.0) AS avg_interval_days
FROM intervals
WHERE prev_published_at IS NOT NULL
GROUP BY tenant_id, brand_id;
```

---

## 7. Row-Level Security (RLS) — À implémenter Sprint 39

Toutes les nouvelles tables doivent avoir RLS multi-tenant strict :

```sql
-- Exemple pour contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation contacts SELECT" ON contacts
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Tenant isolation contacts INSERT" ON contacts
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Tenant isolation contacts UPDATE" ON contacts
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Tenant isolation contacts DELETE" ON contacts
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'editor')
  );
```

Répéter ce pattern pour `conversations`, `messages`, `conversation_participants`, `events`, `reminders`, `suggestions`, `proactive_signals`, `audits`.

---

## 8. Seed data — Les 12 doyens Task Force

```sql
-- À exécuter par tenant lors de la création (ou via trigger ON INSERT tenants)
INSERT INTO contacts (
  tenant_id, contact_type, name, role, bio, 
  task_force, specialities, pinned_system, default_for_tenant, 
  avatar_gradient
) VALUES
(
  '<tenant_id>', 'doyen_ai', 'Hélène Maréchal', 'Directrice de la Communication',
  'Hélène orchestre toutes les décisions de communication. Elle tranche en dernier ressort sur ce qui vit sur le feed organique de la marque.',
  'communication',
  ARRAY['stratégie', 'éditorial', 'doctrine', 'curseur-risque', 'cohérence'],
  TRUE, TRUE,
  '{"start": "#A78BFA", "end": "#6366F1"}'::jsonb
),
(
  '<tenant_id>', 'doyen_ai', 'Marc Dupont', 'Doyen Veille',
  'Marc surveille les tendances, les concurrents, les signaux faibles culturels.',
  'veille',
  ARRAY['tendances', 'concurrents', 'signaux-faibles', 'veille-sectorielle'],
  FALSE, TRUE,
  '{"start": "#4DA2FF", "end": "#0066D9"}'::jsonb
),
(
  '<tenant_id>', 'doyen_ai', 'Inès Bensalem', 'Doyenne Ops',
  'Inès gère les opérations social media, les automations, l''écosystème technique.',
  'ops',
  ARRAY['automation', 'productivité', 'community-management', 'workflow'],
  FALSE, TRUE,
  '{"start": "#FFB061", "end": "#E07A14"}'::jsonb
),
-- ... 9 autres doyens à seeder (Sofia P., Albane R., Sébastien L., Antoine F., 
-- Jonas K., Capucine V., Valentine D., Camille O., Élise M.)
;
```

---

## 9. Ordre des migrations Sprint 39

```
025_create_contacts.sql
026_create_conversations.sql
027_create_conversation_participants.sql
028_create_messages.sql
029_create_events.sql
030_create_or_alter_reminders.sql
031_create_suggestions.sql
032_create_proactive_signals.sql
033_create_audits.sql
034_alter_tenants_review_mode.sql
035_alter_profiles_role.sql
036_alter_posts_statuses_and_sources.sql
037_alter_bibliotheque_memories_and_search.sql
038_alter_brands_wallpaper_and_brief.sql
039_create_mon_programme_views.sql
040_rls_all_new_tables.sql
041_seed_doyens_trigger.sql
```

**Cible** : Sprint 39 complet en 17 migrations.

---

## 10. Validation runtime (suite à Sprint 37.I)

Pour chaque table, le test runtime curl doit valider :
- ✅ SELECT avec auth (own tenant) → 200
- ✅ SELECT sans auth → 401/403
- ✅ INSERT avec auth → 201
- ✅ INSERT sur tenant étranger → 403
- ✅ UPDATE/DELETE même règles
- ✅ RLS policies actives

---

**FIN DOCUMENT 08-ARCHITECTURE-TABLES-DATABASE.md**
