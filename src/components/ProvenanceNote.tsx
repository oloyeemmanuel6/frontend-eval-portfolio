export function ProvenanceNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="provenance" aria-label="Provenance">
      <p className="kicker">Provenance</p>
      {compact ? (
        <p>
          Self-initiated, AI-assisted demonstration. Not client work, and not an official micro1 page.
        </p>
      ) : (
        <p>
          This page is a self-initiated, AI-assisted demonstration by Dami. It is not client work and not
          an official micro1 product. The SVG mockups were written as SVG for this demonstration. They were
          not drawn by hand by Dami.
        </p>
      )}
    </aside>
  )
}
