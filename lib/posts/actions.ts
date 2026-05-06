'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getBrandIdForCurrentUser } from '@/lib/supabase/brands'

export type CreatePostInput = {
  type:
    | 'anecdote_live'
    | 'anecdote_custom'
    | 'reels'
    | 'story'
    | 'newsletter'
    | 'unsupported'
  scheduledFor?: string | null
  initialContent?: Record<string, unknown> | null
  redirectAfter?: 'creator' | 'calendar'
}

type InsertedRow = { id: string }

export async function createPost(input: CreatePostInput): Promise<{ id: string }> {
  const supabase = await createClient()
  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) {
    throw new Error('No brand for current user')
  }

  const insertable = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: InsertedRow | null
            error: { message: string } | null
          }>
        }
      }
    }
  }

  const { data, error } = await insertable
    .from('posts')
    .insert([
      {
        brand_id: ctx.brandId,
        tenant_id: ctx.tenantId,
        type: input.type,
        status: 'draft',
        scheduled_for: input.scheduledFor ?? null,
        content: input.initialContent ?? null,
      },
    ])
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Insert failed')
  }

  revalidatePath('/calendrier')

  if (input.redirectAfter === 'creator') {
    redirect(`/post-creator/${data.id}`)
  }

  return { id: data.id }
}

export async function deletePost(postId: string): Promise<void> {
  const supabase = await createClient()
  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) throw new Error('No brand for current user')

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw new Error(error.message)

  revalidatePath('/calendrier')
}

export async function updatePostSchedule(
  postId: string,
  scheduledFor: string | null,
): Promise<void> {
  const supabase = await createClient()

  const updatable = supabase as unknown as {
    from: (t: string) => {
      update: (vals: unknown) => {
        eq: (
          col: string,
          val: string,
        ) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  const { error } = await updatable
    .from('posts')
    .update({ scheduled_for: scheduledFor, updated_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) throw new Error(error.message)

  revalidatePath('/calendrier')
}

export async function updatePostStatus(
  postId: string,
  status: 'draft' | 'in_progress' | 'ready' | 'scheduled' | 'published',
): Promise<void> {
  const supabase = await createClient()

  const updatable = supabase as unknown as {
    from: (t: string) => {
      update: (vals: unknown) => {
        eq: (
          col: string,
          val: string,
        ) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  const { error } = await updatable
    .from('posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) throw new Error(error.message)

  revalidatePath('/calendrier')
  revalidatePath(`/calendrier/${postId}`)
  revalidatePath(`/post-creator/${postId}`)
}
