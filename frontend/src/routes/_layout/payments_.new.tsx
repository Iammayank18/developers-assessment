import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

export const Route = createFileRoute("/_layout/payments_/new")({
  component: PaymentReview,
  validateSearch: (search: Record<string, unknown>) => {
    const wl = search.wl
    if (Array.isArray(wl)) return { wl: wl as string[] }
    if (typeof wl === "string") return { wl: [wl] }
    return { wl: [] as string[] }
  },
  head: () => ({
    meta: [{ title: "Review Payment - Payment Dashboard" }],
  }),
})

function PaymentReview() {
  const navigate = useNavigate()
  const { wl: wlIds } = useSearch({ from: "/_layout/payments_/new" })
  const [worklogs, setWorklogs] = useState<any[]>([])
  const [excluded, setExcluded] = useState<string[]>([])
  const [excludedFreelancers, setExcludedFreelancers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        const results: any[] = []
        for (const id of wlIds) {
          const resp = await api.get(
            `/api/v1/financial/worklogs/${id}`,
          )
          results.push(resp.data)
        }
        setWorklogs(results)
        setError("")
      } catch (err) {
        setError("Failed to load worklog details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (wlIds.length > 0) {
      fetchDetails()
    } else {
      setLoading(false)
    }
  }, [])

  const toggleExclude = (id: string) => {
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleFreelancer = (name: string) => {
    setExcludedFreelancers((prev) => {
      const next = prev.includes(name)
        ? prev.filter((x) => x !== name)
        : [...prev, name]

      const freelancerWls = worklogs
        .filter((wl: any) => wl.freelancer_name === name)
        .map((wl: any) => wl.id)

      if (next.includes(name)) {
        setExcluded((prevEx) => [
          ...new Set([...prevEx, ...freelancerWls]),
        ])
      } else {
        setExcluded((prevEx) =>
          prevEx.filter((id) => !freelancerWls.includes(id)),
        )
      }

      return next
    })
  }

  const included = worklogs.filter(
    (wl: any) =>
      !excluded.includes(wl.id) &&
      !excludedFreelancers.includes(wl.freelancer_name),
  )

  const runningTotal = included.reduce(
    (sum: number, wl: any) => sum + wl.total_earned,
    0,
  )

  const freelancers = [...new Set(worklogs.map((wl: any) => wl.freelancer_name))]

  const handleConfirm = async () => {
    if (included.length === 0) return
    try {
      setSubmitting(true)
      const resp = await api.post(
        "/api/v1/financial/payments/",
        {
          wl_ids: included.map((wl: any) => wl.id),
          notes: notes,
        },
      )
      navigate({ to: "/payments/$id", params: { id: resp.data.id } })
    } catch (err) {
      setError("Failed to create payment. Please try again.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading payment review...</p>
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

  if (worklogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">No worklogs selected for payment.</p>
        <button
          onClick={() => navigate({ to: "/worklogs" })}
          className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
        >
          Back to Worklogs
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Payment</h1>
          <p className="text-muted-foreground">
            Review and confirm payment for selected worklogs
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/worklogs" })}
          className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          aria-label="Go back to worklogs"
        >
          Back
        </button>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-2">Exclude by Freelancer</h2>
        <div className="flex gap-2 flex-wrap">
          {freelancers.map((name: string) => (
            <button
              key={name}
              className={`rounded-md px-3 py-1 text-sm border ${excludedFreelancers.includes(name) ? "bg-red-100 text-red-700 border-red-300" : "bg-background"}`}
              onClick={() => toggleFreelancer(name)}
              aria-label={`Toggle exclusion for ${name}`}
            >
              {name}
              {excludedFreelancers.includes(name) ? " (excluded)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left">Include</th>
              <th className="p-3 text-left">Freelancer</th>
              <th className="p-3 text-left">Task</th>
              <th className="p-3 text-left">Hours</th>
              <th className="p-3 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {worklogs.map((wl: any) => {
              const isExcluded =
                excluded.includes(wl.id) ||
                excludedFreelancers.includes(wl.freelancer_name)
              return (
                <tr
                  key={wl.id}
                  className={`border-b ${isExcluded ? "opacity-40" : ""}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => toggleExclude(wl.id)}
                      aria-label={`Toggle inclusion for ${wl.task_name}`}
                    />
                  </td>
                  <td className="p-3">{wl.freelancer_name}</td>
                  <td className="p-3 font-medium">{wl.task_name}</td>
                  <td className="p-3">{wl.total_hours}</td>
                  <td className="p-3">${wl.total_earned.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="text-sm text-muted-foreground">Running Total</p>
          <p className="text-2xl font-bold">${runningTotal.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            {included.length} of {worklogs.length} worklogs included
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            rows={2}
            placeholder="Add payment notes..."
          />
        </label>
      </div>

      <button
        onClick={handleConfirm}
        disabled={included.length === 0 || submitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        aria-label="Confirm payment"
      >
        {submitting ? "Processing..." : `Confirm Payment ($${runningTotal.toFixed(2)})`}
      </button>
    </div>
  )
}
