import { sendMagicLink } from './actions'

type Props = {
  searchParams: Promise<{ sent?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { sent, error } = await searchParams

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-sm space-y-8">
        <header className="space-y-1">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          >
            Creative Fair
          </p>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Connexion
          </h1>
        </header>

        {sent ? (
          <div className="space-y-2">
            <p style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
              Lien envoyé. Vérifiez votre boîte mail.
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Le lien expire dans 1 heure. Pensez à vérifier vos spams.
            </p>
          </div>
        ) : (
          <form action={sendMagicLink} className="space-y-4">
            {error && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}
              >
                {error === 'no_access'
                  ? "Votre compte n'est pas encore activé. Contactez votre administrateur."
                  : 'Une erreur est survenue. Réessayez.'}
              </p>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.com"
                className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-fg)',
                fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius)',
              }}
            >
              Recevoir mon lien de connexion
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
