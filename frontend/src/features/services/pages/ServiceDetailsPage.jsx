import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Spinner from "../../../components/ui/Spinner";
import Button from "../../../components/ui/Button";
import { serviceService } from "../services/serviceService";
import { availabilityService } from "../../../features/availability/services/availabilityService";

export default function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const s = await serviceService.get(serviceId)
        const sls = await availabilityService.list({ service_id: Number(serviceId), limit: 200 })
        if (!active) return
        setService(s)
        setSlots(sls ?? [])
      } catch (err) {
        if (!active) return
        toast.error(err?.response?.data?.message || "Could not load service")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [serviceId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!service) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <p className="text-sm text-muted">Service not found.</p>
        </Card>
        <Link to="/services" className="mt-3 inline-block text-sm text-primary hover:text-primary-dark">
          Back to services
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/services" className="text-sm text-primary hover:text-primary-dark">
        ← Back to services
      </Link>
      <Card className="mt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-heading">{service.name}</h1>
            <p className="mt-1 text-sm text-body">{service.description || "No description."}</p>
          </div>
          <Badge variant={service.is_active ? "active" : "inactive"}>
            {service.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-muted">
          <span>Duration: {service.duration_minutes} min</span>
          <span>Price: ${Number(service.price).toFixed(2)}</span>
        </div>
        <div className="mt-5">
          <Button onClick={() => navigate(`/book?service_id=${service.id}`)} fullWidth>
            Book appointment
          </Button>
        </div>
      </Card>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-heading">Available slots</h2>
        {slots.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No availability scheduled for this service.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {slots.map((s) => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-heading">
                    {new Date(s.start_time).toLocaleString()} → {new Date(s.end_time).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted">Capacity: {s.capacity}</p>
                </div>
                <Badge variant={s.is_active ? "active" : "inactive"}>
                  {s.is_active ? "Open" : "Closed"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
