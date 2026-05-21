// Sprint 43-stable — Input "Ajouter un rappel..." en haut de la page Rappels.

import { createRappel } from '@/app/_actions/rappels/create-rappel'

export function RappelsInputNouveau() {
  return (
    <form action={createRappel} className="rappels-input-form">
      <input
        type="text"
        name="title"
        placeholder="Ajouter un rappel…"
        className="rappels-input"
        required
        autoComplete="off"
      />
      <button type="submit" className="rappels-input-submit" aria-label="Ajouter">
        Ajouter
      </button>
    </form>
  )
}
