// Sprint 43-stable — Section Profil du Compte

import { updateProfile } from '@/app/_actions/compte/update-profile'

type Props = {
  initialName: string
  initialEmail: string
  initialLanguage?: string
}

export function CompteSectionProfil({ initialName, initialEmail, initialLanguage = 'fr' }: Props) {
  return (
    <section className="compte-section glass-z2">
      <h2 className="compte-section-title">Profil</h2>
      <p className="compte-section-subtitle">Tes informations personnelles.</p>

      <form action={updateProfile} className="compte-form">
        <div className="compte-field">
          <label htmlFor="name">Nom complet</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={initialName}
            className="compte-input"
            required
          />
        </div>

        <div className="compte-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={initialEmail}
            className="compte-input"
            disabled
            aria-readonly="true"
          />
          <p className="compte-help">L&apos;email se modifie depuis l&apos;onglet Sécurité.</p>
        </div>

        <div className="compte-field">
          <label htmlFor="language">Langue</label>
          <select id="language" name="language" defaultValue={initialLanguage} className="compte-input">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="compte-actions">
          <button type="submit" className="compte-btn compte-btn--primary">
            Enregistrer
          </button>
        </div>
      </form>
    </section>
  )
}
