import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";
import RescheduleModal from "../components/RescheduleModal";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyBookingsPage() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")
  const [cancelTarget, setCancelTarget] = useState(null)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = { limit: 100 }
      if (filter !== "all" && filter !== "upcoming") params.status = filter
      const data = await bookingService.myBookings(params)
      let list = data ?? []
      if (filter === "upcoming") {
        const now = new Date()
        list = list.filter((b) => (b.status === "pending" || b.status === "confirmed") && b.slot_start_time && new Date(b.slot_start_time) >= now)
      }
      setBookings(list)
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load bookings")
      toast.error(err?.response?.data?.message || "Could not load bookings")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setActing(true)
    try {
      await bookingService.cancel(cancelTarget.id, { reason: "customer cancel" })
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
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-bold text-heading">My bookings</h1>
        <p className="mt-1 text-sm text-muted">View, reschedule and cancel your appointments.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f.key ? "bg-primary text-white" : "bg-surface-muted text-body hover:bg-stroke"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No bookings found" description="Try changing the filter or book a new appointment." action={
              <Link to="/dashboard/book" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Book appointment</Link>
            } />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-heading">{b.booking_reference}</p>
                    <p className="text-xs text-muted">
                      {b.slot_start_time ? new Date(b.slot_start_time).toLocaleString() : `Slot #${b.slot_id}`}
                      {b.slot_end_time ? ` → ${new Date(b.slot_end_time).toLocaleTimeString()}` : ""}
                    </p>
                    <p className="text-xs text-muted">Reason: {b.reason || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                      {b.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Link to={`/dashboard/bookings/${b.id}`} className="text-xs font-semibold text-primary hover:text-primary-dark">Details</Link>
                      {(b.status === "pending" || b.status === "confirmed") ? (
                        <>
                          <button type="button" onClick={() => setRescheduleTarget(b)} className="text-xs font-semibold text-primary hover:text-primary-dark">
                            Reschedule
                          </button>
                          <button type="button" onClick={() => setCancelTarget(b)} className="text-xs font-semibold text-danger hover:text-danger/80">
                            Cancel
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <RescheduleModal
          open={!!rescheduleTarget}
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={() => { setRescheduleTarget(null); load(); }}
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
      </main>
    </div>
  )
}
