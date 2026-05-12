# Sprint 36.B.5 — Journal des écarts

Aucun abort déclenché. Sprint exécuté de bout en bout.

## Notes d'implémentation

- L'endpoint waitlist a été placé sous `/api/brand/waitlist` (et non
  `/api/brands/[brandId]/waitlist` comme suggéré dans le brief)
  pour rester cohérent avec le pattern API existant : toute la
  surface `/api/brand/*` (update, upload, archives) est tenant-scoped
  côté serveur via `public.user_tenant_id()`, sans paramètre brandId
  dans l'URL. Le code résout brand depuis le user authentifié.

- `loadUserMeta` dupliqué (NavigationBar et PageHeader). Documenté en
  dette dans `decisions.md`. Le brief autorisait explicitement
  PageHeader comme nouveau composant — pas de refacto cross-cutting
  imposée. Préféré : pas modifier NavigationBar (toujours utilisée
  par les routes legacy) et garder PageHeader autonome.
