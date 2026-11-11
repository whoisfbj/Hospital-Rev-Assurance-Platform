import { Inbox, Minus, Plus, Search, X } from "lucide-react"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Avatar, Empty, fmtDate, PageHeader, Panel, PanelHeader, StatusPill } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { naira, useStore, type BillLine } from "@/lib/store"

function RaiseBill() {
  const { patients, catalog, departments, currentUser, raiseBill } = useStore()
  const [pq, setPq] = useState("")
  const [patientId, setPatientId] = useState("")
  const [lines, setLines] = useState<BillLine[]>([])
  const dept = departments.find((d) => d.id === currentUser?.departmentId)
  const items = catalog.filter((i) => i.departmentId === dept?.id)
  const patient = patients.find((p) => p.id === patientId)
  const q = pq.trim().toLowerCase()
  const matches = !patient && q.length >= 3 ? patients.filter((p) => p.uid.toLowerCase().includes(q) || p.phone.includes(q)) : []
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)

  const add = (id: string) => {
    const i = items.find((x) => x.id === id); if (!i) return
    setLines((p) => p.some((l) => l.itemId === id)
      ? p.map((l) => (l.itemId === id ? { ...l, qty: l.qty + 1 } : l))
      : [...p, { itemId: i.id, name: i.name, price: i.price, qty: 1 }])
  }
  const setQty = (id: string, d: number) =>
    setLines((p) => p.flatMap((l) => (l.itemId !== id ? [l] : l.qty + d <= 0 ? [] : [{ ...l, qty: l.qty + d }])))

  const submit = () => {
    if (!patient || !dept || lines.length === 0) return toast.error("Select a patient and add at least one item")
    raiseBill({ patientId: patient.id, departmentId: dept.id, lines })
    toast.success(`${naira(total)} bill raised. SMS and email alert sent to ${patient.name}.`)
    setLines([]); setPatientId(""); setPq("")
  }

  return (
    <Panel>
      <PanelHeader title="Raise a bill" subtitle={dept ? `${dept.name} department` : "No department assigned"} />
      <div className="space-y-5 p-5">
        {!dept && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">No department is assigned to your account. Ask the admin to assign one.</p>}

        <div>
          <p className="mb-1.5 text-sm font-medium">Patient</p>
          {patient ? (
            <div className="flex items-center gap-3 rounded-lg border bg-accent/50 p-3">
              <Avatar name={patient.name} />
              <div className="flex-1 leading-tight"><p className="text-sm font-medium">{patient.name}</p><p className="text-xs text-muted-foreground"><span className="font-mono">{patient.uid}</span> · {patient.phone}</p></div>
              <Button size="icon" variant="ghost" onClick={() => { setPatientId(""); setPq("") }} aria-label="Change patient"><X className="size-4" /></Button>
            </div>
          ) : (
            <>
              <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input className="h-10 pl-9" placeholder="Patient ID or phone number" value={pq} onChange={(e) => setPq(e.target.value)} /></div>
              {q.length >= 3 && matches.length === 0 && <p className="mt-2 text-xs text-muted-foreground">No patient found. Register them under Patients first.</p>}
              {matches.map((p) => (
                <button key={p.id} onClick={() => setPatientId(p.id)} className="mt-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:border-primary hover:bg-accent/50">
                  <Avatar name={p.name} /><span className="text-sm"><span className="block font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.uid} · {p.phone}</span></span>
                </button>
              ))}
            </>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Add items</p>
          {items.length === 0 ? <p className="text-sm text-muted-foreground">No items registered for this department yet.</p> : (
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((i) => (
                <button key={i.id} onClick={() => add(i.id)} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition hover:border-primary hover:bg-accent/50">
                  <span><span className="block font-medium">{i.name}</span><span className="text-xs text-muted-foreground tabular-nums">{naira(i.price)}</span></span>
                  <Plus className="size-4 text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {lines.map((l) => (
              <li key={l.itemId} className="flex items-center gap-3 p-3 text-sm">
                <span className="flex-1 font-medium">{l.name}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(l.itemId, -1)} aria-label="Decrease"><Minus className="size-3" /></Button>
                  <span className="w-7 text-center tabular-nums">{l.qty}</span>
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(l.itemId, 1)} aria-label="Increase"><Plus className="size-3" /></Button>
                </div>
                <span className="w-24 text-right font-semibold tabular-nums">{naira(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div><p className="text-xs text-muted-foreground">Total due</p><p className="font-display text-2xl font-bold tabular-nums">{naira(total)}</p></div>
          <Button className="h-10 px-5" onClick={submit}>Raise bill</Button>
        </div>
      </div>
    </Panel>
  )
}

export default function BillsPage() {
  const { bills, patients, departments, currentUser, clearBill } = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get("patient") ?? "")
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all")
  const [clearing, setClearing] = useState<string | null>(null)
  const [ref, setRef] = useState("")
  const canRaise = currentUser?.role === "service_staff"
  const needle = q.trim().toLowerCase()

  const rows = bills.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false
    if (!needle) return true
    const p = patients.find((x) => x.id === b.patientId)
    return !!p && (p.uid.toLowerCase().includes(needle) || p.phone.includes(needle))
  })
  const target = bills.find((b) => b.id === clearing)
  const targetPatient = patients.find((p) => p.id === target?.patientId)

  const confirm = () => {
    if (!clearing || !ref.trim()) return toast.error("Enter the payment reference")
    clearBill(clearing, ref.trim())
    toast.success("Bill cleared. Receipt emailed to the patient.")
    const id = clearing; setClearing(null); setRef(""); nav(`/receipt/${id}`)
  }

  const tabs: { key: typeof filter; label: string; n: number }[] = [
    { key: "all", label: "All", n: bills.length },
    { key: "pending", label: "Pending", n: bills.filter((b) => b.status === "pending").length },
    { key: "paid", label: "Paid", n: bills.filter((b) => b.status === "paid").length },
  ]

  return (
    <>
      <PageHeader title="Bills & payments" subtitle="Raise bills, clear payments and print receipts." />
      <div className={cn("grid gap-6", canRaise && "xl:grid-cols-[440px_1fr]")}>
        {canRaise && <RaiseBill />}
        <Panel className="h-fit">
          <PanelHeader title="Payment records"
            action={<div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input className="h-9 w-56 pl-9" placeholder="Patient ID or phone" value={q} onChange={(e) => { setQ(e.target.value); setParams({}) }} /></div>} />
          <div className="flex gap-1 border-b px-5 py-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={cn("rounded-full px-3 py-1 text-sm font-medium", filter === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {t.label} <span className="opacity-70">{t.n}</span>
              </button>
            ))}
          </div>
          {rows.length === 0 ? <Empty icon={Inbox} title="No bills found" text="Try another filter or search." /> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">Patient</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="pr-5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => {
                  const p = patients.find((x) => x.id === b.patientId)
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="pl-5"><p className="font-medium">{p?.name}</p><p className="font-mono text-xs text-muted-foreground">{p?.uid} · {fmtDate(b.createdAt)}</p></TableCell>
                      <TableCell>{departments.find((d) => d.id === b.departmentId)?.name}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{naira(b.total)}</TableCell>
                      <TableCell><StatusPill status={b.status} /></TableCell>
                      <TableCell className="pr-5 text-right">
                        {b.status === "pending"
                          ? <Button size="sm" onClick={() => setClearing(b.id)}>Clear bill</Button>
                          : <Button size="sm" variant="outline" onClick={() => nav(`/receipt/${b.id}`)}>Receipt</Button>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Panel>
      </div>

      <Dialog open={!!clearing} onOpenChange={(o) => { if (!o) { setClearing(null); setRef("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear bill</DialogTitle>
            <DialogDescription>Confirm that the transfer has been received before clearing.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">{targetPatient?.name}</p>
            <p className="font-display text-3xl font-bold tabular-nums">{naira(target?.total ?? 0)}</p>
          </div>
          <label className="block space-y-1.5"><span className="text-sm font-medium">Transfer reference</span>
            <Input className="h-10" placeholder="e.g. TRF-88120 or session ID" value={ref} onChange={(e) => setRef(e.target.value)} /></label>
          <DialogFooter><Button className="h-10" onClick={confirm}>Confirm payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}