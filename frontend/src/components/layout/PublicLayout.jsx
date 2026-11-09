import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-[90%] max-w-7xl items-center justify-between">
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
      <main className="mx-auto w-[90%] max-w-7xl px-4 py-6 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
