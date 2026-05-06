export default function Home() {
  return (
    <main
      style={{ backgroundColor: 'var(--color-background)' }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="text-center space-y-4">
        <h1
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
          }}
          className="text-4xl font-semibold tracking-tight"
        >
          Creative Fair
        </h1>
        <p
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          className="text-lg font-light"
        >
          Conseiller en communication digitale
        </p>
        <p
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          className="text-sm tracking-widest uppercase"
        >
          v60 · setup en cours
        </p>
      </div>
    </main>
  )
}
