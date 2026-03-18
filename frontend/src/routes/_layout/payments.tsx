import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

export const Route = createFileRoute("/_layout/payments")({
  component: Payments,
  head: () => ({
    meta: [{ title: "Payments - Payment Dashboard" }],
  }),
})

function Payments() {
  const navigate = useNavigate()
  const [allData, setAllData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const resp = await api.get(
          "/api/v1/financial/payments/",
        )
        setAllData(resp.data.data)
        setError("")
      } catch (err) {
        setError("Failed to load payments. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const totalPages = Math.ceil(allData.length / pageSize)
  const displayed = allData.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading payments...</p>
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
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">View all processed payments</p>
      </div>

      {allData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No payments yet.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">Payment ID</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Worklogs</th>
                  <th className="p-3 text-left">Paid At</th>
                  <th className="p-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((pmt: any) => (
                  <tr
                    key={pmt.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() =>
                      navigate({
                        to: "/payments/$id",
                        params: { id: pmt.id },
                      })
                    }
                  >
                    <td className="p-3 font-mono text-xs">
                      {pmt.id.slice(0, 8)}...
                    </td>
                    <td className="p-3 font-medium">
                      ${pmt.total_amount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {pmt.status}
                      </span>
                    </td>
                    <td className="p-3">{pmt.worklog_ids.length}</td>
                    <td className="p-3 text-muted-foreground">{pmt.paid_at}</td>
                    <td className="p-3 text-muted-foreground">
                      {pmt.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({allData.length} payments)
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
        </>
      )}
    </div>
  )
}
