// Sprint 36.B.4 — Patch 3 : colonne droite (60%) de /ma-marque.
//
// CAS A (blocs simples) : formulaire d'édition inline en colonne droite,
//   pas de sheet. Le rang reste sélectionné, la liste reste visible.
// CAS B (blocs complexes) : MarquePreview retourne null — la sheet
//   plein écran s'ouvre via le dashboard parent.
// Aucun bloc sélectionné : placeholder neutre centré.

'use client'

import { useEffect, useRef, useState } from 'react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import {
  BLOCS_LABELS,
  type BlocId,
} from '@/lib/ma-marque/completude'

// CAS A — éditables inline. CAS B — sheet plein écran (la preview rend null).
const SIMPLES: ReadonlyArray<BlocId> = [
  'nom',
  'secteur',
  'voix',
  'singularite',
  'cible',
  'univers-refuse',
  // 'cap-saison' a son propre Split Brief (objectifs réordonnables) — CAS B.
]

function estCasA(bloc: BlocId): boolean {
  return SIMPLES.includes(bloc)
}

type ChampInfo = {
  field: 'name' | 'secteur' | 'ton' | 'singularite' | 'cible' | 'univers_refuse'
  intro: string
  placeholder: string
  multiline: boolean
  maxLength: number
}

const CHAMPS: Record<string, ChampInfo> = {
  nom: {
    field: 'name',
    intro: 'Comment ta marque se nomme.',
    placeholder: 'Le nom complet',
    multiline: false,
    maxLength: 80,
  },
  secteur: {
    field: 'secteur',
    intro: 'Le terrain sur lequel tu opères, dit en mots simples.',
    placeholder: "Ex. Sculpture monumentale, hôtellerie de patrimoine, ateliers d'écriture…",
    multiline: false,
    maxLength: 120,
  },
  voix: {
    field: 'ton',
    intro: "Le ton qu'on reconnaît immédiatement quand tu parles.",
    placeholder: "Calme, posé, précis. Pas de slogans. Pas d'exclamations.",
    multiline: true,
    maxLength: 280,
  },
  singularite: {
    field: 'singularite',
    intro: "Ce qui fait que ta marque n'est confondue avec aucune autre.",
    placeholder: "Le geste, l'angle, l'origine, le territoire — ce qui te place ailleurs.",
    multiline: true,
    maxLength: 400,
  },
  cible: {
    field: 'cible',
    intro: "Une cible n'est pas une démographie, c'est une posture. Qui parles-tu avec ? Comment vit-elle ?",
    placeholder:
      'Floriane, 28 ans, responsable comm dans une PME culturelle. Ex-BCW. Lit le M du Monde le samedi. Prépare ses propositions le lundi matin avec un thé.',
    multiline: true,
    maxLength: 1200,
  },
  'univers-refuse': {
    field: 'univers_refuse',
    intro: 'Ce que ta marque ne fera jamais. Sujets, postures, formats, partenaires. Ces refus protègent la signature.',
    placeholder:
      'Pas de partenariat fast-fashion. Pas de prise de parole politique. Pas de meme. Pas de réaction à chaud.',
    multiline: true,
    maxLength: 800,
  },
}

type Props = {
  bloc: BlocId | null
  values: Record<string, string>
  onSaved: (bloc: BlocId, value: string) => void
}

export function MarquePreview({ bloc, values, onSaved }: Props) {
  if (bloc === null) {
    return <Placeholder />
  }
  if (!estCasA(bloc)) {
    // CAS B — la sheet plein écran s'occupe de l'édition. Affiche un
    // rappel discret pour informer l'utilisateur (la sheet est déjà en
    // cours d'ouverture, donc on évite de polluer la colonne droite).
    return <Placeholder bloc={bloc} casB />
  }

  const champ = CHAMPS[bloc]
  if (!champ) return <Placeholder bloc={bloc} casB />

  return <EditeurInline bloc={bloc} champ={champ} initialValue={values[bloc] ?? ''} onSaved={onSaved} />
}

// ── Sous-composants ──────────────────────────────────────────────────

function Placeholder({ bloc, casB = false }: { bloc?: BlocId; casB?: boolean }) {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {casB && bloc
          ? `« ${BLOCS_LABELS[bloc]} » s'ouvre en plein écran pour te donner la place dont il a besoin.`
          : 'Sélectionne un élément pour le modifier.'}
      </p>
    </div>
  )
}

function EditeurInline({
  bloc,
  champ,
  initialValue,
  onSaved,
}: {
  bloc: BlocId
  champ: ChampInfo
  initialValue: string
  onSaved: (bloc: BlocId, value: string) => void
}) {
  const [value, setValue] = useState<string>(initialValue)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [pristine, setPristine] = useState(true)
  const blocRef = useRef<BlocId>(bloc)

  // Reset quand on change de bloc.
  useEffect(() => {
    if (blocRef.current !== bloc) {
      blocRef.current = bloc
      setValue(initialValue)
      setErreur(null)
      setPristine(true)
    }
  }, [bloc, initialValue])

  async function enregistrer() {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      setErreur('La valeur ne peut pas être vide.')
      return
    }
    setSaving(true)
    setErreur(null)
    try {
      const res = await fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: champ.field, value: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErreur((data as { detail?: string }).detail ?? 'Persistance impossible.')
        return
      }
      onSaved(bloc, trimmed)
      setPristine(true)
    } catch {
      setErreur('Connexion impossible. Réessaie dans un instant.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
      }}
    >
      <Breadcrumb items={['Ma Marque', BLOCS_LABELS[bloc]]} />
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#1C1C1E',
          margin: 0,
        }}
      >
        {BLOCS_LABELS[bloc]}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.6,
          color: 'rgba(0,0,0,0.55)',
          margin: 0,
          maxWidth: 480,
        }}
      >
        {champ.intro}
      </p>

      {champ.multiline ? (
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setPristine(false)
            setErreur(null)
          }}
          placeholder={champ.placeholder}
          rows={6}
          maxLength={champ.maxLength}
          aria-label={BLOCS_LABELS[bloc]}
          className="glass-thin"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 16,
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-system)',
            fontSize: 16,
            lineHeight: 1.5,
            color: '#1C1C1E',
            resize: 'vertical',
            minHeight: 160,
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setPristine(false)
            setErreur(null)
          }}
          placeholder={champ.placeholder}
          maxLength={champ.maxLength}
          aria-label={BLOCS_LABELS[bloc]}
          className="glass-thin"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 16,
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-system)',
            fontSize: 16,
            color: '#1C1C1E',
          }}
        />
      )}

      {erreur ? (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: '#FF3B30',
            margin: 0,
          }}
        >
          {erreur}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => void enregistrer()}
          disabled={saving || pristine || value.trim().length === 0}
          className="cfs-btn-primaire"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </article>
  )
}
