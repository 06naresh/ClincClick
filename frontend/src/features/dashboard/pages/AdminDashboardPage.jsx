import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Spinner from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService } from "../services/dashboardService";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    ; (async () => {
      try {
        const data = await dashboardService.adminStats()
        if (!active) return
        setStats(data)
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || "Could not load admin stats")
        toast.error(err?.response?.data?.message || "Could not load admin stats")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const totals = stats?.totals ?? {}
  const byStatus = stats?.bookings_by_status ?? {}
  const recent = stats?.recent_bookings ?? []

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-heading">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Signed in as <span className="font-semibold">{user?.email}</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/services" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Services</Link>
          <Link to="/admin/providers" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Providers</Link>
          <Link to="/admin/availability" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Availability</Link>
          <Link to="/admin/bookings" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Bookings</Link>
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="mt-4 text-sm text-danger">{error}</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat title="Total users" value={totals.users ?? 0} />
              <Stat title="Active services" value={totals.services_active ?? 0} />
              <Stat title="Active providers" value={totals.providers_active ?? 0} />
              <Stat title="Total bookings" value={totals.bookings ?? 0} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat title="Pending" value={byStatus.pending ?? 0} />
              <Stat title="Confirmed" value={byStatus.confirmed ?? 0} />
              <Stat title="Completed" value={byStatus.completed ?? 0} />
              <Stat title="Cancelled" value={byStatus.cancelled ?? 0} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Stat title="Upcoming appointments" value={stats?.upcoming_bookings ?? 0} />
              <Stat title="Today's bookings" value={stats?.today_bookings ?? 0} />
            </div>

            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-heading">Recent appointments</h2>
              {recent.length === 0 ? (
                <EmptyState title="No appointments yet" description="Recent bookings will show here." />
              ) : (
                <Card className="overflow-x-auto p-0">
                  <table className="min-w-full divide-y divide-stroke">
                    <thead className="bg-surface-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Slot</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke">
                      {recent.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-muted/60">
                          <td className="px-4 py-3 text-sm font-semibold text-heading">{b.booking_reference}</td>
                          <td className="px-4 py-3 text-sm text-body">{b.user_id}</td>
                          <td className="px-4 py-3 text-sm text-body">{b.slot_id}</td>
                          <td className="px-4 py-3">
                            <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                              {b.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted">{new Date(b.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-muted">{title}</p>
      <p className="mt-2 text-2xl font-bold text-heading">{value}</p>
    </Card>
  )
}
