export default function Select({ label, id, error, className = "", children, ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-body">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-danger" : "border-stroke"} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
