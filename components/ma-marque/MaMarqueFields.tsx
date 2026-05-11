// Sprint 36.B.1 — Bloc Field cliquable avec bouton "Modifier".
// Wrapper client qui orchestre l'EditBlocSheet pour les 4 champs Ma Marque.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditBlocSheet, type BrandFieldColumn } from './EditBlocSheet'

type FieldDef = {
  labelUI: string
  columnName: BrandFieldColumn
  maxLength: number
  multiline: boolean
}

const FIELDS: FieldDef[] = [
  { labelUI: 'Nom', columnName: 'name', maxLength: 80, multiline: false },
  { labelUI: 'Secteur', columnName: 'secteur', maxLength: 120, multiline: false },
  { labelUI: 'Voix', columnName: 'ton', maxLength: 280, multiline: true },
  { labelUI: 'Singularité', columnName: 'singularite', maxLength: 400, multiline: true },
]

type MaMarqueFieldsProps = {
  initialValues: Record<BrandFieldColumn, string>
}

export function MaMarqueFields({ initialValues }: MaMarqueFieldsProps) {
  const router = useRouter()
  const [values, setValues] = useState<Record<BrandFieldColumn, string>>(initialValues)
  const [openField, setOpenField] = useState<BrandFieldColumn | null>(null)

  const currentDef = FIELDS.find((f) => f.columnName === openField) ?? null

  return (
    <>
      <div className="cfs-ma-marque-fields">
        {FIELDS.map((field) => (
          <section
            key={field.columnName}
            className="cfs-ma-marque-field glass-thin"
          >
            <button
              type="button"
              onClick={() => setOpenField(field.columnName)}
              className="cfs-ma-marque-field__edit glass-thin"
              aria-label={`Modifier ${field.labelUI}`}
            >
              Modifier
            </button>
            <span className="cfs-ma-marque-field__label">{field.labelUI}</span>
            <span className="cfs-ma-marque-field__value">
              {values[field.columnName] || '—'}
            </span>
          </section>
        ))}
      </div>

      {currentDef ? (
        <EditBlocSheet
          open={openField !== null}
          onClose={() => setOpenField(null)}
          labelUI={currentDef.labelUI}
          columnName={currentDef.columnName}
          currentValue={values[currentDef.columnName] ?? ''}
          maxLength={currentDef.maxLength}
          multiline={currentDef.multiline}
          onSaved={(newValue) => {
            setValues((prev) => ({ ...prev, [currentDef.columnName]: newValue }))
            // Re-fetch côté server pour rafraîchir les autres données dérivées
            router.refresh()
          }}
        />
      ) : null}
    </>
  )
}
