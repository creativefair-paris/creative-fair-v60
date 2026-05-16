// Sprint 37.K (F86) — Mockup Instagram iOS unifié et factorisé.
//
// Réutilisable partout (PostCreatorHubPreview, futurs mockups, mockup
// principal du conseiller, etc.). Username @creativefair.paris par défaut.
// Image remplie avec 6 halos pastels STATIQUES (pas d'animation drift) —
// signature visuelle Creative Fair.
//
// Refonte du Sprint 37.I F79 (qui utilisait tamarque.paris + gradient
// subtil) pour cohérence avec la marque Creative Fair.

import type { CSSProperties } from 'react'

type Props = {
  // Défaut '@creativefair.paris' — username de la marque CF, pas marque cliente.
  username?: string
  // Caption éditoriale Creative Fair par défaut.
  caption?: string
  // Timestamp affiché sous la caption ('Il y a 2 h' par défaut).
  timestamp?: string
  className?: string
  style?: CSSProperties
}

export function InstagramIOSMockup({
  username = 'creativefair.paris',
  caption = "L'histoire derrière ta création préférée…",
  timestamp = 'Il y a 2 h',
  className,
  style,
}: Props) {
  return (
    <div
      aria-hidden="true"
      className={`ig-ios-mockup${className ? ` ${className}` : ''}`}
      style={style}
    >
      <header className="ig-ios-mockup__header">
        <span className="ig-ios-mockup__story-ring">
          <span className="ig-ios-mockup__avatar" />
        </span>
        <span className="ig-ios-mockup__brand">{username}</span>
        <span className="ig-ios-mockup__more" aria-hidden="true">⋯</span>
      </header>

      {/* Image 4:5 portrait remplie avec 6 halos pastels statiques */}
      <div className="ig-ios-mockup__image">
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--1" aria-hidden="true" />
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--2" aria-hidden="true" />
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--3" aria-hidden="true" />
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--4" aria-hidden="true" />
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--5" aria-hidden="true" />
        <span className="ig-ios-mockup__halo ig-ios-mockup__halo--6" aria-hidden="true" />
      </div>

      <div className="ig-ios-mockup__actions">
        {/* Heart outline */}
        <span className="ig-ios-mockup__action-icon" aria-label="Like">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        {/* Comment outline */}
        <span className="ig-ios-mockup__action-icon" aria-label="Comment">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        {/* Direct paper plane */}
        <span className="ig-ios-mockup__action-icon" aria-label="Share">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </span>
        {/* Bookmark à droite */}
        <span className="ig-ios-mockup__action-icon ig-ios-mockup__action-icon--right" aria-label="Save">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      </div>

      <div className="ig-ios-mockup__caption">
        <p className="ig-ios-mockup__caption-line">
          <span className="ig-ios-mockup__caption-brand">{username}</span>{' '}
          <span className="ig-ios-mockup__caption-text">{caption}</span>
        </p>
        <p className="ig-ios-mockup__timestamp">{timestamp}</p>
      </div>

      <Styles />
    </div>
  )
}

function Styles() {
  return (
    <style>{`
      .ig-ios-mockup {
        width: 100%;
        max-width: 300px;
        background: #FFFFFF;
        border-radius: 14px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
      }
      .ig-ios-mockup__header {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        gap: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }
      /* Story ring dégradé Instagram official */
      .ig-ios-mockup__story-ring {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        padding: 2px;
        background: linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%);
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ig-ios-mockup__avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #FBFAF7 0%, #E8DFD0 100%);
        border: 2px solid #FFFFFF;
        display: inline-block;
        box-sizing: border-box;
      }
      .ig-ios-mockup__brand {
        font-size: 13px;
        font-weight: 600;
        color: #000000;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: -0.01em;
      }
      .ig-ios-mockup__more {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.85);
        letter-spacing: 2px;
        line-height: 1;
      }
      /* Image 4:5 portrait remplie de halos pastels statiques */
      .ig-ios-mockup__image {
        aspect-ratio: 4 / 5;
        background: #FBFAF7;
        position: relative;
        overflow: hidden;
      }
      .ig-ios-mockup__halo {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.6;
        pointer-events: none;
        /* Sprint 37.K (F86) — STATIQUES, pas d'animation drift. */
      }
      .ig-ios-mockup__halo--1 {
        width: 180px; height: 180px;
        background: radial-gradient(circle, rgba(255, 200, 220, 0.7) 0%, transparent 70%);
        top: -40px; left: -30px;
      }
      .ig-ios-mockup__halo--2 {
        width: 160px; height: 160px;
        background: radial-gradient(circle, rgba(200, 180, 255, 0.6) 0%, transparent 70%);
        top: 40px; right: -30px;
      }
      .ig-ios-mockup__halo--3 {
        width: 140px; height: 140px;
        background: radial-gradient(circle, rgba(180, 210, 255, 0.6) 0%, transparent 70%);
        bottom: -20px; left: 30%;
      }
      .ig-ios-mockup__halo--4 {
        width: 100px; height: 100px;
        background: radial-gradient(circle, rgba(255, 220, 180, 0.5) 0%, transparent 70%);
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      }
      .ig-ios-mockup__halo--5 {
        width: 80px; height: 80px;
        background: radial-gradient(circle, rgba(220, 200, 255, 0.5) 0%, transparent 70%);
        bottom: 20%; right: 15%;
      }
      .ig-ios-mockup__halo--6 {
        width: 120px; height: 120px;
        background: radial-gradient(circle, rgba(180, 230, 200, 0.4) 0%, transparent 70%);
        top: 20%; left: 30%;
      }
      .ig-ios-mockup__actions {
        display: flex;
        align-items: center;
        padding: 10px 12px 6px;
        gap: 16px;
        color: #000;
      }
      .ig-ios-mockup__action-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #000;
      }
      .ig-ios-mockup__action-icon--right {
        margin-left: auto;
      }
      .ig-ios-mockup__caption {
        padding: 2px 12px 12px;
        color: #000;
      }
      .ig-ios-mockup__caption-line {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        letter-spacing: -0.01em;
      }
      .ig-ios-mockup__caption-brand {
        font-weight: 600;
      }
      .ig-ios-mockup__caption-text {
        font-weight: 400;
      }
      .ig-ios-mockup__timestamp {
        margin: 6px 0 0;
        font-size: 11px;
        color: rgba(60, 60, 67, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    `}</style>
  )
}
