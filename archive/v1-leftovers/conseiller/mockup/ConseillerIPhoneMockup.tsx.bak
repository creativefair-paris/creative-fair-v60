// Sprint 37.K (F88) — Mockup conseiller iPhone-like style iOS Messages.
//
// Refonte du ConseillerMockup Sprint 37.D F28 (bulle bleu plate +
// boutons-choix verticaux). Nouveau rendu plus attractif :
// - Header iOS Messages : flèche retour + avatar conseiller + nom + ⓘ
// - Avatar : dégradé halos signature CF (rose → lilas → bleu pâle)
// - 3 bulles de conversation alternées (user iMessage bleu droite /
//   assistant gris clair gauche)
// - Input bar décorative en bas (visuel seulement)
// - Vocabulaire : "conseiller" en minuscule, tutoiement par défaut

import type { CSSProperties } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
}

export function ConseillerIPhoneMockup({ className, style }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`cseiller-iphone${className ? ` ${className}` : ''}`}
      style={style}
    >
      <header className="cseiller-iphone__header">
        <span className="cseiller-iphone__back" aria-hidden="true">‹</span>
        <span className="cseiller-iphone__contact">
          <span className="cseiller-iphone__avatar" />
          <span className="cseiller-iphone__name">conseiller</span>
        </span>
        <span className="cseiller-iphone__info" aria-hidden="true">ⓘ</span>
      </header>

      <div className="cseiller-iphone__messages">
        {/* Bulle utilisateur (droite, bleu iMessage) */}
        <div className="cseiller-iphone__bubble cseiller-iphone__bubble--user">
          J&apos;aimerais lancer une série sur l&apos;histoire de mes pièces
        </div>

        {/* Bulle conseiller (gauche, gris clair) */}
        <div className="cseiller-iphone__bubble cseiller-iphone__bubble--assistant">
          Bonne idée. On regarde tes archives ensemble pour identifier 3 pièces qui méritent leur récit.
        </div>

        {/* Bulle utilisateur courte (droite) */}
        <div className="cseiller-iphone__bubble cseiller-iphone__bubble--user cseiller-iphone__bubble--short">
          On commence quand ?
        </div>
      </div>

      <div className="cseiller-iphone__input-bar">
        <span className="cseiller-iphone__input-field">Message</span>
        <span className="cseiller-iphone__send-btn" aria-hidden="true">↑</span>
      </div>

      <Styles />
    </div>
  )
}

function Styles() {
  return (
    <style>{`
      .cseiller-iphone {
        width: 100%;
        max-width: 300px;
        background: #FFFFFF;
        border-radius: 14px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
      }
      .cseiller-iphone__header {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        gap: 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        background: rgba(247, 247, 247, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .cseiller-iphone__back {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 22px;
        font-weight: 600;
        line-height: 1;
        color: #007AFF;
        width: 20px;
      }
      .cseiller-iphone__contact {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        gap: 2px;
      }
      .cseiller-iphone__avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        /* Sprint 37.K (F88) — Dégradé halos signature CF en avatar. */
        background: linear-gradient(135deg, #FFB5C5 0%, #C8B5FF 50%, #B5D5FF 100%);
      }
      .cseiller-iphone__name {
        font-size: 10px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -0.1px;
        color: rgba(0, 0, 0, 0.7);
      }
      .cseiller-iphone__info {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 17px;
        line-height: 1;
        color: #007AFF;
        width: 20px;
      }
      .cseiller-iphone__messages {
        flex: 1;
        padding: 12px 12px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: #FFFFFF;
      }
      .cseiller-iphone__bubble {
        max-width: 78%;
        padding: 8px 12px;
        border-radius: 18px;
        font-size: 13px;
        line-height: 1.35;
        word-wrap: break-word;
        letter-spacing: -0.01em;
      }
      /* Bulle utilisateur — bleu iMessage à droite */
      .cseiller-iphone__bubble--user {
        align-self: flex-end;
        background: #007AFF;
        color: #FFFFFF;
        border-bottom-right-radius: 4px;
      }
      /* Bulle conseiller — gris clair à gauche */
      .cseiller-iphone__bubble--assistant {
        align-self: flex-start;
        background: #E9E9EB;
        color: #000000;
        border-bottom-left-radius: 4px;
      }
      .cseiller-iphone__bubble--short {
        max-width: 60%;
      }
      .cseiller-iphone__input-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
      }
      .cseiller-iphone__input-field {
        flex: 1;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 18px;
        padding: 6px 14px;
        font-size: 13px;
        line-height: 1.4;
        color: rgba(0, 0, 0, 0.4);
      }
      .cseiller-iphone__send-btn {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #007AFF;
        color: #FFFFFF;
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `}</style>
  )
}
