import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";

export default function BookingDetailsPage() {
  const { bookingId } = useParams()
  const { user, logout } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await bookingService.get(bookingId)
        if (!active) return
        setBooking(data)
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || "Could not load booking")
        toast.error(err?.response?.data?.message || "Could not load booking")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [bookingId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/dashboard/bookings" className="text-sm text-primary hover:text-primary-dark">
          ← Back to my bookings
        </Link>
        {loading ? (
          <div className="mt-8 flex justify-center"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="mt-4 text-sm text-danger">{error}</p>
        ) : (
          <Card className="mt-4">
            <p className="text-lg font-semibold text-heading">{booking?.booking_reference}</p>
            <p className="text-sm text-body mt-2">Status: {booking?.status}</p>
            <p className="text-sm text-muted">Slot: {booking?.slot_id}</p>
            <p className="text-sm text-muted">Created: {booking?.created_at}</p>
          </Card>
        )}
      </main>
    </div>
  )
}
