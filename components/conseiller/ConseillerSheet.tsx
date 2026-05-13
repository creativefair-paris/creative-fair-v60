// Sprint 37 (Lot 2) — Sheet conversationnelle conseiller.
//
// Composant central du conseiller en situation. UNE seule sheet pour les
// 8 voies d'accès (doc 09 §8, décision Apple #49).
//
// Anatomie (doc 09 §8) :
//   * 60% largeur desktop, 100% mobile (full-sheet iOS), 100% tablet
//     portrait (décision technique #11).
//   * Liquid Glass niveau 2 (fond translucide).
//   * Header sticky obligatoire avec le contexte de la session
//     (décision Apple #54).
//   * Boutons-choix prédominants, champ texte secondaire.
//   * Bouton fermer en haut à droite (conversation persistée).
//
// Machine à états client : IDLE → THINKING → TURN → DELIVERED. Le
// compteur de tours côté serveur (Lot 6) impose le plafond de 3 tours
// + bascule FORCED_DELIVERY au 4e (doc 09 §8). Côté client on suit
// l'état renvoyé par la server action.
//
// V1 (Lot 2) : la sheet est entièrement câblée côté UI. La server
// action runConseillerTurn() est branchée en Lot 6 (prompt système
// Anthropic). Pour permettre le développement isolé, on accepte un
// prop `onSendMessage` qui peut être stubbé.

'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ConseillerBubble, ConseillerBubblesFromText } from './ConseillerBubble'
import { PiloteBubble } from './PiloteBubble'
import { StreamingReasoning, type ReasoningStep } from './StreamingReasoning'
import {
  detectsFormalAddress,
  isTerminal,
  type ConseillerContext,
  type ConseillerState,
  type ConversationMessage,
  type ScenarioType,
} from '@/lib/conseiller/types'
import { scenarioVisual } from '@/lib/conseiller/scenario-palette'

// Réponse renvoyée par la server action (ou son stub côté Lot 2). Le
// streaming est simulé côté client via reasoningSteps que la server
// action peut émettre progressivement (Lot 6 utilisera Anthropic
// streaming → SSE → callback ici).
export type ConseillerTurnResult = {
  state: ConseillerState
  // Lignes de raisonnement à streamer avant la bulle de réponse.
  reasoningSteps: ReadonlyArray<ReasoningStep>
  // Réponse finale du conseiller (bulle). Si delivered, peut être
  // accompagnée d'options (boutons-choix) ou d'un payload structuré.
  message: string
  // Options prédominantes (doc 09 §8) — boutons-choix au-dessus du
  // champ texte. Cliquer dessus envoie la valeur comme prochain
  // message pilote.
  choices?: ReadonlyArray<{ id: string; label: string }>
  // Livrable final si state === DELIVERED. Schéma libre V1, Lot 6/7
  // typeront selon scenario_type.
  delivered_payload?: unknown
}

export type SendMessageFn = (input: {
  conversationId: string | null
  scenarioType: ScenarioType
  context: ConseillerContext | null
  message: string | null // null = ouverture initiale (charge contexte)
  userAddressesFormally: boolean
  // Messages précédents pour relance / suivi de tour.
  history: ReadonlyArray<ConversationMessage>
}) => Promise<{ conversationId: string; result: ConseillerTurnResult }>

type Props = {
  open: boolean
  onClose: () => void
  // ID de la conversation en cours (null = nouvelle session).
  conversationId?: string | null
  scenarioType: ScenarioType
  // Header sticky : texte du contexte. Ex : "Sur. Post jeudi 14h",
  // "Création de plan", "Bad buzz du jour".
  headerLabel: string
  // Contexte préchargé à passer à la server action.
  initialContext?: ConseillerContext
  // Server action (Lot 6) ou stub (Lot 2).
  onSendMessage: SendMessageFn
}

// CSS injecté inline pour rester self-contained (cohérent avec
// SheetMaMarque côté ma-marque).
const MOBILE_BREAKPOINT = 768
const TABLET_PORTRAIT_BREAKPOINT = 1024

export function ConseillerSheet({
  open,
  onClose,
  conversationId: initialConvId = null,
  scenarioType,
  headerLabel,
  initialContext,
  onSendMessage,
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [conversationId, setConversationId] = useState<string | null>(initialConvId)
  const [state, setState] = useState<ConseillerState>('IDLE')
  const [history, setHistory] = useState<ConversationMessage[]>([])
  const [currentSteps, setCurrentSteps] = useState<ReadonlyArray<ReasoningStep>>([])
  const [currentReply, setCurrentReply] = useState<string | null>(null)
  const [currentChoices, setCurrentChoices] = useState<
    ReadonlyArray<{ id: string; label: string }>
  >([])
  const [userAddressesFormally, setUserAddressesFormally] = useState(false)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ouverture initiale : charge contexte via server action (state passe
  // en CONTEXT_LOAD → THINKING_1 → TURN_1).
  useEffect(() => {
    if (!open) return
    if (state !== 'IDLE') return
    void runTurn(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Auto-scroll bottom à chaque nouveau message ou nouveau step.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [history, currentSteps, currentReply])

  // Esc + click overlay → close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const runTurn = useCallback(
    async (message: string | null) => {
      setPending(true)
      setError(null)
      setCurrentReply(null)
      setCurrentChoices([])
      // Bascule visuelle THINKING immédiate (les steps s'animent ensuite
      // via StreamingReasoning).
      setState((prev) =>
        prev === 'IDLE' || prev === 'CONTEXT_LOAD'
          ? 'THINKING_1'
          : prev === 'TURN_1'
            ? 'THINKING_2'
            : 'THINKING_3',
      )

      try {
        const { conversationId: newConvId, result } = await onSendMessage({
          conversationId,
          scenarioType,
          context: initialContext ?? null,
          message,
          userAddressesFormally,
          history,
        })
        setConversationId(newConvId)
        setCurrentSteps(result.reasoningSteps)
        // Délai cosmétique pour que les steps streamés se voient un
        // minimum avant l'apparition de la bulle conseiller. La cadence
        // réelle vient des steps eux-mêmes (StreamingReasoning).
        const visibleStepsMs = Math.max(
          800,
          (result.reasoningSteps.length - 1) * 1200,
        )
        await new Promise((r) => setTimeout(r, visibleStepsMs))
        setCurrentReply(result.message)
        setCurrentChoices(result.choices ?? [])
        setState(result.state)
        // Push la réponse dans l'historique (pour le tour suivant).
        setHistory((prev) => [
          ...prev,
          {
            role: 'conseiller',
            content: result.message,
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'erreur inconnue'
        setError(detail)
        setState('ERROR_FALLBACK')
      } finally {
        setPending(false)
      }
    },
    [
      conversationId,
      scenarioType,
      initialContext,
      userAddressesFormally,
      history,
      onSendMessage,
    ],
  )

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (trimmed.length === 0) return
      if (pending) return
      if (isTerminal(state)) return

      // Détection vouvoiement sur le 1er message pilote.
      const isFirstUserMessage = history.every((m) => m.role !== 'user')
      if (isFirstUserMessage && detectsFormalAddress(trimmed)) {
        setUserAddressesFormally(true)
      }

      setHistory((prev) => [
        ...prev,
        { role: 'user', content: trimmed, created_at: new Date().toISOString() },
      ])
      setInput('')
      void runTurn(trimmed)
    },
    [pending, state, history, runTurn],
  )

  const handleChoiceClick = useCallback(
    (choice: { id: string; label: string }) => {
      handleSubmit(choice.label)
    },
    [handleSubmit],
  )

  if (!open) return null

  const isThinkingNow =
    state === 'THINKING_1' || state === 'THINKING_2' || state === 'THINKING_3'

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conseiller-sheet-title"
      className="cfs-conseiller-overlay"
    >
      <div
        className="cfs-conseiller-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="cfs-conseiller-sheet">
        {/* Header sticky — pastille + label scénario + titre + croix */}
        <header className="cfs-conseiller-header">
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-tertiary-label)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: scenarioVisual(scenarioType).color,
                  display: 'inline-block',
                }}
              />
              {scenarioVisual(scenarioType).shortLabel}
            </span>
            <h2
              id="conseiller-sheet-title"
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-label)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {headerLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le conseiller"
            className="cfs-conseiller-close-btn"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M4 4 L14 14 M14 4 L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* Body scrollable — bulles + streaming */}
        <div ref={bodyRef} className="cfs-conseiller-body">
          {history.map((msg, i) => (
            <ConversationItem key={i} message={msg} />
          ))}

          {isThinkingNow && currentSteps.length > 0 ? (
            <ConseillerBubble pulsing>
              <StreamingReasoning
                steps={currentSteps}
                running={pending}
                {...(state === 'THINKING_1'
                  ? { mobileVerboseTitle: 'Je consulte ton contexte avant de te répondre.' }
                  : {})}
              />
            </ConseillerBubble>
          ) : null}

          {!isThinkingNow && currentReply ? (
            <ConseillerBubblesFromText
              text={currentReply}
              trailing={
                currentChoices.length > 0 ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {currentChoices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleChoiceClick(c)}
                        disabled={pending}
                        className="btn-choice"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                ) : null
              }
            />
          ) : null}

          {state === 'FORCED_DELIVERY' ? (
            <ConseillerBubble>
              <p style={{ margin: 0, color: 'var(--color-tertiary-label)', fontSize: 13 }}>
                Je te livre ce que j'ai. Si on tourne en rond, c'est qu'il
                manque une info que je n'ai pas. Continue à m'écrire ce qui
                ne va pas.
              </p>
            </ConseillerBubble>
          ) : null}

          {error ? (
            <ConseillerBubble>
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-system-red, #c0392b)',
                  fontSize: 14,
                }}
              >
                Je n'ai pas pu te répondre cette fois. {error}
              </p>
            </ConseillerBubble>
          ) : null}
        </div>

        {/* Footer — input texte. Bouton envoyer style dynamique
            (transparent/bleu) selon présence de texte (token Apple-grade). */}
        <footer className="cfs-conseiller-footer">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(input)
              }
            }}
            placeholder={
              isTerminal(state)
                ? 'Conversation close. Ouvre une nouvelle session pour continuer.'
                : 'Tape une autre direction…'
            }
            rows={2}
            disabled={pending || isTerminal(state)}
            className="cfs-conseiller-input"
            aria-label="Message au conseiller"
          />
          <button
            type="button"
            onClick={() => handleSubmit(input)}
            disabled={pending || isTerminal(state) || input.trim().length === 0}
            className={`cfs-conseiller-send-btn ${
              input.trim().length > 0 && !pending && !isTerminal(state)
                ? 'btn-send-active'
                : 'btn-send-inactive'
            }`}
            aria-label="Envoyer"
          >
            envoyer
          </button>
        </footer>
      </aside>

      <style>{`
        .cfs-conseiller-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          align-items: stretch;
          /* Sprint 37.A F1+F2 — Sheet flottante : marge 16px tout autour */
          padding: 16px 16px 16px 0;
          box-sizing: border-box;
          pointer-events: none;
        }
        .cfs-conseiller-overlay > * {
          pointer-events: auto;
        }
        .cfs-conseiller-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.18);
          animation: cfs-conseiller-overlay-in 250ms ease-out;
          pointer-events: auto;
        }
        .cfs-conseiller-sheet {
          position: relative;
          z-index: 1;
          width: min(640px, calc(100vw - 32px));
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(251, 250, 247, 0.92);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 20px rgba(0, 0, 0, 0.08);
          animation: cfs-conseiller-sheet-in-desktop 280ms ease-out;
        }
        @supports not (backdrop-filter: blur(20px)) {
          .cfs-conseiller-sheet {
            background: rgba(251, 250, 247, 0.98);
          }
        }
        .cfs-conseiller-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 22px;
          background: rgba(251, 250, 247, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .cfs-conseiller-close-btn {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          border: none;
          background: rgba(120, 120, 128, 0.12);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--color-label);
          transition: background-color 180ms ease-out;
        }
        .cfs-conseiller-close-btn:hover {
          background: rgba(120, 120, 128, 0.18);
        }
        .cfs-conseiller-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 20px 22px 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cfs-conseiller-footer {
          flex-shrink: 0;
          display: flex;
          gap: 8px;
          padding: 12px 18px 18px 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(251, 250, 247, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
        .cfs-conseiller-input {
          flex: 1;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-family: var(--font-system);
          font-size: 15px;
          line-height: 1.45;
          color: var(--color-label);
          background: rgba(255, 255, 255, 0.6);
          resize: none;
          outline: none;
          transition: border-color 180ms ease-out;
        }
        .cfs-conseiller-input:focus {
          border-color: #007AFF;
        }
        .cfs-conseiller-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .cfs-conseiller-send-btn {
          flex-shrink: 0;
          padding: 0 16px;
          border-radius: 12px;
          border: none;
          font-family: var(--font-system);
          font-size: 14px;
          font-weight: 600;
          transition: background-color 180ms ease-out, color 180ms ease-out, transform 120ms ease-out;
        }
        .cfs-conseiller-send-btn:disabled {
          cursor: not-allowed;
        }
        @keyframes cfs-conseiller-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cfs-conseiller-sheet-in-desktop {
          from { transform: translateX(32px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes cfs-conseiller-sheet-in-mobile {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        /* Tablet portrait + mobile = full-sheet (décision technique #11)
           → on supprime la marge flottante de l'overlay. */
        @media (max-width: ${TABLET_PORTRAIT_BREAKPOINT - 1}px) and (orientation: portrait) {
          .cfs-conseiller-overlay { padding: 0; }
          .cfs-conseiller-sheet {
            width: 100%;
            max-width: none;
            border-radius: 0;
            box-shadow: none;
          }
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .cfs-conseiller-overlay { padding: 0; }
          .cfs-conseiller-sheet {
            width: 100%;
            max-width: none;
            border-radius: 0;
            box-shadow: none;
            animation: cfs-conseiller-sheet-in-mobile 280ms ease-out;
          }
          .cfs-conseiller-header { padding: 16px 18px; }
          .cfs-conseiller-body { padding: 16px 18px 20px 18px; }
          .cfs-conseiller-footer { padding: 10px 16px 16px 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-conseiller-sheet,
          .cfs-conseiller-backdrop {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

function ConversationItem({ message }: { message: ConversationMessage }) {
  if (message.role === 'user') {
    return <PiloteBubble content={message.content} />
  }
  // Split visuel des bulles longues sur "\n\n---\n\n" (pattern Messages).
  return <ConseillerBubblesFromText text={message.content} />
}

// ── Stub SendMessageFn pour Lot 2 ────────────────────────────────────────
// Permet de tester la sheet en isolation. Lot 6 fournira la vraie
// implémentation (Anthropic streaming via server action).
export function createStubSendMessage(): SendMessageFn {
  return async ({ conversationId, message, scenarioType }) => {
    const newConvId = conversationId ?? 'stub-' + Math.random().toString(36).slice(2, 10)
    // 1er appel (message null) = ouverture / chargement contexte.
    if (message === null) {
      return {
        conversationId: newConvId,
        result: {
          state: 'TURN_1',
          reasoningSteps: [
            {
              inProgress: 'Je lis ton brand book',
              done: 'Ton brand book chargé. 3 piliers actifs détectés.',
            },
            {
              inProgress: 'Je consulte les ancres business',
              done: '2 ancres business à intégrer sur la période.',
            },
            {
              inProgress: 'Je construis ta proposition',
            },
          ],
          message:
            'Voici ce que je vois de ta marque. Tu veux que je te propose 3 angles ou tu préfères qu\'on commence par poser tes ancres business du mois ?',
          choices: [
            { id: 'angles', label: 'Propose-moi 3 angles' },
            { id: 'ancres', label: 'Pose les ancres business d\'abord' },
          ],
        },
      }
    }
    // Tours suivants — stub minimaliste.
    return {
      conversationId: newConvId,
      result: {
        state: 'DELIVERED',
        reasoningSteps: [
          {
            inProgress: 'Je consolide ta proposition',
            done: 'Proposition prête.',
          },
        ],
        message: `(Stub Lot 2 — scénario ${scenarioType}) Voici ma proposition basée sur "${message}". Lot 6 branchera Anthropic Opus 4.7 ici.`,
      },
    }
  }
}
