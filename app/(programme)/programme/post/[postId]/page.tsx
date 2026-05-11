// Sprint 36.B — Placeholder route détail post.
// Sprint 36.C ouvrira cette page en Split Brief (cards cliquables timeline).
// Volontairement minimal : aucune surface UI exposée tant que le pattern n'est pas fini.

type PageProps = { params: Promise<{ postId: string }> }

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params
  return (
    <section className="px-6 py-12">
      <h1 className="text-3xl font-semibold">Détail du post</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Post : {postId}</p>
    </section>
  )
}
