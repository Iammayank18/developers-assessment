import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

export const Route = createFileRoute("/_layout/worklogs_/$id")({
  component: WorklogDetail,
  head: () => ({
    meta: [{ title: "Worklog Detail - Payment Dashboard" }],
  }),
})

function WorklogDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [worklog, setWorklog] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWorklog = async () => {
      try {
        setLoading(true)
        const resp = await api.get(`/api/v1/financial/worklogs/${id}`)
        setWorklog(resp.data)
        setError("")
      } catch (err) {
        setError("Failed to load worklog details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorklog()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading worklog...</p>
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

  if (!worklog) return null

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate({ to: "/worklogs" })}
        className="self-start rounded-md border px-3 py-1 text-sm hover:bg-muted"
        aria-label="Go back to worklogs list"
      >
        Back to Worklogs
      </button>

      <div className="rounded-md border p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          {worklog.task_name}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Freelancer</p>
            <p className="font-medium">{worklog.freelancer_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{worklog.freelancer_email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hourly Rate</p>
            <p className="font-medium">${worklog.hourly_rate}/hr</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Hours</p>
            <p className="font-medium">{worklog.total_hours}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Earned</p>
            <p className="font-medium">${worklog.total_earned.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${worklog.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {worklog.status}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{worklog.created_at}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Time Segments</h2>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Start Time</th>
                <th className="p-3 text-left">End Time</th>
                <th className="p-3 text-left">Hours</th>
                <th className="p-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {worklog.segments.map((seg: any) => (
                <tr key={seg.id} className="border-b">
                  <td className="p-3">{seg.start_time}</td>
                  <td className="p-3">{seg.end_time}</td>
                  <td className="p-3">{seg.hours}</td>
                  <td className="p-3">{seg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
