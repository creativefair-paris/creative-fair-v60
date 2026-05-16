// Sprint 37.L (F86.3) — Mockup Instagram iOS mai 2026 (pixel-près).
//
// Refonte complète du mockup Sprint 37.K (F86) pour alignement strict sur
// la capture Instagram iOS de référence (post @jc____b "Mexique") :
//   - Header : story ring conique 5 couleurs + ring blanc intérieur
//     + badge vérifié forme stamp 8 pointes + middle dot + timestamp FR
//     + localisation collée sous pseudo + bouton "...".
//   - Image : 1:1 strict (plus 4:5), border-radius 12px, chevron carousel
//     translucide à droite si carousel + dots pagination sous l'image.
//   - Action row : Heart → Comment → Repost → Share | Bookmark droite,
//     compteurs FR (330, 2, 11 ou "10,2 k" / "1,3 M").
//   - Caption : pseudo + badge inline avec le texte, "Voir la traduction"
//     ×2 (au-dessus du header + sous le caption).
//
// Doctrine : artefact graphique statique, zéro interaction, zéro animation,
// zéro état. API étendue mais 100% rétro-compatible (toutes props optionnelles).

import type { CSSProperties, ReactNode } from 'react'
import { InstagramStoryRing } from './InstagramStoryRing'
import { MetaVerifiedBadge } from './icons/MetaVerifiedBadge'
import { InstagramRepost } from './icons/InstagramRepost'

type Size = 'sm' | 'md' | 'lg'

export type InstagramIOSMockupProps = {
  username?: string
  isVerified?: boolean
  // Sprint 37.M (F86.3) — Default false : pas de halo, juste contour gris fin
  // (cohérent capture iOS référence Le Monde).
  hasStory?: boolean
  location?: string
  timestamp?: string
  avatarUrl?: string
  imageUrl?: string
  hasCarousel?: boolean
  slidesCount?: number
  activeSlide?: number
  likes?: number
  comments?: number
  reposts?: number
  caption?: string
  showTranslateButton?: boolean
  size?: Size
  className?: string
  style?: CSSProperties
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

// Format compteur FR : < 10 000 = brut, ≥ 10 000 = "10,2 k", ≥ 1 000 000 = "1,3 M".
// Locale fr : virgule décimale, espace insécable avant l'unité (U+00A0).
function formatCount(n: number): string {
  if (n < 10000) return String(n)
  if (n < 1_000_000) {
    const k = n / 1000
    // 1 décimale, virgule FR.
    const s = k.toFixed(1).replace('.', ',')
    return `${s} k`
  }
  const m = n / 1_000_000
  const s = m.toFixed(1).replace('.', ',')
  return `${s} M`
}

// ─────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────

export function InstagramIOSMockup({
  username = 'creativefair.paris',
  isVerified = true,
  hasStory = false,
  location,
  timestamp = '4 h',
  avatarUrl,
  imageUrl,
  hasCarousel = false,
  slidesCount = 1,
  activeSlide = 0,
  likes = 330,
  comments = 2,
  reposts = 11,
  caption = "L'histoire derrière ta création préférée…",
  showTranslateButton = false,
  size = 'md',
  className,
  style,
}: InstagramIOSMockupProps) {
  return (
    <div
      aria-hidden="true"
      className={`ig-ios-mockup${className ? ` ${className}` : ''}`}
      style={style}
    >
      {/* « Voir la traduction » au-dessus du header (apparaît sur certains posts FR). */}
      {showTranslateButton ? (
        <p className="ig-ios-mockup__translate-top">Voir la traduction</p>
      ) : null}

      <Header
        username={username}
        isVerified={isVerified}
        hasStory={hasStory}
        location={location}
        timestamp={timestamp}
        avatarUrl={avatarUrl}
        size={size}
      />

      <ImageBlock
        imageUrl={imageUrl}
        hasCarousel={hasCarousel}
        slidesCount={slidesCount}
        activeSlide={activeSlide}
      />

      <ActionRow likes={likes} comments={comments} reposts={reposts} />

      <Caption
        username={username}
        isVerified={isVerified}
        caption={caption}
        showTranslateButton={showTranslateButton}
      />

      <Styles />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────

function Header({
  username,
  isVerified,
  hasStory,
  location,
  timestamp,
  avatarUrl,
  size,
}: {
  username: string
  isVerified: boolean
  hasStory: boolean
  location: string | undefined
  timestamp: string
  avatarUrl: string | undefined
  size: Size
}) {
  // Sprint 37.M (F86.3) — Si pas d'avatarUrl, on injecte un <DefaultBrandAvatar>
  // brandé CF (gradient bleu→violet→orange + initiale). Sinon, l'image avatar
  // est rendue dans le ring directement via la prop avatarUrl.
  const initial = username.trim().charAt(0).toUpperCase() || 'C'
  return (
    <header className="ig-ios-mockup__header">
      <InstagramStoryRing size={size} hasStory={hasStory} avatarUrl={avatarUrl}>
        {avatarUrl ? null : <DefaultBrandAvatar initial={initial} />}
      </InstagramStoryRing>
      <div className="ig-ios-mockup__brand-block">
        <div className="ig-ios-mockup__brand-line">
          <span className="ig-ios-mockup__brand">{username}</span>
          {isVerified ? (
            <span className="ig-ios-mockup__brand-badge">
              <MetaVerifiedBadge size={14} />
            </span>
          ) : null}
          <span className="ig-ios-mockup__dot" aria-hidden="true">
            ·
          </span>
          <span className="ig-ios-mockup__timestamp-inline">{timestamp}</span>
        </div>
        {location ? <p className="ig-ios-mockup__location">{location}</p> : null}
      </div>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="ig-ios-mockup__more"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Image block (1:1 + carousel chevron + dots)
// ─────────────────────────────────────────────────────────────────────────

function ImageBlock({
  imageUrl,
  hasCarousel,
  slidesCount,
  activeSlide,
}: {
  imageUrl: string | undefined
  hasCarousel: boolean
  slidesCount: number
  activeSlide: number
}) {
  const showDots = slidesCount > 1
  return (
    <div className="ig-ios-mockup__image-wrap">
      <div className="ig-ios-mockup__image">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <CFGradientPlaceholder />
        )}

        {hasCarousel ? (
          <span className="ig-ios-mockup__chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </span>
        ) : null}
      </div>

      {showDots ? (
        <div className="ig-ios-mockup__dots" aria-hidden="true">
          {Array.from({ length: slidesCount }).map((_, i) => (
            <span
              key={i}
              className={`ig-ios-mockup__dot-pip${
                i === activeSlide ? ' ig-ios-mockup__dot-pip--active' : ''
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

// Sprint 37.N (F86.3) — Placeholder image crème ton sur ton (rollback
// saturation 37.M). Le gradient accent CTA (#007AFF → #A78BFA → #FB923C)
// utilisé en remplissage massif violait la doctrine v60 :
// `#007AFF` est un token d'accent CTA, pas un fond. Retour à une crème
// ton sur ton ultra-discrète (différence luminosité ~3-5%, effet "papier
// teinté"). Direction 135deg conservée pour cohérence structurelle.
// Subtraction-first : sur les éléments par défaut, sobriété > expression.
function CFGradientPlaceholder(): ReactNode {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #FBFAF7 0%, #F5F0EA 100%)',
      }}
    />
  )
}

// Sprint 37.M (F86.3) — Avatar par défaut brandé CF.
// Affiché dans le ring quand avatarUrl n'est pas fourni : gradient diagonal
// + initiale blanche (première lettre du username).
function DefaultBrandAvatar({ initial }: { initial: string }): ReactNode {
  return (
    <span
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(135deg, #007AFF 0%, #A78BFA 50%, #FB923C 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui',
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 1,
        letterSpacing: '-0.01em',
      }}
    >
      {initial}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Action row : Heart Comment Repost Share | Bookmark
// ─────────────────────────────────────────────────────────────────────────

function ActionRow({
  likes,
  comments,
  reposts,
}: {
  likes: number
  comments: number
  reposts: number
}) {
  return (
    <div className="ig-ios-mockup__actions">
      <div className="ig-ios-mockup__actions-left">
        <ActionWithCount
          label="Like"
          alwaysShow
          count={likes}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <ActionWithCount
          label="Comment"
          count={comments}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          }
        />
        <ActionWithCount
          label="Repost"
          count={reposts}
          icon={<InstagramRepost size={24} stroke="#000000" strokeWidth={2} />}
        />
        <span className="ig-ios-mockup__action-icon" aria-label="Share">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </span>
      </div>
      <span className="ig-ios-mockup__action-icon ig-ios-mockup__action-icon--bookmark" aria-label="Save">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </span>
    </div>
  )
}

function ActionWithCount({
  label,
  count,
  icon,
  alwaysShow,
}: {
  label: string
  count: number
  icon: ReactNode
  alwaysShow?: boolean
}) {
  const showCount = alwaysShow || count > 0
  return (
    <span className="ig-ios-mockup__action-with-count" aria-label={label}>
      <span className="ig-ios-mockup__action-icon">{icon}</span>
      {showCount ? (
        <span className="ig-ios-mockup__action-count">{formatCount(count)}</span>
      ) : null}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Caption + "Voir la traduction" sous le caption
// ─────────────────────────────────────────────────────────────────────────

// Sprint 37.M (F86.3) — Caption Instagram avec troncature "… plus".
// Si caption.length > maxChars, on slice et ajoute "… plus" en gris #737373
// (visuellement présent, non cliquable — mockup statique).
const CAPTION_MAX_CHARS = 70

function Caption({
  username,
  isVerified,
  caption,
  showTranslateButton,
}: {
  username: string
  isVerified: boolean
  caption: string
  showTranslateButton: boolean
}) {
  const isTruncated = caption.length > CAPTION_MAX_CHARS
  const visibleText = isTruncated ? caption.slice(0, CAPTION_MAX_CHARS).trimEnd() : caption
  return (
    <div className="ig-ios-mockup__caption">
      <p className="ig-ios-mockup__caption-line">
        <span className="ig-ios-mockup__caption-brand">{username}</span>
        {isVerified ? (
          <span className="ig-ios-mockup__caption-badge">
            <MetaVerifiedBadge size={12} />
          </span>
        ) : null}
        {' '}
        <span className="ig-ios-mockup__caption-text">
          {visibleText}
          {isTruncated ? (
            <>
              {'… '}
              <span className="ig-ios-mockup__caption-more">plus</span>
            </>
          ) : null}
        </span>
      </p>
      {showTranslateButton ? (
        <p className="ig-ios-mockup__translate-bottom">Voir la traduction</p>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Styles scopés (préfixe ig-ios-mockup__*)
// ─────────────────────────────────────────────────────────────────────────

function Styles() {
  return (
    <style>{`
      .ig-ios-mockup {
        width: 100%;
        max-width: 320px;
        background: #FFFFFF;
        border-radius: 14px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        color: #000000;
      }
      .ig-ios-mockup__translate-top {
        margin: 0;
        padding: 8px 12px 4px;
        font-size: 13px;
        font-weight: 500;
        color: #000000;
        letter-spacing: -0.01em;
      }
      .ig-ios-mockup__header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        gap: 10px;
      }
      .ig-ios-mockup__brand-block {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .ig-ios-mockup__brand-line {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .ig-ios-mockup__brand {
        font-size: 14px;
        font-weight: 600;
        color: #000000;
        letter-spacing: -0.01em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 60%;
      }
      .ig-ios-mockup__brand-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      .ig-ios-mockup__dot {
        font-size: 14px;
        color: #737373;
        line-height: 1;
        padding: 0 0;
      }
      .ig-ios-mockup__timestamp-inline {
        font-size: 14px;
        font-weight: 400;
        color: #737373;
        white-space: nowrap;
      }
      .ig-ios-mockup__location {
        margin: 1px 0 0 0;
        font-size: 13px;
        font-weight: 500;
        color: #000000;
        letter-spacing: -0.01em;
      }
      .ig-ios-mockup__more {
        margin-left: auto;
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: 0;
        color: #000000;
        cursor: default;
      }

      /* Image 1:1 (carré strict) + border-radius 12px */
      .ig-ios-mockup__image-wrap {
        position: relative;
        padding: 0 0 0 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .ig-ios-mockup__image {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        background: #FBFAF7;
        overflow: hidden;
        border-radius: 12px;
      }
      .ig-ios-mockup__chevron {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ig-ios-mockup__dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .ig-ios-mockup__dot-pip {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        display: inline-block;
      }
      .ig-ios-mockup__dot-pip--active {
        background: #0095F6;
      }

      /* Action row */
      .ig-ios-mockup__actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        height: 48px;
        box-sizing: border-box;
      }
      .ig-ios-mockup__actions-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .ig-ios-mockup__action-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: #000000;
        line-height: 0;
      }
      .ig-ios-mockup__action-with-count {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .ig-ios-mockup__action-count {
        font-size: 14px;
        font-weight: 500;
        color: #000000;
        letter-spacing: -0.01em;
        line-height: 1;
      }
      .ig-ios-mockup__action-icon--bookmark {
        margin-left: 0;
      }

      /* Caption */
      .ig-ios-mockup__caption {
        padding: 0 16px 12px;
      }
      .ig-ios-mockup__caption-line {
        margin: 0;
        font-size: 14px;
        line-height: 18px;
        letter-spacing: -0.01em;
        color: #000000;
      }
      .ig-ios-mockup__caption-brand {
        font-weight: 600;
      }
      .ig-ios-mockup__caption-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: -2px;
        margin-left: 4px;
        line-height: 0;
      }
      .ig-ios-mockup__caption-text {
        font-weight: 400;
      }
      .ig-ios-mockup__caption-more {
        color: #737373;
        font-weight: 400;
      }
      .ig-ios-mockup__translate-bottom {
        margin: 6px 0 0;
        font-size: 13px;
        font-weight: 500;
        color: #737373;
      }
    `}</style>
  )
}
