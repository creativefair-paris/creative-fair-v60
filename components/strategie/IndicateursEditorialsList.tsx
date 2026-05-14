// Sprint 37.H (F73 — Section 2) — Liste des indicateurs éditoriaux.
//
// 4 indicateurs : équilibre piliers / diversité formats / densité hebdo /
// couverture events. Status visuel ✅ aligned / ⚠️ partial / ✕ imbalanced.
//
// Vocabulaire interdit ici : KPI, performance, analytics, metrics, dashboard.

import type {
  IndicateursEditoriaux,
  IndicateurStatus,
} from '@/lib/programme/compute-indicateurs-editoriaux'

type Props = {
  indicateurs: IndicateursEditoriaux
}

const STATUS_VISUAL: Record<IndicateurStatus, { icon: string; color: string; label: string }> = {
  aligned: { icon: '✓', color: '#34C759', label: 'Aligné' },
  partial: { icon: '◔', color: '#FF9500', label: 'Partiel' },
  imbalanced: { icon: '!', color: '#FF3B30', label: 'Déséquilibré' },
}

const CADENCE_LABEL: Record<string, string> = {
  discreet: 'Discret (1-2/sem)',
  balanced: 'Équilibré (2-4/sem)',
  dense: 'Dense (5-7/sem)',
}

export function IndicateursEditorialsList({ indicateurs }: Props) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Équilibre piliers */}
      <IndicateurRow
        label={indicateurs.equilibre_piliers.label}
        status={indicateurs.equilibre_piliers.status}
        detail={
          indicateurs.equilibre_piliers.repartition.length === 0
            ? 'Aucun pilier détecté sur les posts du programme.'
            : `${indicateurs.equilibre_piliers.repartition
                .map((r) => `${r.pilier} ${r.pct}%`)
                .join(' · ')} — écart ${indicateurs.equilibre_piliers.ecart_pct} pts.`
        }
      />

      {/* Diversité formats */}
      <IndicateurRow
        label={indicateurs.diversite_formats.label}
        status={indicateurs.diversite_formats.status}
        detail={`${indicateurs.diversite_formats.used.length} formats sur ${indicateurs.diversite_formats.total_canoniques} canoniques utilisés${
          indicateurs.diversite_formats.used.length > 0
            ? ' : ' + indicateurs.diversite_formats.used.join(', ')
            : ''
        }.`}
      />

      {/* Densité hebdo */}
      <IndicateurRow
        label={indicateurs.densite_hebdo.label}
        status={indicateurs.densite_hebdo.status}
        detail={`${indicateurs.densite_hebdo.posts_par_semaine} post${
          indicateurs.densite_hebdo.posts_par_semaine === 1 ? '' : 's'
        } par semaine${
          indicateurs.densite_hebdo.cadence_attendue
            ? ` (cadence demandée : ${CADENCE_LABEL[indicateurs.densite_hebdo.cadence_attendue] ?? indicateurs.densite_hebdo.cadence_attendue})`
            : ''
        }.`}
      />

      {/* Couverture events */}
      <IndicateurRow
        label={indicateurs.couverture_events.label}
        status={indicateurs.couverture_events.status}
        detail={
          indicateurs.couverture_events.events_total === 0
            ? "Aucun event business sur la période."
            : `${indicateurs.couverture_events.events_anticipes} event${
                indicateurs.couverture_events.events_anticipes === 1 ? '' : 's'
              } sur ${indicateurs.couverture_events.events_total} couvert${
                indicateurs.couverture_events.events_anticipes === 1 ? '' : 's'
              } par au moins un post.`
        }
      />
    </ul>
  )
}

function IndicateurRow({
  label,
  status,
  detail,
}: {
  label: string
  status: IndicateurStatus
  detail: string
}) {
  const v = STATUS_VISUAL[status]
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${v.color}1A`,
          color: v.color,
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {v.icon}
      </span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-label)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            lineHeight: 1.45,
            color: 'var(--color-secondary-label)',
          }}
        >
          {detail}
        </span>
      </div>
      <span
        style={{
          flexShrink: 0,
          alignSelf: 'center',
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: v.color,
        }}
      >
        {v.label}
      </span>
    </li>
  )
}
