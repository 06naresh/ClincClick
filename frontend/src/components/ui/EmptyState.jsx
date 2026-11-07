export default function EmptyState({ title, description, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke bg-surface px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
