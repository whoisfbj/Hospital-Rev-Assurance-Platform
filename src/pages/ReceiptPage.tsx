import { ArrowLeft, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Link, useParams } from "react-router-dom"
import { Brand, fmtDate } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { naira, useStore } from "@/lib/store"

export default function ReceiptPage() {
  const { id } = useParams()
  const { bills, patients, departments } = useStore()
  const bill = bills.find((b) => b.id === id)
  const patient = patients.find((p) => p.id === bill?.patientId)

  if (!bill || bill.status !== "paid" || !patient)
    return <p className="text-sm">Receipt not available. <Link className="font-medium text-primary underline" to="/bills">Back to bills</Link></p>

  const verifyUrl = `${window.location.origin}/verify/${bill.receiptNo}`
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
  )

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-5 flex gap-2 print:hidden">
        <Button variant="outline" asChild><Link to="/bills"><ArrowLeft className="size-4" /> Back</Link></Button>
        <Button onClick={() => window.print()}><Printer className="size-4" /> Print receipt</Button>
      </div>

      <div className="overflow-hidden rounded-t-2xl bg-white shadow-xl shadow-primary/10 ring-1 ring-black/5 print:shadow-none">
        <div className="flex items-center justify-between bg-[#0B2F3A] px-6 py-5 text-white">
          <Brand light />
          <span className="font-mono text-xs text-white/60">{bill.receiptNo}</span>
        </div>

        <div className="space-y-5 p-6 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Amount paid</p>
              <p className="font-display text-4xl font-bold tabular-nums">{naira(bill.total)}</p>
            </div>
            <span className="-rotate-12 rounded-md border-2 border-emerald-600 px-3 py-1 font-display text-lg font-bold text-emerald-600">PAID</span>
          </div>

          <dl className="space-y-2">
            {row("Patient", patient.name)}
            {row("Patient ID", patient.uid)}
            {row("Department", departments.find((d) => d.id === bill.departmentId)?.name ?? "-")}
            {row("Date", fmtDate(bill.paidAt))}
          </dl>

          <div className="border-t border-dashed pt-4">
            <ul className="space-y-2">
              {bill.lines.map((l) => (
                <li key={l.itemId} className="flex justify-between gap-4">
                  <span>{l.name} <span className="text-muted-foreground">× {l.qty}</span></span>
                  <span className="font-medium tabular-nums">{naira(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-3 font-semibold"><span>Total</span><span className="tabular-nums">{naira(bill.total)}</span></div>
          </div>

          <dl className="space-y-2 border-t border-dashed pt-4">
            {row("Payment ref", bill.paymentRef ?? "-")}
            {row("Cleared by", bill.clearedBy ?? "-")}
          </dl>

          <div className="flex flex-col items-center gap-2 border-t border-dashed pt-5">
            <QRCodeSVG value={verifyUrl} size={120} />
            <p className="text-center text-xs text-muted-foreground">Scan to verify this receipt</p>
          </div>
        </div>
        <div className="h-3" style={{ background: "radial-gradient(circle at 6px 12px, transparent 6px, #fff 6.5px) 0 0 / 12px 12px" }} />
      </div>
    </div>
  )
}