import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ParametresPage() {
  return (
    <div className="px-6 md:px-10 py-10 max-w-2xl mx-auto w-full">
      <Link
        href="/ma-marque"
        className="inline-flex items-center gap-1 text-sm mb-8 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        <ChevronLeft size={16} />
        Ma marque
      </Link>
      <h1
        className="text-3xl font-semibold tracking-tight mb-4"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Paramètres
      </h1>
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Bientôt disponible.
      </p>
    </div>
  )
}
