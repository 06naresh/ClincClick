import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";
import { serviceService } from "../services/serviceService";

const serviceSchema = z.object({
  name: z.string().min(2, "Minimum 2 characters").max(150),
  description: z.string().optional().nullable(),
  duration_minutes: z.coerce.number().int().min(1, "Must be at least 1").max(1440),
  price: z.coerce.number().min(0, "Must be 0 or more"),
  is_active: z.boolean().default(true),
});

export default function AdminServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await serviceService.list({ search, include_inactive: includeInactive, limit: 200 })
      setServices(data ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load services")
    } finally {
      setLoading(false)
    }
  }, [search, includeInactive])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (s) => {
    setEditing(s)
    setModalOpen(true)
  }

  const handleStatus = async (s) => {
    try {
      await serviceService.setStatus(s.id, !s.is_active)
      toast.success(s.is_active ? "Service deactivated" : "Service activated")
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update status")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Service management</h1>
          <p className="text-sm text-muted">Create, edit and control service availability (admin).</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add service
        </Button>
      </header>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search services"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
            />
            Show inactive
          </label>
          <Button variant="outline" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-muted">
                    No services match the filter.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-heading">{s.name}</p>
                      <p className="text-xs text-muted">{s.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-body">{s.duration_minutes} min</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">${Number(s.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.is_active ? "active" : "inactive"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={s.is_active ? "danger" : "primary"}
                          onClick={() => handleStatus(s)}
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={() => {
          setModalOpen(false)
          load()
          toast.success(editing ? "Service updated" : "Service created")
        }}
      />
    </main>
  )
}

function ServiceFormModal({ open, onClose, editing, onSaved }) {
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: editing?.name || "",
      description: editing?.description || "",
      duration_minutes: editing?.duration_minutes || 30,
      price: editing?.price || 0,
      is_active: editing?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: editing?.name || "",
        description: editing?.description || "",
        duration_minutes: editing?.duration_minutes || 30,
        price: editing?.price || 0,
        is_active: editing?.is_active ?? true,
      })
    }
  }, [open, editing, form])

  const [saving, setSaving] = useState(false)

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        duration_minutes: values.duration_minutes,
        price: values.price,
        is_active: values.is_active,
      }
      if (editing) {
        await serviceService.update(editing.id, payload)
      } else {
        await serviceService.create(payload)
      }
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit service" : "Add service"}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Name" error={form.formState.errors.name?.message} {...form.register("name")} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-body">Description</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Optional details"
            {...form.register("description")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (min)"
            type="number"
            error={form.formState.errors.duration_minutes?.message}
            {...form.register("duration_minutes")}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            error={form.formState.errors.price?.message}
            {...form.register("price")}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-body">
          <input type="checkbox" className="h-4 w-4 rounded border-stroke text-primary" {...form.register("is_active")} />
          Active
        </label>
        <Button type="submit" loading={saving} fullWidth>
          {editing ? "Save changes" : "Create service"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
      </form>
    </Modal>
  )
}
