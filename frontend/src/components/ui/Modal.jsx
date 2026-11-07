export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-stroke bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <h3 id="modal-title" className="text-lg font-semibold text-heading">
            {title}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer ? <div className="border-t border-stroke px-6 py-3">{footer}</div> : null}
      </div>
    </div>
  )
}
