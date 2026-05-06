import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConseillerLayout } from '@/components/conseiller/ConseillerLayout'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ConversationRow = {
  id: string
  messages: Message[] | null
  updated_at: string
  context_page: string | null
}

function titleFromMessages(messages: Message[] | null, fallback: string): string {
  if (!messages || messages.length === 0) return 'Nouvelle conversation'
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return fallback
  const text = firstUser.content.trim()
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

export default async function ConseillerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('conversations')
    .select('id, messages, updated_at, context_page')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  const conversations = (rows as ConversationRow[] | null) ?? []

  const initial = conversations.map((c) => {
    const messages = Array.isArray(c.messages) ? c.messages : []
    return {
      id: c.id,
      title: titleFromMessages(messages, 'Conversation'),
      updatedAt: c.updated_at,
      messages,
    }
  })

  return <ConseillerLayout initial={initial} />
}
