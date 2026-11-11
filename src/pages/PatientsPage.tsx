import { ReceiptText, Search, UserPlus, UserRound } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Avatar, Empty, Field, PageHeader, Panel, PanelHeader } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { naira, useStore } from "@/lib/store"

export default function PatientsPage() {
  const { patients, bills, registerPatient } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ name: "", phone: "", email: "" })
  const [q, setQ] = useState("")
  const needle = q.trim().toLowerCase()
  const results = needle ? patients.filter((p) => [p.uid, p.phone, p.name].some((x) => x.toLowerCase().includes(needle))) : patients

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name || !f.phone || !f.email) return toast.error("Name, phone and email are required")
    if (patients.some((p) => p.phone === f.phone)) return toast.error("A patient with this phone number already exists")
    const p = registerPatient(f)
    toast.success(`${p.name} registered. Patient ID: ${p.uid}`)
    setF({ name: "", phone: "", email: "" })
  }

  return (
    <>
      <PageHeader title="Patients" subtitle="Register new patients and look up payment records." />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel className="h-fit">
          <PanelHeader title="Register patient" subtitle="A unique patient ID is created automatically" />
          <form onSubmit={submit} className="space-y-4 p-5">
            <Field label="Full name"><Input className="h-10" placeholder="Chioma Okafor" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Phone number"><Input className="h-10" inputMode="tel" placeholder="0803 123 4567" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Email"><Input className="h-10" type="email" placeholder="name@email.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Button type="submit" className="h-10 w-full"><UserPlus className="size-4" /> Register patient</Button>
          </form>
        </Panel>

        <Panel>
          <PanelHeader title={`Patient directory (${patients.length})`}
            action={<div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 w-64 pl-9" placeholder="Search by ID, phone or name" value={q} onChange={(e) => setQ(e.target.value)} /></div>} />
          {results.length === 0 ? (
            <Empty icon={UserRound} title="No patients found" text="Check the ID or phone number, or register the patient on the left." />
          ) : (
            <ul className="divide-y">
              {results.map((p) => {
                const due = bills.filter((b) => b.patientId === p.id && b.status === "pending").reduce((s, b) => s + b.total, 0)
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <Avatar name={p.name} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground"><span className="font-mono">{p.uid}</span> · {p.phone}</p>
                    </div>
                    {due > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">{naira(due)} due</span>}
                    <Button size="sm" variant="outline" onClick={() => nav(`/bills?patient=${p.uid}`)}><ReceiptText className="size-4" /> Payment record</Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}