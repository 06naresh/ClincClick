import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Spinner from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService } from "../services/dashboardService";

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await dashboardService.customerStats()
        if (!active) return
        setStats(data)
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || "Could not load dashboard")
        toast.error(err?.response?.data?.message || "Could not load dashboard")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const totals = stats?.totals ?? {}
  const next = stats?.next_booking

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-heading">Welcome back, {user?.full_name}</h1>
            <p className="mt-1 text-sm text-muted">Manage your clinic appointments.</p>
          </div>
          <Link to="/book" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Book appointment
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total" value={totals.total ?? 0} />
          <Stat title="Upcoming" value={totals.upcoming ?? 0} />
          <Stat title="Completed" value={totals.completed ?? 0} />
          <Stat title="Cancelled" value={totals.cancelled ?? 0} />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-heading">Next appointment</h2>
          {!next ? (
            <EmptyState title="No upcoming appointments" description="Book your first appointment to get started." action={
              <Link to="/book" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Book now</Link>
            } />
          ) : (
            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-heading">{next.booking_reference}</p>
                  <p className="text-xs text-muted">Slot: {next.slot_id}</p>
                  <p className="text-xs text-muted">Status: {next.status}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={next.status === "confirmed" ? "info" : next.status === "completed" ? "success" : "warning"}>
                    {next.status}
                  </Badge>
                  <Link to={`/dashboard/bookings/${next.id}`} className="text-sm font-semibold text-primary hover:text-primary-dark">
                    Details
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-heading">Recent bookings</h2>
          {(stats?.recent_bookings ?? []).length === 0 ? (
            <EmptyState title="No bookings yet" description="Your recent appointments will appear here." />
          ) : (
            <div className="space-y-2">
              {(stats?.recent_bookings ?? []).map((b) => (
                <Card key={b.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-heading">{b.booking_reference}</p>
                    <p className="text-xs text-muted">{new Date(b.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                    {b.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </section>
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
