import type { TenantTheme } from '@/types/tenant'

export function buildThemeVars(theme: TenantTheme): Record<string, string> {
  return {
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-border': theme.colors.border,
    '--color-accent': theme.colors.accent,
    '--color-accent-fg': theme.colors.accentForeground,
    // Keep --color-primary as alias for backward compat with Tailwind config
    '--color-primary': theme.colors.accent,
    '--color-primary-fg': theme.colors.accentForeground,
    '--color-error': theme.colors.error ?? '#B91C1C',
    '--font-display': theme.fonts.display,
    '--font-body': theme.fonts.body,
    '--font-mono': theme.fonts.mono,
    '--radius-sm': theme.radius?.sm ?? '6px',
    '--radius-md': theme.radius?.md ?? '12px',
    '--radius-lg': theme.radius?.lg ?? '20px',
    // Keep --radius for backward compat (Sprint 0 used it directly)
    '--radius': theme.radius?.md ?? '12px',
  }
}

export function mergeTheme(base: TenantTheme, override: Partial<TenantTheme>): TenantTheme {
  return {
    colors: { ...base.colors, ...override.colors },
    fonts: { ...base.fonts, ...override.fonts },
    radius:
      override.radius != null
        ? { ...base.radius, ...override.radius }
        : base.radius,
  }
}
