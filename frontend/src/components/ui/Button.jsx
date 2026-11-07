// Generic UI Button component shared across features.
// Variants: primary, secondary, outline, ghost, danger. Add loading state
// to prevent duplicate submissions while a request is in flight.

import { Loader2 } from "lucide-react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  outline: "border border-stroke bg-surface text-body hover:bg-surface-muted",
  ghost: "text-body hover:bg-surface-muted",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
