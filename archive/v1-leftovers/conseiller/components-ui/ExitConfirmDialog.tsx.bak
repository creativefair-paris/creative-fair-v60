// Sprint 37.B (F16) — Dialogue de confirmation à la sortie du wizard.
//
// Au clic sur la croix de fermeture, on ouvre ce dialogue. 2 boutons :
// "Reprendre plus tard" (sauvegarde + ferme — la session reste
// IN_PROGRESS) et "Continuer le brief" (annule la fermeture).
//
// Anti-paternaliste : pas de forçage. Le pilote peut TOUJOURS sortir.

'use client'

type Props = {
  open: boolean
  stepsAnswered: number
  totalSteps: number
  onResumeLater: () => void
  onContinue: () => void
}

export function ExitConfirmDialog({
  open,
  stepsAnswered,
  totalSteps,
  onResumeLater,
  onContinue,
}: Props) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Sprint 37.D (F32) — backdrop renforcé à 0.4 pour être clairement
          perçu au-dessus du fond claire du wizard immersif. */}
      <div
        onClick={onContinue}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
        }}
      />
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 400,
          width: '100%',
          borderRadius: 14,
          padding: '24px 24px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#FFFFFF',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2
          id="exit-confirm-title"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-label)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Tu as répondu à {stepsAnswered} question{stepsAnswered > 1 ? 's' : ''} sur {totalSteps}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'rgba(0, 0, 0, 0.7)',
            margin: 0,
          }}
        >
          Si tu sors maintenant, ta progression sera sauvegardée. Tu pourras
          reprendre où tu en es.
        </p>
        <footer
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 4,
            flexWrap: 'wrap',
          }}
        >
          <button type="button" onClick={onResumeLater} className="btn-choice btn-choice-sm">
            Reprendre plus tard
          </button>
          <button type="button" onClick={onContinue} className="btn-primary">
            Continuer le brief
          </button>
        </footer>
      </section>
    </div>
  )
}
