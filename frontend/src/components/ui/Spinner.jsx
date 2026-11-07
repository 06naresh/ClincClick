export default function Spinner({ size = "md", className = "" }) {
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"
  return (
    <span
      className={`${dim} inline-block animate-spin rounded-full border-2 border-stroke border-t-primary ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
