import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { serviceService } from "../../services/services/serviceService";
import { providerService } from "../../providers/services/providerService";
import { availabilityService } from "../../availability/services/availabilityService";
import { bookingService } from "../services/bookingService";

export default function BookAppointmentPage() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const prefilledService = searchParams.get("service_id")

  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [serviceId, setServiceId] = useState(prefilledService || "")
  const [providerId, setProviderId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [reason, setReason] = useState("")
  const [loadingBase, setLoadingBase] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      serviceService.list({ limit: 200 }),
      providerService.list({ limit: 200 }),
    ]).then(([svcs, prs]) => {
      if (!active) return
      setServices(svcs ?? [])
      setProviders(prs ?? [])
    }).catch(() => {
      toast.error("Could not load services")
    }).finally(() => {
      if (active) setLoadingBase(false)
    })
    return () => { active = false }
  }, [])

  // Providers loaded as part of the base effect above (or via .then inside services Promise)

  // Load slots whenever service, provider, or date changes
  useEffect(() => {
    if (!serviceId || !providerId || !selectedDate) {
      setSlots([])
      return
    }
    let active = true
    ;(async () => {
      setLoadingSlots(true)
      try {
        const data = await availabilityService.list({
          service_id: Number(serviceId),
          provider_id: Number(providerId),
          start_from: selectedDate,
          start_until: selectedDate,
          limit: 200,
        })
        if (!active) return
        const future = (data ?? []).filter((s) => s.is_active && new Date(s.start_time) > new Date())
        setSlots(future)
      } catch (err) {
        if (!active) return
        toast.error(err?.response?.data?.message || "Could not load slots")
      } finally {
        if (active) setLoadingSlots(false)
      }
    })()
    return () => { active = false }
  }, [serviceId, providerId, selectedDate])

  const submit = async () => {
    if (!selectedSlotId) {
      toast.error("Select a time slot")
      return
    }
    setSubmitting(true)
    try {
      const booking = await bookingService.create({ slot_id: selectedSlotId, reason: reason || null })
      toast.success("Appointment booked!")
      setBooked(booking)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create booking")
    } finally {
      setSubmitting(false)
    }
  }

  const service = services.find((s) => String(s.id) === String(serviceId))
  const provider = providers.find((p) => String(p.id) === String(providerId))

  if (loadingBase) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} onLogout={logout} />
        <main className="mx-auto max-w-lg px-4 py-8">
          <Card>
            <h1 className="text-lg font-bold text-heading">Appointment confirmed</h1>
            <p className="mt-2 text-sm text-body">
              Your booking reference is <span className="font-semibold">{booked.booking_reference}</span>.
            </p>
            <p className="text-xs text-muted">Status: {booked.status}</p>
            <div className="mt-5 flex gap-2">
              <Button onClick={() => (window.location.href = "/dashboard/bookings")}>View my bookings</Button>
              <Button variant="outline" onClick={() => setBooked(null)}>Book another</Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold text-heading">Book an appointment</h1>
        <p className="mt-1 text-sm text-muted">Choose a service, provider and available time slot.</p>

        <Card className="mt-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-body">Service</label>
            <select
              className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
              value={serviceId}
              onChange={(e) => { setServiceId(e.target.value); setSelectedSlotId(null) }}
            >
              <option value="">Select a service</option>
              {services.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min, ${Number(s.price).toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-body">Provider</label>
            <select
              className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
              value={providerId}
              onChange={(e) => { setProviderId(e.target.value); setSelectedSlotId(null) }}
            >
              <option value="">Select a provider</option>
              {providers.filter((p) => p.is_active).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name} {p.specialization ? `· ${p.specialization}` : ""}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-body">Date</label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlotId(null) }}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-body">Available time slots</label>
            {!serviceId || !providerId || !selectedDate ? (
              <p className="text-xs text-muted">Select service, provider and date to see slots.</p>
            ) : loadingSlots ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : slots.length === 0 ? (
              <EmptyState title="No available slots" description="No capacity left on that day. Try another date." />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${selectedSlotId === s.id ? "border-primary bg-primary text-white" : "border-stroke bg-surface text-body hover:bg-surface-muted"}`}
                  >
                    {new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-body">Reason (optional)</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="rounded-lg bg-surface-muted p-3 text-xs text-muted">
            {service ? `${service.name} · ${service.duration_minutes} min · $${Number(service.price).toFixed(2)}` : "Choose a service"}
            {provider ? ` · provider: ${provider.full_name}` : ""}
            {selectedSlotId ? ` · slot selected` : ""}
          </div>

          <Button
            onClick={submit}
            loading={submitting}
            fullWidth
            disabled={!serviceId || !providerId || !selectedDate || !selectedSlotId}
          >
            Confirm booking
          </Button>
        </Card>
      </main>
    </div>
  )
}
