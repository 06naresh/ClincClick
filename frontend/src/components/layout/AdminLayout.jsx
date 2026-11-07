import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/providers", label: "Providers" },
  { to: "/admin/availability", label: "Availability" },
  { to: "/admin/bookings", label: "Bookings" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-primary-light text-primary-dark" : "text-body hover:bg-surface-muted"}`

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1" aria-label="Admin navigation">
            {adminNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <button
            type="button"
            className="mb-2 flex items-center gap-2 rounded-lg border border-stroke px-3 py-2 text-sm text-body md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Admin menu
          </button>
          {open ? (
            <nav className="mb-4 space-y-1 md:hidden" aria-label="Admin navigation mobile">
              {adminNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
