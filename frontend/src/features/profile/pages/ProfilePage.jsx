import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { profileService } from "../services/profileService";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || "", phone: user?.phone || "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ full_name: user?.full_name || "", phone: user?.phone || "" })
  }, [user])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await profileService.update({ full_name: form.full_name, phone: form.phone || null })
      if (updated) setUser(updated)
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-xl font-bold text-heading">Profile</h1>
        <Card className="mt-4">
          <p className="text-xs text-muted">Email: {user?.email}</p>
          <p className="text-xs text-muted">Role: {user?.role}</p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Input label="Full name" value={form.full_name} onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} />
            <Button type="submit" loading={saving} fullWidth>Save changes</Button>
          </form>
          <p className="mt-4 text-xs text-muted">
            Back to{" "}
            <Link to="/dashboard" className="text-primary hover:text-primary-dark">
              dashboard
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
