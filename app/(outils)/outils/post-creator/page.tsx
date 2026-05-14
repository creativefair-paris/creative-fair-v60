// Sprint 37.I (F78) — La route /outils/post-creator est supprimée
// architecturalement. Le hub Post Creator est désormais rendu directement
// dans la preview de /outils (OutilsCatalog dispatch sur outil.id).
//
// On garde un redirect 308 vers /outils pour les anciens bookmarks /
// liens externes. Pas de page rendue ici.

import { redirect } from 'next/navigation'

export default function PostCreatorRedirect(): never {
  redirect('/outils')
}
