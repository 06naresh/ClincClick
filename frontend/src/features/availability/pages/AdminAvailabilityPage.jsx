import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";
import { availabilityService } from "../services/availabilityService";
import { serviceService } from "../../../features/services/services/serviceService";
import { providerService } from "../../../features/providers/services/providerService";

const schema = z.object({
  service_id: z.coerce.number().min(1, "Select a service"),
  provider_id: z.coerce.number().min(1, "Select a provider"),
  start_time: z.string().min(1, "Start time required"),
  end_time: z.string().min(1, "End time required"),
  capacity: z.coerce.number().int().min(1, "Capacity at least 1").max(100),
  is_active: z.boolean().default(true),
});

export default function AdminAvailabilityPage() {
  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterService, setFilterService] = useState("")
  const [filterProvider, setFilterProvider] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services])
  const providerMap = useMemo(() => new Map(providers.map((p) => [p.id, p.full_name])), [providers])

  const loadStatic = useCallback(async () => {
    const [svcs, provs] = await Promise.all([
      serviceService.list({ include_inactive: true, limit: 200 }),
      providerService.list({ include_inactive: true, limit: 200 }),
    ])
    setServices(svcs ?? [])
    setProviders(provs ?? [])
  }, [])

  const loadSlots = useCallback(async () => {
    setLoading(true)
    try {
      const data = await availabilityService.list({
        service_id: filterService || undefined,
        provider_id: filterProvider || undefined,
        include_inactive: true,
        limit: 300,
      })
      setSlots(data ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load slots")
    } finally {
      setLoading(false)
    }
  }, [filterService, filterProvider])

  useEffect(() => {
    loadStatic().catch((err) => toast.error(err?.message || "Load failed"))
  }, [loadStatic])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const handleStatus = async (slot) => {
    try {
      await availabilityService.setStatus(slot.id, !slot.is_active)
      toast.success(slot.is_active ? "Slot deactivated" : "Slot activated")
      loadSlots()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update status")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Availability management</h1>
          <p className="text-sm text-muted">Create appointment slots for services/providers.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add slot
        </Button>
      </header>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="h-10 min-w-40 rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="">All services</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            className="h-10 min-w-40 rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
          >
            <option value="">All providers</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={loadSlots}>Refresh</Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">End</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {slots.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-sm text-muted">No slots found.</td></tr>
              ) : (
                slots.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3 text-sm text-body">{new Date(s.start_time).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-body">{new Date(s.end_time).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{serviceMap.get(s.service_id) ?? s.service_id}</td>
                    <td className="px-4 py-3 text-sm">{providerMap.get(s.provider_id) ?? s.provider_id}</td>
                    <td className="px-4 py-3 text-sm text-body">{s.capacity}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.is_active ? "active" : "inactive"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant={s.is_active ? "danger" : "primary"} onClick={() => handleStatus(s)}>
                        {s.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      <AddSlotModal open={modalOpen} onClose={() => setModalOpen(false)} services={services} providers={providers}
        onSaved={() => { setModalOpen(false); loadSlots(); toast.success("Slot created"); }} />
    </main>
  )
}

function AddSlotModal({ open, onClose, services, providers, onSaved }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 5, is_active: true, service_id: "", provider_id: "" },
  })
  const [saving, setSaving] = useState(false)
  const onSubmit = async (values) => {
    setSaving(true)
    try {
      await availabilityService.create({
        service_id: Number(values.service_id),
        provider_id: Number(values.provider_id),
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        capacity: values.capacity,
        is_active: values.is_active,
      })
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create slot")
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal open={open} onClose={onClose} title="Add availability slot">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-body">Service</label>
          <select className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
            {...form.register("service_id")} defaultValue="">
            <option value="">Select service</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}{s.is_active ? "" : " (inactive)"}</option>)}
          </select>
          {form.formState.errors.service_id ? (
            <p className="text-xs text-danger">{form.formState.errors.service_id.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-body">Provider</label>
          <select className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 text-sm text-heading"
            {...form.register("provider_id")} defaultValue="">
            <option value="">Select provider</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.full_name}{p.is_active ? "" : " (inactive)"}</option>)}
          </select>
          {form.formState.errors.provider_id ? (
            <p className="text-xs text-danger">{form.formState.errors.provider_id.message}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start" type="datetime-local" error={form.formState.errors.start_time?.message} {...form.register("start_time")} />
          <Input label="End" type="datetime-local" error={form.formState.errors.end_time?.message} {...form.register("end_time")} />
        </div>
        <Input label="Capacity" type="number" error={form.formState.errors.capacity?.message} {...form.register("capacity")} />
        <label className="inline-flex items-center gap-2 text-sm text-body">
          <input type="checkbox" className="h-4 w-4 rounded border-stroke text-primary" {...form.register("is_active")} />
          Active
        </label>
        <Button type="submit" loading={saving} fullWidth>Create slot</Button>
        <Button type="button" variant="ghost" onClick={onClose} fullWidth>Cancel</Button>
      </form>
    </Modal>
  )
}
