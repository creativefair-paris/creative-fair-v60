import type { TenantTheme } from '@/types/tenant'

// Sprint 33 — palette Apple iOS stricte (§7.2). Vert forêt retiré du système.
export const defaultTheme: TenantTheme = {
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textMuted: 'rgba(60,60,67,0.6)',
    border: 'rgba(60,60,67,0.29)',
    accent: '#007AFF',
    accentForeground: '#FFFFFF',
    error: '#FF3B30',
  },
  fonts: {
    display: '-apple-system, system-ui, sans-serif',
    body: '-apple-system, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, monospace',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
  },
}
