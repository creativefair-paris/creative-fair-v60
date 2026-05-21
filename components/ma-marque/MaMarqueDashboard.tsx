// @deprecated Sprint 40 Phase 2B — composant à renommer MaMarqueView
// Sprint 43+. Mot "Dashboard" en nom interne tolérable §9 voice sheet
// mais signal pour le renommage.
//
// Sprint 36.B.3 → 36.B.4 — Orchestrateur client de /ma-marque.
//
// Patch 36.B.4 :
//   - Layout 2 colonnes permanent desktop (≥ 1024 px) : liste à gauche (40%),
//     preview/édition à droite (60%).
//   - CAS A (blocs simples) : édition inline en colonne droite, pas de sheet.
//   - CAS B (blocs riches) : sheet plein écran (comportement 36.B.3 conservé).
//   - Mobile : layout 1 colonne, tous les blocs ouvrent une sheet.
//   - Breadcrumb "Aujourd'hui › Ma Marque" en tête de la colonne gauche.

'use client'

import { useCallback, useEffect, useState } from 'react'
import { EtatMarque } from './EtatMarque'
import { MarqueGroup } from './MarqueGroup'
import { MarqueRow } from './MarqueRow'
import { MarquePreview } from './MarquePreview'
import { SheetTexteSimple } from './SheetTexteSimple'
import { SheetCible } from './cible/SheetCible'
import { SheetUniversRefuse } from './univers-refuse/SheetUniversRefuse'
import { SheetBenchmarks } from './benchmarks/SheetBenchmarks'
import { SheetCanaux } from './canaux/SheetCanaux'
import { SheetBrandBook } from './brand-book/SheetBrandBook'
import { SheetArchives } from './archives/SheetArchives'
import { CalendrierBusinessSheet } from './calendrier/CalendrierBusinessSheet'
import { ObjectifsSheet } from './objectifs/ObjectifsSheet'
import { RessourcesSheet } from './ressources/RessourcesSheet'
import { PiliersSheet } from './piliers/PiliersSheet'
import {
  BLOCS_LABELS,
  BLOCS_PRIORITAIRES,
  etatDuBloc,
  resumePiliers,
  resumeObjectifs,
  resumeBenchmarks,
  resumeBrandBook,
  resumeCalendrier,
  resumeCanaux,
  resumeRessources,
  resumeArchives,
  type BlocId,
  type BrandSnapshot14,
} from '@/lib/ma-marque/completude'
import type { BrandArchive } from '@/types/ma-marque'

type Props = {
  snapshot: BrandSnapshot14
  archives: BrandArchive[]
  userEmail?: string
}

// CAS A — édition inline desktop (mêmes 6 que MarquePreview).
const CAS_A: ReadonlyArray<BlocId> = [
  'nom',
  'secteur',
  'voix',
  'singularite',
  'cible',
  'univers-refuse',
]

const DESKTOP_BREAKPOINT = 1024

export function MaMarqueDashboard({ snapshot: initialSnapshot, archives, userEmail }: Props) {
  const [snapshot, setSnapshot] = useState<BrandSnapshot14>(initialSnapshot)
  const [openSheet, setOpenSheet] = useState<BlocId | null>(null)
  const [selectedBloc, setSelectedBloc] = useState<BlocId | null>(null)

  // Détection desktop : lazy initializer (lit window une fois au mount).
  // SSR : pas de window → true par défaut (le layout 2 colonnes est l'attendu
  // sur grand écran ; un mobile non-JS verrait un état dégradé acceptable).
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches
  })

  // Subscribe au resize — uniquement par l'event listener, pas de setState
  // synchrone dans l'effet (lint react-hooks/set-state-in-effect).
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  function ouvrir(bloc: BlocId) {
    setSelectedBloc(bloc)
    if (isDesktop && CAS_A.includes(bloc)) {
      // CAS A desktop → édition inline, pas de sheet.
      setOpenSheet(null)
      return
    }
    setOpenSheet(bloc)
  }
  function fermerSheet() {
    setOpenSheet(null)
  }
  function aller(suivant: BlocId) {
    setSelectedBloc(suivant)
    if (isDesktop && CAS_A.includes(suivant)) {
      setOpenSheet(null)
      return
    }
    setOpenSheet(suivant)
  }

  // Met à jour le snapshot après save inline (CAS A).
  const onSavedInline = useCallback((bloc: BlocId, value: string) => {
    setSnapshot((s) => {
      switch (bloc) {
        case 'nom':           return { ...s, nom: value }
        case 'secteur':       return { ...s, secteur: value }
        case 'voix':          return { ...s, ton: value }
        case 'singularite':   return { ...s, singularite: value }
        case 'cible':         return { ...s, cible: value }
        case 'univers-refuse': return { ...s, universRefuse: value }
        default:              return s
      }
    })
  }, [])

  // Mapping bloc → valeur texte courante (pour MarquePreview).
  const valeursTexte: Record<string, string> = {
    nom: snapshot.nom,
    secteur: snapshot.secteur,
    voix: snapshot.ton,
    singularite: snapshot.singularite,
    cible: snapshot.cible,
    'univers-refuse': snapshot.universRefuse,
  }

  // Helpers pour chaque rang.
  function rowFor(bloc: BlocId, summary: string): React.ReactElement {
    const state = etatDuBloc(bloc, snapshot)
    const priority = BLOCS_PRIORITAIRES.includes(bloc)
    return (
      <MarqueRow
        key={bloc}
        label={BLOCS_LABELS[bloc]}
        summary={summary}
        state={state}
        priority={priority}
        selected={selectedBloc === bloc && isDesktop}
        onClick={() => ouvrir(bloc)}
      />
    )
  }

  function summaryTexte(value: string, fallback: string): string {
    if (value.trim().length === 0) return fallback
    return value.length > 80 ? value.slice(0, 77) + '…' : value
  }

  const liste = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Sprint 36.B.5 — breadcrumb + H1 portés désormais par PageHeader (au-dessus). */}
      <EtatMarque snapshot={snapshot} />

      <MarqueGroup title="Identité">
        {rowFor('nom', summaryTexte(snapshot.nom, 'Non renseigné'))}
        {rowFor('secteur', summaryTexte(snapshot.secteur, 'Non renseigné'))}
        {rowFor('voix', summaryTexte(snapshot.ton, 'Non renseigné'))}
        {rowFor('singularite', summaryTexte(snapshot.singularite, 'Non renseigné'))}
        {rowFor('cible', summaryTexte(snapshot.cible, 'Non renseigné'))}
      </MarqueGroup>

      <MarqueGroup title="Doctrine éditoriale">
        {rowFor('piliers', resumePiliers(snapshot.piliers))}
        {rowFor('cap-saison', resumeObjectifs(snapshot.objectifs))}
        {rowFor('univers-refuse', summaryTexte(snapshot.universRefuse, 'Non renseigné'))}
        {rowFor('benchmarks', resumeBenchmarks(snapshot.benchmarks))}
      </MarqueGroup>

      <MarqueGroup title="Production">
        {rowFor('calendrier-business', resumeCalendrier(snapshot.calendrierBusiness))}
        {rowFor('ressources', resumeRessources(snapshot.ressources))}
        {rowFor('canaux', resumeCanaux(snapshot.canaux))}
      </MarqueGroup>

      <MarqueGroup title="Mémoire">
        {rowFor('brand-book', resumeBrandBook(snapshot.brandBook))}
        {rowFor('archives', resumeArchives(snapshot.archivesCount))}
      </MarqueGroup>
    </div>
  )

  return (
    <>
      <div className="cfs-ma-marque-grid">
        <aside className="cfs-ma-marque-liste">{liste}</aside>
        <section className="cfs-ma-marque-preview">
          <MarquePreview
            bloc={selectedBloc}
            values={valeursTexte}
            onSaved={onSavedInline}
          />
        </section>
      </div>

      {/* Sheets — desktop CAS B uniquement, ou mobile pour tout. */}
      {openSheet === 'nom' ? (
        <SheetTexteSimple
          title="Nom"
          bloc="nom"
          intro="Comment ta marque se nomme."
          placeholder="Le nom complet"
          field="name"
          maxLength={80}
          initialValue={snapshot.nom}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'secteur' ? (
        <SheetTexteSimple
          title="Secteur"
          bloc="secteur"
          intro="Le terrain sur lequel tu opères, dit en mots simples."
          placeholder="Ex. Sculpture monumentale, hôtellerie de patrimoine, ateliers d'écriture…"
          field="secteur"
          maxLength={120}
          initialValue={snapshot.secteur}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'voix' ? (
        <SheetTexteSimple
          title="Voix"
          bloc="voix"
          intro="Le ton qu'on reconnaît immédiatement quand tu parles."
          placeholder="Calme, posé, précis. Pas de slogans. Pas d'exclamations. Pas de jargon."
          field="ton"
          multiline
          maxLength={280}
          initialValue={snapshot.ton}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'singularite' ? (
        <SheetTexteSimple
          title="Singularité"
          bloc="singularite"
          intro="Ce qui fait que ta marque n'est confondue avec aucune autre."
          placeholder="Le geste, l'angle, l'origine, le territoire — ce qui te place ailleurs."
          field="singularite"
          multiline
          maxLength={400}
          initialValue={snapshot.singularite}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'cible' ? (
        <SheetCible
          initialValue={snapshot.cible}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'piliers' ? (
        <PiliersSheet
          initialPiliers={snapshot.piliers}
          brandBook={snapshot.brandBook}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'cap-saison' ? (
        <ObjectifsSheet
          initialObjectifs={snapshot.objectifs}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'univers-refuse' ? (
        <SheetUniversRefuse
          initialValue={snapshot.universRefuse}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'benchmarks' ? (
        <SheetBenchmarks
          initialValue={snapshot.benchmarks}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'calendrier-business' ? (
        <CalendrierBusinessSheet
          initialMoments={snapshot.calendrierBusiness}
          piliers={snapshot.piliers}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'ressources' ? (
        <RessourcesSheet
          initialRessources={snapshot.ressources}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'canaux' ? (
        <SheetCanaux
          initialValue={snapshot.canaux}
          {...(userEmail ? { defaultEmail: userEmail } : {})}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'brand-book' ? (
        <SheetBrandBook
          initialValue={snapshot.brandBook}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}

      {openSheet === 'archives' ? (
        <SheetArchives
          initialItems={archives}
          onClose={fermerSheet}
          onAllerVers={aller}
        />
      ) : null}
    </>
  )
}
