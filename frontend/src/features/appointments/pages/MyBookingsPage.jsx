import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";

export default function MyBookingsPage() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await bookingService.myBookings({ limit: 50 })
        if (!active) return
        setBookings(data ?? [])
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || "Could not load bookings")
        toast.error(err?.response?.data?.message || "Could not load bookings")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-bold text-heading">My bookings</h1>
        <p className="mt-1 text-sm text-muted">View, reschedule and cancel your appointments.</p>
        {loading ? (
          <div className="mt-8 flex justify-center"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No bookings yet" description="Your appointments will appear here." />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-heading">{b.booking_reference}</p>
                    <p className="text-xs text-muted">Slot: {b.slot_id} · {new Date(b.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                      {b.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Booking details come in Phase 07")}>Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-6">
          <Link to="/dashboard" className="text-sm text-primary hover:text-primary-dark">Back to dashboard</Link>
        </div>
      </main>
    </div>
  )
}
