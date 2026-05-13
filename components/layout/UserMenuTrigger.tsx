// Sprint 36.B.1 — Trigger client de la bulle menu rond.
// Reçoit prenom/photoUrl/nomMarque depuis NavigationBar (server).
// Gère ouverture bulle + Sheet de confirmation déconnexion.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Avatar } from './Avatar'
import { Sheet } from './Sheet'
import { UserMenuBubble } from './UserMenuBubble'

type UserMenuTriggerProps = {
  prenom: string
  photoUrl?: string
  nomMarque: string
}

export function UserMenuTrigger({ prenom, photoUrl, nomMarque }: UserMenuTriggerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutRequest = useCallback(() => {
    setIsOpen(false)
    setIsLogoutSheetOpen(true)
  }, [])

  // Sprint 37.C (F27) — raccourcis clavier globaux ⌘1/2/3/⌘,
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const modifier = event.metaKey || event.ctrlKey
      if (!modifier) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      let route: string | null = null
      if (event.key === '1') route = '/programme'
      else if (event.key === '2') route = '/ma-marque'
      else if (event.key === '3') route = '/outils'
      else if (event.key === ',') route = '/compte'
      if (route) {
        event.preventDefault()
        router.push(route)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [router])

  const handleLogoutCancel = useCallback(() => {
    if (isLoggingOut) return
    setIsLogoutSheetOpen(false)
  }, [isLoggingOut])

  const handleLogoutConfirm = useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()
    } catch {
      // Best effort — on continue vers /login même si signOut échoue.
    }
    router.push('/login')
  }, [isLoggingOut, router])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="cfs-user-menu-trigger"
      >
        <Avatar prenom={prenom} photoUrl={photoUrl} size={44} />
      </button>

      {isOpen ? (
        <UserMenuBubble
          prenom={prenom}
          photoUrl={photoUrl}
          nomMarque={nomMarque}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogoutRequest}
        />
      ) : null}

      <Sheet
        open={isLogoutSheetOpen}
        title="Déconnexion"
        onDismiss={handleLogoutCancel}
      >
        <p className="cfs-logout-message">
          Tu veux te déconnecter de Creative Fair ?
        </p>
        <div className="cfs-logout-actions">
          <button
            type="button"
            onClick={handleLogoutCancel}
            disabled={isLoggingOut}
            className="cfs-logout-btn glass-thin"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            className="cfs-logout-btn cfs-logout-btn-destructive glass-thin"
          >
            {isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}
          </button>
        </div>
      </Sheet>
    </>
  )
}
