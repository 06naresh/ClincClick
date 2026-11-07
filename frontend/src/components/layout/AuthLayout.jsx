// Layout wrapping authentication pages (login/register).

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          ClincClick
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="w-full max-w-md rounded-2xl border border-stroke bg-surface p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}
