import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

export const Route = createFileRoute("/_layout/payments_/$id")({
  component: PaymentDetail,
  head: () => ({
    meta: [{ title: "Payment Detail - Payment Dashboard" }],
  }),
})

function PaymentDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<any>(null)
  const [worklogs, setWorklogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true)
        const resp = await api.get(
          `/api/v1/financial/payments/${id}`,
        )
        setPayment(resp.data)

        const wls: any[] = []
        for (const wlId of resp.data.worklog_ids) {
          try {
            const wlResp = await api.get(
              `/api/v1/financial/worklogs/${wlId}`,
            )
            wls.push(wlResp.data)
          } catch (err) {
            console.error(err)
            continue
          }
        }
        setWorklogs(wls)
        setError("")
      } catch (err) {
        setError("Failed to load payment details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayment()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading payment...</p>
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

  if (!payment) return null

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate({ to: "/payments" })}
        className="self-start rounded-md border px-3 py-1 text-sm hover:bg-muted"
        aria-label="Go back to payments list"
      >
        Back to Payments
      </button>

      <div className="rounded-md border p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          Payment Detail
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Payment ID</p>
            <p className="font-mono text-xs">{payment.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold">
              ${payment.total_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {payment.status}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">Paid At</p>
            <p className="font-medium">{payment.paid_at}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{payment.created_at}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Notes</p>
            <p className="font-medium">{payment.notes || "-"}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Associated Worklogs</h2>
        {worklogs.length === 0 ? (
          <p className="text-muted-foreground">No worklog details available.</p>
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
                {worklogs.map((wl: any) => (
                  <tr
                    key={wl.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() =>
                      navigate({
                        to: "/worklogs/$id",
                        params: { id: wl.id },
                      })
                    }
                  >
                    <td className="p-3 font-medium">{wl.task_name}</td>
                    <td className="p-3">{wl.freelancer_name}</td>
                    <td className="p-3">{wl.total_hours}</td>
                    <td className="p-3">${wl.total_earned.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
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
