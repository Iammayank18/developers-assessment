import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Cloud",
      },
    ],
  }),
})

function Dashboard() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [worklogs, setWorklogs] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [wlResp, pmtResp] = await Promise.all([
          api.get("/api/v1/financial/worklogs/"),
          api.get("/api/v1/financial/payments/"),
        ])
        setWorklogs(wlResp.data.data)
        setPayments(pmtResp.data.data)
        setError("")
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalEarned = worklogs.reduce(
    (sum: number, wl: any) => sum + wl.total_earned,
    0,
  )
  const pendingAmount = worklogs
    .filter((wl: any) => wl.status === "pending")
    .reduce((sum: number, wl: any) => sum + wl.total_earned, 0)
  const totalPaid = payments.reduce(
    (sum: number, pmt: any) => sum + pmt.total_amount,
    0,
  )
  const activeFreelancers = new Set(
    worklogs.map((wl: any) => wl.freelancer_name),
  ).size

  const recentWorklogs = worklogs.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading dashboard...</p>
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
      <div>
        <h1 className="text-2xl truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!!!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Pending Amount</p>
          <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Active Freelancers</p>
          <p className="text-2xl font-bold">{activeFreelancers}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Worklogs</h2>
          <Link
            to="/worklogs"
            className="text-sm text-primary hover:underline"
            aria-label="View all worklogs"
          >
            View all
          </Link>
        </div>

        {recentWorklogs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No worklogs yet.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">Task</th>
                  <th className="p-3 text-left">Freelancer</th>
                  <th className="p-3 text-left">Hours</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentWorklogs.map((wl: any) => (
                  <tr
                    key={wl.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() =>
                      navigate({ to: "/worklogs/$id", params: { id: wl.id } })
                    }
                  >
                    <td className="p-3 font-medium">{wl.task_name}</td>
                    <td className="p-3">{wl.freelancer_name}</td>
                    <td className="p-3">{wl.total_hours}</td>
                    <td className="p-3">${wl.total_earned.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${wl.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {wl.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
