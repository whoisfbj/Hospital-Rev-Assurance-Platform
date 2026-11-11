import { ShieldAlert, ShieldCheck } from "lucide-react"
import { useParams } from "react-router-dom"
import { Brand, fmtDate } from "@/components/kit"
import { naira, useStore } from "@/lib/store"

// Public route. In production this should call GET /receipts/:receiptNo/verify on the backend.
export default function VerifyPage() {
  const { receiptNo } = useParams()
  const { bills, patients, departments } = useStore()
  const bill = bills.find((b) => b.receiptNo === receiptNo && b.status === "paid")
  const patient = patients.find((p) => p.id === bill?.patientId)
  const valid = !!bill && !!patient

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center"><Brand /></div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-primary/5">
          <div className={valid ? "bg-emerald-50 px-6 py-8 text-center" : "bg-red-50 px-6 py-8 text-center"}>
            <span className={`mx-auto grid size-14 place-items-center rounded-full ${valid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {valid ? <ShieldCheck className="size-7" /> : <ShieldAlert className="size-7" />}
            </span>
            <h1 className={`font-display mt-4 text-2xl font-bold ${valid ? "text-emerald-800" : "text-red-800"}`}>{valid ? "Receipt verified" : "Receipt not found"}</h1>
            <p className={`mt-1 text-sm ${valid ? "text-emerald-700" : "text-red-700"}`}>
              {valid ? "This payment was recorded by the hospital." : `No paid bill matches ${receiptNo}. Treat this receipt as unverified.`}
            </p>
          </div>
          {valid && bill && patient && (
            <dl className="space-y-3 p-6 text-sm">
              {[
                ["Receipt no.", bill.receiptNo ?? ""],
                ["Patient", patient.name],
                ["Department", departments.find((d) => d.id === bill.departmentId)?.name ?? "-"],
                ["Amount", naira(bill.total)],
                ["Paid on", fmtDate(bill.paidAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}