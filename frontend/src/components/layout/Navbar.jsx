import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const navLinks = !user
    ? [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/login", label: "Sign in" },
        { to: "/register", label: "Sign up" },
      ]
    : isAdmin
      ? [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/services", label: "Services" },
          { to: "/admin/providers", label: "Providers" },
          { to: "/admin/availability", label: "Availability" },
          { to: "/admin/bookings", label: "Bookings" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/services", label: "Services" },
          { to: "/dashboard/bookings", label: "My bookings" },
          { to: "/dashboard/profile", label: "Profile" },
        ];

  const brandTarget = !user ? "/" : isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-[90%] max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={brandTarget} className="text-sm font-bold text-heading">
            ClincClick
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-md px-2 py-1 text-xs font-medium text-body hover:bg-surface-muted">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary-dark sm:inline">
                {user.role}
              </span>
              <span className="hidden text-sm text-body sm:inline">{user.full_name}</span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : null}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-surface-muted md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-stroke bg-surface md:hidden">
          <div className="mx-auto w-[90%] max-w-7xl py-2">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); onLogout?.(); }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-surface-muted"
                >
                  Logout
                </button>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
