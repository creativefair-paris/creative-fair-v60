export type TenantTheme = {
  colors: {
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
    accentForeground: string
    error?: string
  }
  fonts: {
    display: string
    body: string
    mono: string
  }
  radius?: {
    sm: string
    md: string
    lg: string
  }
}

export type Tenant = {
  id: string
  slug: string
  name: string
  plan: 'b2b_custom' | 'b2c'
  theme: TenantTheme
  enabled_channels: string[]
}
