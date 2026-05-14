// Sprint 37.F (F61) — Shell partagé entre /programme/*.
//
// Header unifié (PageHeader + breadcrumb) + Split Brief avec sidebar
// constante à gauche et content variable à droite. Pattern aligné avec
// /outils (Sprint 37.C F22).

import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ProgrammeSidebar,
  type ProgrammeSidebarActiveItem,
} from './ProgrammeSidebar'

type Props = {
  activeItem: ProgrammeSidebarActiveItem
  children: ReactNode
}

export function ProgrammeSplitShell({ activeItem, children }: Props) {
  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <PageHeader title="Mon Programme" />

        <div
          className="cfs-page-container"
          style={{
            flex: 1,
            paddingBottom: 'var(--space-12)',
          }}
        >
          <div className="cfs-programme-split">
            <aside className="cfs-programme-split-sidebar">
              <ProgrammeSidebar activeItem={activeItem} />
            </aside>
            <section className="cfs-programme-split-preview">{children}</section>
          </div>
        </div>
      </div>

      <style>{`
        .cfs-programme-split {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          align-items: start;
          padding-top: var(--space-4);
        }
        .cfs-programme-split-sidebar {
          position: sticky;
          top: 24px;
        }
        @media (max-width: 900px) {
          .cfs-programme-split {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .cfs-programme-split-sidebar {
            position: static;
          }
        }
      `}</style>
    </main>
  )
}
