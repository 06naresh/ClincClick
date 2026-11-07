import { Link } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-4xl p-6">
        <h2 className="text-xl font-semibold text-heading">Administrator dashboard</h2>
        <p className="mt-2 text-sm text-body">
          Signed in as <span className="font-semibold">{user?.email}</span> (role: {user?.role}).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/services" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Services</Link>
          <Link to="/admin/providers" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Providers</Link>
          <Link to="/admin/availability" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Availability</Link>
        </div>
        <div className="mt-6 rounded-xl border border-stroke bg-surface p-6 shadow-sm">
          <p className="text-sm text-muted">
            Phase 04 management pages are live. Deeper admin workflows arrive in Phase 08.
          </p>
        </div>
      </main>
    </div>
  );
}
