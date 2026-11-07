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
import { providerService } from "../services/providerService";

const schema = z.object({
  full_name: z.string().min(2, "Minimum 2 characters").max(150),
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await providerService.list({ search, include_inactive: includeInactive, limit: 200 })
      setProviders(data ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load providers")
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

  const handleStatus = async (p) => {
    try {
      await providerService.setStatus(p.id, !p.is_active)
      toast.success(p.is_active ? "Provider deactivated" : "Provider activated")
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update status")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Provider management</h1>
          <p className="text-sm text-muted">Add doctors and service providers.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add provider
        </Button>
      </header>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Input placeholder="Search providers" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary" />
            Show inactive
          </label>
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Specialization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {providers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-sm text-muted">No providers found.</td></tr>
              ) : (
                providers.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-heading">{p.full_name}</p>
                      <p className="text-xs text-muted">{p.bio || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-body">{p.specialization || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_active ? "active" : "inactive"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                        </Button>
                        <Button size="sm" variant={p.is_active ? "danger" : "primary"} onClick={() => handleStatus(p)}>
                          {p.is_active ? "Deactivate" : "Activate"}
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

      <ProviderFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing}
        onSaved={() => { setModalOpen(false); load(); toast.success(editing ? "Provider updated" : "Provider created"); }} />
    </main>
  )
}

function ProviderFormModal({ open, onClose, editing, onSaved }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: editing?.full_name || "",
      specialization: editing?.specialization || "",
      bio: editing?.bio || "",
      is_active: editing?.is_active ?? true,
    },
  })
  const [saving, setSaving] = useState(false)
  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const payload = {
        full_name: values.full_name,
        specialization: values.specialization || null,
        bio: values.bio || null,
        is_active: values.is_active,
      }
      if (editing) await providerService.update(editing.id, payload)
      else await providerService.create(payload)
      onSaved()
    } catch (err) { toast.error(err?.response?.data?.message || "Save failed") }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit provider" : "Add provider"}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" error={form.formState.errors.full_name?.message} {...form.register("full_name")} />
        <Input label="Specialization" {...form.register("specialization")} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-body">Bio</label>
          <textarea rows={3} className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional bio" {...form.register("bio")} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-body">
          <input type="checkbox" className="h-4 w-4 rounded border-stroke text-primary" {...form.register("is_active")} />
          Active
        </label>
        <Button type="submit" loading={saving} fullWidth>{editing ? "Save changes" : "Create provider"}</Button>
        <Button type="button" variant="ghost" onClick={onClose} fullWidth>Cancel</Button>
      </form>
    </Modal>
  )
}
