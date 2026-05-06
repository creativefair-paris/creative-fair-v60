-- Creative Fair v60 — Seed des 3 tenants B2B (Sprint 1)
-- Couleurs PLACEHOLDERS à valider en visio (Sprint 23-25).

insert into tenants (slug, name, plan, theme) values
  (
    'angelina',
    'Angelina Paris',
    'b2b_custom',
    '{
      "colors": {
        "background": "#FFF8F3",
        "surface": "#FFFFFF",
        "text": "#2A1A1A",
        "textMuted": "#6B5B5B",
        "border": "#EBDED5",
        "accent": "#A8324E",
        "accentForeground": "#FFFFFF"
      },
      "fonts": {
        "display": "\"Playfair Display\", serif",
        "body": "\"Inter\", sans-serif"
      }
    }'::jsonb
  ),
  (
    'tousentete',
    'Association Tous en Tête',
    'b2b_custom',
    '{
      "colors": {
        "background": "#F5F9FB",
        "surface": "#FFFFFF",
        "text": "#1A2B33",
        "textMuted": "#5A6E78",
        "border": "#DBE5EB",
        "accent": "#3B7A99",
        "accentForeground": "#FFFFFF"
      },
      "fonts": {
        "display": "\"Inter\", sans-serif",
        "body": "\"Inter\", sans-serif"
      }
    }'::jsonb
  ),
  (
    'comptoir',
    'Le Comptoir Général',
    'b2b_custom',
    '{
      "colors": {
        "background": "#FAF4ED",
        "surface": "#FFFFFF",
        "text": "#2B1F15",
        "textMuted": "#6B5A4A",
        "border": "#E8DDC9",
        "accent": "#C26841",
        "accentForeground": "#FFFFFF"
      },
      "fonts": {
        "display": "\"Playfair Display\", serif",
        "body": "\"Inter\", sans-serif"
      }
    }'::jsonb
  );
