// Sprint 37.B (F11.2) — Parser markdown étendu pour le conseiller.
//
// Détecte les blocs spéciaux du modèle Anthropic + le markdown
// classique de base. Sortie : un tableau de tokens consommés par
// <RichMarkdown />.
//
// Blocs détectés :
//   - :::callout-recommendation | callout-warning | callout-info : … :::
//   - :::documentary : key=value pairs, fermé par :::
//   - :::timeline : - date | title | description | type=milestone , fermé par :::
//   - Tables markdown ( | col | col | … |---|---|… )
//   - Headers # / ##
//   - Listes - / numérotées 1.
//   - Quotes >
//   - Paragraphes simples (le reste)
//
// Le parser est ligne-à-ligne, tolérant aux variations de format.

export type RichToken =
  | { kind: 'heading'; level: 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | {
      kind: 'table'
      headers: string[]
      rows: string[][]
      alignments: ReadonlyArray<'left' | 'center' | 'right'>
    }
  | {
      kind: 'callout'
      variant: 'recommendation' | 'warning' | 'info'
      title?: string
      content: string
    }
  | {
      kind: 'documentary'
      title: string
      description: string
      source?: string
      sourceUrl?: string
      imageUrl?: string
      date?: string
    }
  | {
      kind: 'timeline'
      items: Array<{
        date: string
        title: string
        description?: string
        type?: 'milestone' | 'standard'
      }>
    }

function parseTableAlignment(divider: string): 'left' | 'center' | 'right' {
  const trimmed = divider.trim()
  const startsColon = trimmed.startsWith(':')
  const endsColon = trimmed.endsWith(':')
  if (startsColon && endsColon) return 'center'
  if (endsColon) return 'right'
  return 'left'
}

function isTableHeaderLine(line: string): boolean {
  return /^\s*\|.+\|\s*$/.test(line)
}

function isTableDividerLine(line: string): boolean {
  return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line)
}

function splitTableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
}

export function parseRichMarkdown(text: string): RichToken[] {
  const tokens: RichToken[] = []
  const lines = text.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // 1. Ligne vide → on saute.
    if (trimmed.length === 0) {
      i++
      continue
    }

    // 2. Bloc :::callout-xxx :::
    const calloutMatch = trimmed.match(/^:::callout-(recommendation|warning|info)(?:\s+(.+))?$/)
    if (calloutMatch) {
      const variant = calloutMatch[1] as 'recommendation' | 'warning' | 'info'
      const title = calloutMatch[2]?.trim() || undefined
      i++
      const buf: string[] = []
      while (i < lines.length && lines[i]?.trim() !== ':::') {
        buf.push(lines[i] ?? '')
        i++
      }
      if (i < lines.length) i++ // saute le `:::` de fermeture
      tokens.push({
        kind: 'callout',
        variant,
        ...(title ? { title } : {}),
        content: buf.join('\n').trim(),
      })
      continue
    }

    // 3. Bloc :::documentary :::
    if (trimmed === ':::documentary') {
      i++
      const fields: Record<string, string> = {}
      while (i < lines.length && lines[i]?.trim() !== ':::') {
        const l = lines[i] ?? ''
        const colonIdx = l.indexOf(':')
        if (colonIdx > 0) {
          const key = l.slice(0, colonIdx).trim().toLowerCase()
          const value = l.slice(colonIdx + 1).trim()
          if (key) fields[key] = value
        }
        i++
      }
      if (i < lines.length) i++
      const doc: Extract<RichToken, { kind: 'documentary' }> = {
        kind: 'documentary',
        title: fields['title'] ?? 'Document',
        description: fields['description'] ?? '',
      }
      if (fields['source']) doc.source = fields['source']
      if (fields['sourceurl']) doc.sourceUrl = fields['sourceurl']
      if (fields['imageurl']) doc.imageUrl = fields['imageurl']
      if (fields['date']) doc.date = fields['date']
      tokens.push(doc)
      continue
    }

    // 4. Bloc :::timeline :::
    if (trimmed === ':::timeline') {
      i++
      const items: Array<{
        date: string
        title: string
        description?: string
        type?: 'milestone' | 'standard'
      }> = []
      while (i < lines.length && lines[i]?.trim() !== ':::') {
        const l = (lines[i] ?? '').trim()
        if (l.startsWith('-')) {
          const raw = l.replace(/^-\s*/, '')
          const parts = raw.split('|').map((p) => p.trim())
          if (parts.length >= 2) {
            let type: 'milestone' | 'standard' = 'standard'
            // Le dernier segment peut être "type=milestone".
            const last = parts[parts.length - 1] ?? ''
            if (/^type\s*=\s*milestone$/i.test(last)) {
              type = 'milestone'
              parts.pop()
            }
            const item: {
              date: string
              title: string
              description?: string
              type?: 'milestone' | 'standard'
            } = {
              date: parts[0] ?? '',
              title: parts[1] ?? '',
              ...(type !== 'standard' ? { type } : {}),
            }
            if (parts[2]) item.description = parts[2]
            items.push(item)
          }
        }
        i++
      }
      if (i < lines.length) i++
      tokens.push({ kind: 'timeline', items })
      continue
    }

    // 5. Table markdown : ligne header + divider sur la ligne suivante.
    if (
      isTableHeaderLine(line) &&
      i + 1 < lines.length &&
      isTableDividerLine(lines[i + 1] ?? '')
    ) {
      const headers = splitTableCells(line)
      const dividerCells = splitTableCells(lines[i + 1] ?? '')
      const alignments = dividerCells.map(parseTableAlignment)
      i += 2
      const rows: string[][] = []
      while (
        i < lines.length &&
        isTableHeaderLine(lines[i] ?? '') &&
        !isTableDividerLine(lines[i] ?? '')
      ) {
        rows.push(splitTableCells(lines[i] ?? ''))
        i++
      }
      tokens.push({ kind: 'table', headers, rows, alignments })
      continue
    }

    // 6. Heading H3 / H4 (## ou #). Sentence case attendu.
    if (trimmed.startsWith('## ')) {
      tokens.push({ kind: 'heading', level: 4, text: trimmed.slice(3).trim() })
      i++
      continue
    }
    if (trimmed.startsWith('# ')) {
      tokens.push({ kind: 'heading', level: 3, text: trimmed.slice(2).trim() })
      i++
      continue
    }

    // 7. Liste : - … ou 1. …
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/)
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (bulletMatch || numberedMatch) {
      const ordered = !!numberedMatch
      const items: string[] = []
      while (i < lines.length) {
        const l = (lines[i] ?? '').trim()
        const bm = l.match(/^[-*]\s+(.+)$/)
        const nm = l.match(/^\d+\.\s+(.+)$/)
        if (ordered && nm) {
          items.push(nm[1] ?? '')
        } else if (!ordered && bm) {
          items.push(bm[1] ?? '')
        } else {
          break
        }
        i++
      }
      tokens.push({ kind: 'list', ordered, items })
      continue
    }

    // 8. Quote.
    if (trimmed.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('> ')) {
        buf.push((lines[i] ?? '').trim().slice(2))
        i++
      }
      tokens.push({ kind: 'quote', text: buf.join(' ') })
      continue
    }

    // 9. Paragraphe (consomme jusqu'à la prochaine ligne vide / structure).
    const paragraph: string[] = [line]
    i++
    while (i < lines.length) {
      const l = lines[i] ?? ''
      const t = l.trim()
      if (t.length === 0) break
      if (t.startsWith(':::')) break
      if (t.startsWith('# ') || t.startsWith('## ')) break
      if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) break
      if (t.startsWith('> ')) break
      if (isTableHeaderLine(l) && i + 1 < lines.length && isTableDividerLine(lines[i + 1] ?? '')) {
        break
      }
      paragraph.push(l)
      i++
    }
    tokens.push({ kind: 'paragraph', text: paragraph.join('\n').trim() })
  }

  return tokens
}

// ── Inline markdown (bold + italic) ──────────────────────────────────────
// Conversion minimale "**x**" → <strong> et "*x*" → <em>. On retourne
// un tableau de segments typés pour rendu React. Pas de support d'imbri-
// cation profonde, suffisant pour les sorties Anthropic.

export type InlineSegment =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }

export function parseInline(text: string): InlineSegment[] {
  const out: InlineSegment[] = []
  // Regex globale : capture **xxx** ou *xxx* ou texte brut.
  // Important : on traite ** avant * en ordre d'apparition.
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ kind: 'text', text: text.slice(last, m.index) })
    }
    if (m[1] !== undefined) {
      out.push({ kind: 'bold', text: m[1] })
    } else if (m[2] !== undefined) {
      out.push({ kind: 'italic', text: m[2] })
    }
    last = m.index + m[0].length
  }
  if (last < text.length) {
    out.push({ kind: 'text', text: text.slice(last) })
  }
  return out
}
