// Sprint 43-stable — Redirect vers /bibliotheque top-level.
// Doctrine 01-ARCHITECTURE.md §1 : Bibliothèque = Travail top-level (pas sous Outils).

import { redirect } from 'next/navigation'

export default function BibliothequeLegacyRedirect() {
  redirect('/bibliotheque')
}
