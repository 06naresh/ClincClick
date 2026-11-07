import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Navbar from "../../../components/layout/Navbar";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { bookingService } from "../services/bookingService";
import { serviceService } from "../../services/services/serviceService";
import { providerService } from "../../providers/services/providerService";

export default function AdminBookingsPage() {
  const { user, logout } = useAuth()
  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [providerFilter, setProviderFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [cancelTarget, setCancelTarget] = useState(null)
  const [acting, setActing] = useState(false)

  const serviceMap = new Map(services.map((x) => [x.id, x.name]))
  const providerMap = new Map(providers.map((x) => [x.id, x.full_name]))

  const loadMeta = useCallback(async () => {
    const [svcs, prs] = await Promise.all([
      serviceService.list({ include_inactive: true, limit: 200 }),
      providerService.list({ include_inactive: true, limit: 200 }),
    ])
    setServices(svcs ?? [])
    setProviders(prs ?? [])
  }, [])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 200 }
      if (statusFilter) params.status = statusFilter
      if (serviceFilter) params.service_id = Number(serviceFilter)
      if (providerFilter) params.provider_id = Number(providerFilter)
      if (dateFrom) params.start_from = dateFrom
      if (dateTo) params.start_until = dateTo
      const data = await bookingService.adminList(params)
      setBookings(data ?? [])
    } catch (err) {
      (window.toast || toast).error(err?.response?.data?.message || "Could not load bookings")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, serviceFilter, providerFilter, dateFrom, dateTo])

  useEffect(() => {
    loadMeta().catch(() => {})
  }, [loadMeta])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const setStatus = async (booking, newStatus, reason = undefined) => {
    setActing(true)
    try {
      await bookingService.adminUpdateStatus(booking.id, newStatus, reason ? { reason } : undefined)
      ; (window.toast || toast).success(`Booking ${newStatus}`)
      await loadBookings()
    } catch (err) {
      (window.toast || toast).error(err?.response?.data?.message || "Could not update status")
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-bold text-heading">Booking management</h1>
        <p className="text-sm text-muted">Filter, inspect and manage customer bookings.</p>

        <Card className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select label="Service" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="">All services</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Provider" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
              <option value="">All providers</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </Select>
            <Input label="From (YYYY-MM-DD)" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input label="To (YYYY-MM-DD)" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={loadBookings}>Refresh</Button>
          </div>
        </Card>

        {loading ? (
          <div className="mt-8 flex justify-center"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No bookings match" description="Try adjusting your filters." />
          </div>
        ) : (
          <Card className="mt-4 overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-stroke">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Appointment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3 text-sm font-semibold text-heading">{b.booking_reference}</td>
                    <td className="px-4 py-3 text-sm text-body">#{b.user_id}</td>
                    <td className="px-4 py-3 text-sm text-body">{serviceMap.get(b.service_id) ?? b.service_id ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-body">{providerMap.get(b.provider_id) ?? b.provider_id ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-body">
                      {b.slot_start_time ? new Date(b.slot_start_time).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={b.status === "cancelled" ? "danger" : b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : "warning"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {b.status === "pending" ? (
                          <Button size="sm" onClick={() => setStatus(b, "confirmed")}>Confirm</Button>
                        ) : null}
                        {b.status === "confirmed" ? (
                          <Button size="sm" variant="outline" onClick={() => setStatus(b, "completed")}>Complete</Button>
                        ) : null}
                        {b.status !== "cancelled" && b.status !== "completed" ? (
                          <Button size="sm" variant="danger" onClick={() => setCancelTarget(b)}>Cancel</Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <ConfirmDialog
          open={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={async () => {
            if (!cancelTarget) return
            await setStatus(cancelTarget, "cancelled", "admin cancel")
          }}
          title="Cancel this booking?"
          message={`Cancel ${cancelTarget?.booking_reference}? This will release slot capacity.`}
          confirmLabel="Cancel booking"
          loading={acting}
        />
      </main>
    </div>
  )
}
