type PageProps = { params: Promise<{ postId: string }> }

export default async function PostWorkflowPage({ params }: PageProps) {
  const { postId } = await params
  return (
    <section className="px-6 py-12">
      <h1 className="text-3xl font-semibold">Workflow Publier</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Post : {postId}</p>
      <p className="mt-4 text-[var(--color-text-muted)]">
        Page en construction — Sprint 35.
      </p>
    </section>
  )
}
