import type { TenantTheme } from '@/types/tenant'

export const defaultTheme: TenantTheme = {
  colors: {
    background: '#FBFAF7',
    surface: '#FFFFFF',
    text: '#1A1F1B',
    textMuted: '#5A6260',
    border: '#E8E5DD',
    accent: '#1F4937',
    accentForeground: '#FFFFFF',
    error: '#B91C1C',
  },
  fonts: {
    display: '-apple-system, "SF Pro Display", system-ui, sans-serif',
    body: '-apple-system, "SF Pro Text", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", monospace',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
  },
}
