import 'server-only'

const ADMIN_EMAILS: readonly string[] = [
  'creativefair@1922.studio',
] as const

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export const ADMIN_EMAIL_LIST = ADMIN_EMAILS
