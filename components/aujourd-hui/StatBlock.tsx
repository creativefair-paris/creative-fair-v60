// Sprint 36.C — Bloc gros chiffre Pattern A (Apple Health style).
// Liquid Glass niveau 2 (cards). Pas de comparaison entre utilisateurs.
// Le chiffre est factuel, le label en uppercase 11px iOS.

type Props = {
  value: string | number
  label: string
}

export function StatBlock({ value, label }: Props) {
  return (
    <div className="cfs-stat-block glass-thin">
      <span className="cfs-stat-value">{value}</span>
      <span className="cfs-stat-label">{label}</span>
    </div>
  )
}
