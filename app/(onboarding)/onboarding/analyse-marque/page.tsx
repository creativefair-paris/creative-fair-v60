// Sprint 34 — Page onboarding 10 questions (cahier §3)
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function AnalyseMarquePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <OnboardingFlow />
      </section>
    </main>
  )
}
