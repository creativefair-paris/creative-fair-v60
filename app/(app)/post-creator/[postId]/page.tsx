import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import type { PostDraft, PostType } from '@/types/post-draft'
import { PostCreatorLayout } from '@/components/post-creator/PostCreatorLayout'

type PostRow = {
  id: string
  tenant_id: string
  brand_id: string
  type: PostType | null
  content: PostDraft | null
}

type Params = { postId: string }

export default async function PostCreatorPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { postId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPost } = await supabase
    .from('posts')
    .select('id, tenant_id, brand_id, type, content')
    .eq('id', postId)
    .maybeSingle()

  const post = rawPost as PostRow | null
  if (!post) notFound()

  const brand = await getBrandByTenantId(supabase, post.tenant_id)

  return (
    <PostCreatorLayout
      postId={post.id}
      initialType={post.type}
      initialDraft={post.content ?? {}}
      brandName={brand?.name ?? undefined}
    />
  )
}
