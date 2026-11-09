import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import { serviceService } from "../services/serviceService";

export default function ServicesPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")

  const load = async (q = "") => {
    setLoading(true)
    try {
      const data = await serviceService.list({ search: q, limit: 100 })
      setServices(data ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    setQuery(search)
    load(search)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Our services</h1>
          <p className="text-sm text-muted">Browse clinic services and view availability.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Input
              label={null}
              placeholder="Search services"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      </header>

      {services.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No services available right now. Check back later.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-heading">{service.name}</h3>
                <Badge variant={service.is_active ? "active" : "inactive"}>
                  {service.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted">{service.description || "No description."}</p>
              <div className="mt-auto flex flex-wrap gap-3 border-t border-stroke pt-3 text-xs text-body">
                <span>{service.duration_minutes} min</span>
                <span className="font-semibold text-primary">${Number(service.price).toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/services/${service.id}`)} fullWidth>
                  Details
                </Button>
                <Button size="sm" onClick={() => navigate(`/book?service_id=${service.id}`)} fullWidth>
                  Book now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
