import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import { availabilityService } from "../../../features/availability/services/availabilityService";
import { bookingService } from "../../../features/appointments/services/bookingService";

export default function RescheduleModal({ open, booking, onClose, onRescheduled }) {
  const [slot, setSlot] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!open || !booking) return
    let active = true
    ;(async () => {
      setLoading(true)
      setSelectedSlotId(null)
      try {
        const currentSlot = await availabilityService.get(booking.slot_id)
        const list = await availabilityService.list({
          service_id: currentSlot.service_id,
          provider_id: currentSlot.provider_id,
          limit: 300,
        })
        if (!active) return
        const future = (list ?? []).filter(
          (s) => s.id !== booking.slot_id && s.is_active && new Date(s.start_time) > new Date()
        )
        setSlot(currentSlot)
        setSlots(future)
      } catch (err) {
        if (!active) return
        toast.error(err?.response?.data?.message || "Could not load available slots")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [open, booking])

  const submit = async () => {
    if (!selectedSlotId) {
      toast.error("Select a new time slot")
      return
    }
    setSaving(true)
    try {
      await bookingService.reschedule(booking.id, { new_slot_id: selectedSlotId, reason: reason || null })
      toast.success("Booking rescheduled")
      onRescheduled?.()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reschedule")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reschedule appointment">
      {loading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Current slot: {slot ? `${new Date(slot.start_time).toLocaleString()} → ${new Date(slot.end_time).toLocaleString()}` : "Loading..."}
          </p>
          {slots.length === 0 ? (
            <EmptyState title="No alternative slots" description="No upcoming availability for this provider." />
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSlotId(s.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedSlotId === s.id ? "border-primary bg-primary-light" : "border-stroke hover:bg-surface-muted"}`}
                >
                  <span className="font-semibold text-heading">{new Date(s.start_time).toLocaleString()}</span>
                  <span className="ml-2 text-xs text-muted">→ {new Date(s.end_time).toLocaleTimeString()}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button onClick={submit} loading={saving} fullWidth disabled={!selectedSlotId || slots.length === 0}>
            Confirm reschedule
          </Button>
        </div>
      )}
    </Modal>
  )
}
