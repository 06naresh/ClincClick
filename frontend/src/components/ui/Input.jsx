// Controlled input with label, optional placeholder, and error feedback.
// Always pairs label with control via htmlFor/id for accessibility.

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, id, error, className = "", ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-body">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-danger focus:ring-danger/30" : "border-stroke"} ${className}`}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
})

export default Input