// Sprint 36.B.3 — Orchestrateur client de /ma-marque (14 rangs + sheets).
// Pattern iOS Settings : liste verticale dense, sheets bottom plein écran.

'use client'

import { useState } from 'react'
import { EtatMarque } from './EtatMarque'
import { MarqueGroup } from './MarqueGroup'
import { MarqueRow } from './MarqueRow'
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
}

export function MaMarqueDashboard({ snapshot: initialSnapshot, archives }: Props) {
  const snapshot = initialSnapshot
  const [open, setOpen] = useState<BlocId | null>(null)

  function ouvrir(bloc: BlocId) {
    setOpen(bloc)
  }
  function fermer() {
    setOpen(null)
  }
  function aller(suivant: BlocId) {
    setOpen(suivant)
  }

  // Helpers pour chaque rang.
  function rowFor(
    bloc: BlocId,
    summary: string,
  ): React.ReactElement {
    const state = etatDuBloc(bloc, snapshot)
    const priority = BLOCS_PRIORITAIRES.includes(bloc)
    return (
      <MarqueRow
        key={bloc}
        label={BLOCS_LABELS[bloc]}
        summary={summary}
        state={state}
        priority={priority}
        onClick={() => ouvrir(bloc)}
      />
    )
  }

  function summaryTexte(value: string, fallback: string): string {
    if (value.trim().length === 0) return fallback
    return value.length > 80 ? value.slice(0, 77) + '…' : value
  }

  return (
    <>
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

      {/* Sheets — une seule active à la fois */}
      {open === 'nom' ? (
        <SheetTexteSimple
          title="Nom"
          bloc="nom"
          intro="Comment ta marque se nomme."
          placeholder="Le nom complet"
          field="name"
          maxLength={80}
          initialValue={snapshot.nom}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'secteur' ? (
        <SheetTexteSimple
          title="Secteur"
          bloc="secteur"
          intro="Le terrain sur lequel tu opères, dit en mots simples."
          placeholder="Ex. Sculpture monumentale, hôtellerie de patrimoine, ateliers d'écriture…"
          field="secteur"
          maxLength={120}
          initialValue={snapshot.secteur}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'voix' ? (
        <SheetTexteSimple
          title="Voix"
          bloc="voix"
          intro="Le ton qu'on reconnaît immédiatement quand tu parles."
          placeholder="Calme, posé, précis. Pas de slogans. Pas d'exclamations. Pas de jargon."
          field="ton"
          multiline
          maxLength={280}
          initialValue={snapshot.ton}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'singularite' ? (
        <SheetTexteSimple
          title="Singularité"
          bloc="singularite"
          intro="Ce qui fait que ta marque n'est confondue avec aucune autre."
          placeholder="Le geste, l'angle, l'origine, le territoire — ce qui te place ailleurs."
          field="singularite"
          multiline
          maxLength={400}
          initialValue={snapshot.singularite}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'cible' ? (
        <SheetCible
          initialValue={snapshot.cible}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'piliers' ? (
        <PiliersSheet
          initialPiliers={snapshot.piliers}
          brandBook={snapshot.brandBook}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'cap-saison' ? (
        <ObjectifsSheet
          initialObjectifs={snapshot.objectifs}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'univers-refuse' ? (
        <SheetUniversRefuse
          initialValue={snapshot.universRefuse}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'benchmarks' ? (
        <SheetBenchmarks
          initialValue={snapshot.benchmarks}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'calendrier-business' ? (
        <CalendrierBusinessSheet
          initialMoments={snapshot.calendrierBusiness}
          piliers={snapshot.piliers}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'ressources' ? (
        <RessourcesSheet
          initialRessources={snapshot.ressources}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'canaux' ? (
        <SheetCanaux
          initialValue={snapshot.canaux}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'brand-book' ? (
        <SheetBrandBook
          initialValue={snapshot.brandBook}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}

      {open === 'archives' ? (
        <SheetArchives
          initialItems={archives}
          onClose={fermer}
          onAllerVers={aller}
        />
      ) : null}
    </>
  )
}
