import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";

export default function AdminBookingsPage() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await bookingService.adminList({ limit: 100 })
        if (!active) return
        setBookings(data ?? [])
      } catch (err) {
        if (!active) return
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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-bold text-heading">Booking management</h1>
        <p className="mt-1 text-sm text-muted">All customer bookings (admin). Detailed filters arrive later.</p>
        {loading ? (
          <div className="mt-8 flex justify-center"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No bookings" description="Bookings will appear here." />
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {bookings.map((b) => (
              <Card key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-heading">{b.booking_reference}</p>
                  <p className="text-xs text-muted">User: {b.user_id} · Slot {b.slot_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                    {b.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
