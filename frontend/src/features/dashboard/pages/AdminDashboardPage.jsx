// Phase-03 verification placeholder — full admin dashboard in Phase 08.

import Navbar from "../../../components/layout/Navbar"
import { useAuth } from "../../../context/AuthContext"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-4xl p-6">
        <h2 className="text-xl font-semibold text-heading">Administrator dashboard</h2>
        <p className="mt-2 text-sm text-body">
          Signed in as <span className="font-semibold">{user?.email}</span> (role: {user?.role}).
        </p>
        <div className="mt-6 rounded-xl border border-stroke bg-surface p-6 shadow-sm">
          <p className="text-sm text-muted">
            Phase 03 verification placeholder. Service, provider and booking management arrive in Phase 08.
          </p>
        </div>
      </main>
    </div>
  )
}
