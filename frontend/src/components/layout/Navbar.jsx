import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Navbar({ user, onLogout }) {
  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-[90%] max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="text-sm font-bold text-heading">
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
          <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary-dark">
            {user?.role}
          </span>
          <span className="text-sm text-body">{user?.full_name}</span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
