// Sprint 37.B (F11.2) — Rendu d'un arbre de tokens markdown étendus.
//
// Consomme la sortie de parseRichMarkdown(text). Rend les primitives
// CalloutBox / DataTable / DocumentaryCard / Timeline + paragraphes,
// headings, listes, quotes.

import { Fragment, type ReactNode } from 'react'
import { CalloutBox } from './CalloutBox'
import { DataTable } from './DataTable'
import { DocumentaryCard } from './DocumentaryCard'
import { Timeline } from './Timeline'
import {
  parseInline,
  parseRichMarkdown,
  type InlineSegment,
  type RichToken,
} from '@/lib/conseiller/markdown-parser'

type Props = {
  text: string
}

export function RichMarkdown({ text }: Props) {
  const tokens = parseRichMarkdown(text)
  return (
    <>
      {tokens.map((t, i) => (
        <Fragment key={i}>{renderToken(t, i)}</Fragment>
      ))}
    </>
  )
}

function renderToken(token: RichToken, key: number): ReactNode {
  switch (token.kind) {
    case 'heading': {
      const Tag = (token.level === 3 ? 'h3' : 'h4') as 'h3' | 'h4'
      return (
        <Tag
          className={token.level === 3 ? 'bulle-h3' : 'bulle-h4'}
          style={{
            fontFamily: 'var(--font-system, system-ui)',
            fontSize: token.level === 3 ? 17 : 15,
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#000',
            margin: '12px 0 6px 0',
          }}
        >
          {renderInline(parseInline(token.text))}
        </Tag>
      )
    }
    case 'paragraph':
      return (
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          {renderInline(parseInline(token.text))}
        </p>
      )
    case 'list': {
      const ListTag = (token.ordered ? 'ol' : 'ul') as 'ol' | 'ul'
      return (
        <ListTag
          style={{
            margin: '8px 0',
            paddingLeft: 20,
            lineHeight: 1.6,
          }}
        >
          {token.items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              {renderInline(parseInline(it))}
            </li>
          ))}
        </ListTag>
      )
    }
    case 'quote':
      return (
        <blockquote
          style={{
            margin: '12px 0',
            padding: '6px 14px',
            borderLeft: '3px solid rgba(0, 0, 0, 0.15)',
            color: 'rgba(0, 0, 0, 0.7)',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          {renderInline(parseInline(token.text))}
        </blockquote>
      )
    case 'table':
      return (
        <DataTable
          headers={token.headers}
          rows={token.rows}
          alignments={token.alignments}
        />
      )
    case 'callout':
      return (
        <CalloutBox variant={token.variant} {...(token.title ? { title: token.title } : {})}>
          <RichMarkdown text={token.content} />
        </CalloutBox>
      )
    case 'documentary':
      return (
        <DocumentaryCard
          title={token.title}
          description={token.description}
          {...(token.source ? { source: token.source } : {})}
          {...(token.sourceUrl ? { sourceUrl: token.sourceUrl } : {})}
          {...(token.imageUrl ? { imageUrl: token.imageUrl } : {})}
          {...(token.date ? { date: token.date } : {})}
        />
      )
    case 'timeline':
      return <Timeline items={token.items} />
    default:
      // Garde TS exhaustivité — n'arrivera jamais.
      return null
  }
}

function renderInline(segments: ReadonlyArray<InlineSegment>): ReactNode {
  return segments.map((s, i) => {
    if (s.kind === 'bold') return <strong key={i}>{s.text}</strong>
    if (s.kind === 'italic') return <em key={i}>{s.text}</em>
    return <Fragment key={i}>{s.text}</Fragment>
  })
}
