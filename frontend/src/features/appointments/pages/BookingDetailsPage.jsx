import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";
import RescheduleModal from "../components/RescheduleModal";

export default function BookingDetailsPage() {
  const { bookingId } = useParams()
  const { user, logout } = useAuth()
  const [booking, setBooking] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelTarget, setCancelTarget] = useState(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [acting, setActing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const b = await bookingService.get(bookingId)
      const h = await bookingService.history(bookingId)
      setBooking(b)
      setHistory(h ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load booking")
      toast.error(err?.response?.data?.message || "Could not load booking")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [bookingId])

  const handleCancel = async () => {
    if (!booking) return
    setActing(true)
    try {
      await bookingService.cancel(booking.id, { reason: "customer cancel" })
      toast.success("Booking cancelled")
      setCancelTarget(null)
      await load()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not cancel booking")
    } finally {
      setActing(false)
    }
  }

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
          <>
            <Card className="mt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-heading">{booking?.booking_reference}</h1>
                  <p className="text-sm text-body mt-1">Status: {booking?.status}</p>
                </div>
                <Badge variant={booking?.status === "cancelled" ? "danger" : booking?.status === "completed" ? "success" : booking?.status === "confirmed" ? "info" : "warning"}>
                  {booking?.status}
                </Badge>
              </div>
              <div className="mt-4 space-y-1 text-sm text-body">
                <p>Slot: {booking?.slot_id}</p>
                {booking?.slot_start_time ? <p>Appointment: {new Date(booking.slot_start_time).toLocaleString()} {booking.slot_end_time ? `→ ${new Date(booking.slot_end_time).toLocaleTimeString()}` : ""}</p> : null}
                <p>Reason: {booking?.reason || "—"}</p>
                <p>Created: {booking?.created_at ? new Date(booking.created_at).toLocaleString() : "—"}</p>
              </div>
              {(booking?.status === "pending" || booking?.status === "confirmed") ? (
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" onClick={() => setRescheduleOpen(true)}>Reschedule</Button>
                  <Button variant="danger" onClick={() => setCancelTarget(booking)}>Cancel</Button>
                </div>
              ) : null}
            </Card>

            <section className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-heading">Booking history</h2>
              {history.length === 0 ? (
                <EmptyState title="No history" description="Events will appear here as your booking changes." />
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <Card key={h.id}>
                      <p className="text-sm font-semibold text-heading">{h.event_type}</p>
                      <p className="text-xs text-muted">
                        {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
                        {h.old_slot_id && h.new_slot_id && h.old_slot_id !== h.new_slot_id ? ` · slot ${h.old_slot_id} → ${h.new_slot_id}` : ""}
                      </p>
                      {h.change_reason ? <p className="text-xs text-muted">Reason: {h.change_reason}</p> : null}
                      <p className="text-xs text-muted">{new Date(h.changed_at).toLocaleString()}</p>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <RescheduleModal
        open={rescheduleOpen}
        booking={booking}
        onClose={() => setRescheduleOpen(false)}
        onRescheduled={() => { setRescheduleOpen(false); load(); }}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel this booking?"
        message={`Cancel ${cancelTarget?.booking_reference}? This releases slot capacity.`}
        confirmLabel="Cancel booking"
        loading={acting}
      />
    </div>
  )
}
