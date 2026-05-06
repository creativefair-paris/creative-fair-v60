import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/ma-marque/OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="px-6 md:px-10 py-10">
      <div className="max-w-2xl mx-auto w-full mb-4">
        <Link
          href="/ma-marque"
          className="inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ChevronLeft size={16} />
          Ma marque
        </Link>
      </div>
      <OnboardingFlow />
    </div>
  )
}
