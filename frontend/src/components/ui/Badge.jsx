export function Badge({ variant = "neutral", children }) {
  const styles = {
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
    info: "bg-info-light text-info",
    neutral: "bg-surface-muted text-muted",
    active: "bg-success-light text-success",
    inactive: "bg-surface-muted text-muted",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant] ?? styles.neutral}`}
    >
      {children}
    </span>
  )
}

export default Badge