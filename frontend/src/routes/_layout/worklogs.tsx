import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

export const Route = createFileRoute("/_layout/worklogs")({
  component: Worklogs,
  head: () => ({
    meta: [{ title: "Worklogs - Payment Dashboard" }],
  }),
})

function Worklogs() {
  const navigate = useNavigate()
  const [allData, setAllData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const [selected, setSelected] = useState<string[]>([])

  const fetchWorklogs = async () => {
    try {
      setLoading(true)
      let url = "/api/v1/financial/worklogs/"
      const params: string[] = []
      if (activeFilter === "date" && startDate) {
        params.push(`start_date=${startDate}`)
      }
      if (activeFilter === "date" && endDate) {
        params.push(`end_date=${endDate}`)
      }
      if (params.length > 0) {
        url += "?" + params.join("&")
      }
      const resp = await api.get(url)
      setAllData(resp.data.data)
      setError("")
    } catch (err) {
      setError("Failed to load worklogs. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorklogs()
  }, [startDate, endDate, activeFilter])

  let filtered = allData
  if (activeFilter === "status" && statusFilter) {
    filtered = allData.filter((wl: any) => wl.status === statusFilter)
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectAllPending = () => {
    const pendingIds = displayed
      .filter((wl: any) => wl.status === "pending")
      .map((wl: any) => wl.id)
    setSelected((prev) => {
      const newSet = new Set(prev)
      pendingIds.forEach((id: string) => newSet.add(id))
      return Array.from(newSet)
    })
  }

  const handleCreatePayment = () => {
    if (selected.length === 0) return
    const params = new URLSearchParams()
    selected.forEach((id) => params.append("wl", id))
    navigate({ to: "/payments/new", search: { wl: selected } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading worklogs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Worklogs</h1>
          <p className="text-muted-foreground">
            View and manage freelancer worklogs
          </p>
        </div>
        {selected.length > 0 && (
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={handleCreatePayment}
            aria-label="Create payment from selected worklogs"
          >
            Create Payment ({selected.length})
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium border ${activeFilter === "date" ? "bg-primary text-primary-foreground" : "bg-background"}`}
          onClick={() =>
            setActiveFilter(activeFilter === "date" ? null : "date")
          }
        >
          Date Range
        </button>
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium border ${activeFilter === "status" ? "bg-primary text-primary-foreground" : "bg-background"}`}
          onClick={() =>
            setActiveFilter(activeFilter === "status" ? null : "status")
          }
        >
          Status
        </button>
      </div>

      {activeFilter === "date" && (
        <div className="flex gap-4 items-center">
          <label className="text-sm">
            Start:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              className="ml-2 rounded-md border px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            End:
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              className="ml-2 rounded-md border px-2 py-1 text-sm"
            />
          </label>
        </div>
      )}

      {activeFilter === "status" && (
        <div className="flex gap-2">
          <button
            className={`rounded-md px-3 py-1 text-sm border ${statusFilter === "pending" ? "bg-primary text-primary-foreground" : "bg-background"}`}
            onClick={() => {
              setStatusFilter(statusFilter === "pending" ? "" : "pending")
              setPage(1)
            }}
          >
            Pending
          </button>
          <button
            className={`rounded-md px-3 py-1 text-sm border ${statusFilter === "paid" ? "bg-primary text-primary-foreground" : "bg-background"}`}
            onClick={() => {
              setStatusFilter(statusFilter === "paid" ? "" : "paid")
              setPage(1)
            }}
          >
            Paid
          </button>
        </div>
      )}

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left">
                <button
                  onClick={selectAllPending}
                  className="text-xs underline"
                  aria-label="Select all pending worklogs"
                >
                  Select All
                </button>
              </th>
              <th className="p-3 text-left">Task</th>
              <th className="p-3 text-left">Freelancer</th>
              <th className="p-3 text-left">Rate</th>
              <th className="p-3 text-left">Hours</th>
              <th className="p-3 text-left">Earned</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((wl: any) => (
              <tr
                key={wl.id}
                className="border-b hover:bg-muted/30 cursor-pointer"
                onClick={() =>
                  navigate({ to: "/worklogs/$id", params: { id: wl.id } })
                }
              >
                <td
                  className="p-3"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {wl.status === "pending" && (
                    <input
                      type="checkbox"
                      checked={selected.includes(wl.id)}
                      onChange={() => toggleSelect(wl.id)}
                      aria-label={`Select worklog ${wl.task_name}`}
                    />
                  )}
                </td>
                <td className="p-3 font-medium">{wl.task_name}</td>
                <td className="p-3">{wl.freelancer_name}</td>
                <td className="p-3">${wl.hourly_rate}/hr</td>
                <td className="p-3">{wl.total_hours}</td>
                <td className="p-3">${wl.total_earned.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${wl.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {wl.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{wl.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({filtered.length} worklogs)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
