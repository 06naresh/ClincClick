import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-stroke bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-bold text-heading">
            ClincClick
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-body hover:text-primary" to="/services">
              Services
            </Link>
            <Link className="text-body hover:text-primary" to="/login">
              Sign in
            </Link>
            <Link className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary-dark" to="/register">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
