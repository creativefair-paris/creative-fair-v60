'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email')
  if (typeof email !== 'string' || !email) redirect('/login?error=true')

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) redirect('/login?error=true')
  redirect('/login?sent=true')
}
