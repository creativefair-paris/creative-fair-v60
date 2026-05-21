// Sprint 43-stable — Section Sécurité

export function CompteSectionSecurite() {
  return (
    <section className="compte-section glass-z2">
      <h2 className="compte-section-title">Sécurité</h2>
      <p className="compte-section-subtitle">Gestion de l&apos;authentification et des sessions.</p>

      <div className="compte-security-block">
        <h3 className="compte-subsection-title">Mot de passe</h3>
        <p className="compte-help">
          Creative Fair utilise l&apos;authentification par lien magique. Pas de mot de passe à gérer.
        </p>
      </div>

      <div className="compte-security-block">
        <h3 className="compte-subsection-title">Sessions actives</h3>
        <p className="compte-help">Session courante : ce navigateur.</p>
      </div>

      <div className="compte-security-block">
        <h3 className="compte-subsection-title">Déconnexion</h3>
        <form action="/logout" method="post">
          <button type="submit" className="compte-btn compte-btn--danger">
            Se déconnecter
          </button>
        </form>
      </div>
    </section>
  )
}
