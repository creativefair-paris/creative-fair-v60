// Sprint 37.B (F11) — Primitive DataTable.
//
// Tableau stylé alimenté par les headers/rows extraits du markdown.
// alignments[] optionnel (par colonne, left/center/right). Wrapper
// scroll-x sur mobile (-webkit-overflow-scrolling: touch).

type Alignment = 'left' | 'center' | 'right'

type Props = {
  headers: ReadonlyArray<string>
  rows: ReadonlyArray<ReadonlyArray<string | number>>
  alignments?: ReadonlyArray<Alignment>
  caption?: string
}

export function DataTable({ headers, rows, alignments, caption }: Props) {
  return (
    <div className="data-table-wrapper">
      {caption ? <span className="data-table__caption">{caption}</span> : null}
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} data-align={alignments?.[i] ?? 'left'}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} data-align={alignments?.[ci] ?? 'left'}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
