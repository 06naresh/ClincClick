// ClincClick — Phase 01 placeholder shell.
// Routing, layouts, and feature pages are built progressively (Phases 06-08)
// following md_files/phases.md. Do not add feature UI before its phase.

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-stroke bg-surface p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-heading">ClincClick</h1>
        <p className="mt-2 text-sm text-body">
          Service Booking Application &mdash; development environment
        </p>
        <div className="mt-6 rounded-lg bg-primary-light px-4 py-3">
          <p className="text-sm font-semibold text-primary-dark">
            Phase 01 &mdash; Environment Setup is running
          </p>
        </div>
        <p className="mt-4 text-xs text-muted">
          Frontend (Vite + React + Tailwind) is verified. Next steps per
          md_files/phases.md.
        </p>
      </div>
    </div>
  )
}

export default App
