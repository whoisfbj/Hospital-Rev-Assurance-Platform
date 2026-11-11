import { Hourglass, Inbox, TrendingUp, UserRound, Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, Empty, fmtDate, PageHeader, Panel, PanelHeader, StatCard, StatusPill } from "@/components/kit"
import { cn } from "@/lib/utils"
import { naira, useStore } from "@/lib/store"

export default function DashboardPage() {
  const { bills, patients, departments, currentUser } = useStore()
  const scoped = currentUser?.role === "service_staff" ? bills.filter((b) => b.departmentId === currentUser.departmentId) : bills
  const paid = scoped.filter((b) => b.status === "paid")
  const pending = scoped.filter((b) => b.status === "pending")
  const sum = (xs: typeof bills) => xs.reduce((s, b) => s + b.total, 0)
  const sameDay = (iso: string | undefined, d: Date) => !!iso && new Date(iso).toDateString() === d.toDateString()

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return { label: d.toLocaleDateString("en-NG", { weekday: "short" }), total: sum(paid.filter((b) => sameDay(b.paidAt, d))) }
  })
  const max = Math.max(...days.map((d) => d.total), 1)

  const byDept = departments
    .map((d) => ({ name: d.name, total: sum(paid.filter((b) => b.departmentId === d.id)) }))
    .filter((d) => d.total > 0).sort((a, b) => b.total - a.total)
  const topDept = Math.max(...byDept.map((d) => d.total), 1)

  const h = new Date().getHours()
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  const recent = scoped.slice(0, 6)

  return (
    <>
      <PageHeader title={`${greet}, ${currentUser?.name.split(" ")[0]}`} subtitle="Here is how collections are going." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected today" value={naira(sum(paid.filter((b) => sameDay(b.paidAt, new Date()))))} icon={Wallet} tone="green" hint="Cleared payments" />
        <StatCard label="Total collected" value={naira(sum(paid))} icon={TrendingUp} hint={`${paid.length} paid bills`} />
        <StatCard label="Outstanding" value={naira(sum(pending))} icon={Hourglass} tone="amber" hint={`${pending.length} bills awaiting payment`} />
        <StatCard label="Patients" value={patients.length} icon={UserRound} tone="slate" hint="Registered" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Collections, last 7 days" subtitle="Cleared payments per day" />
          <div className="flex h-56 items-end gap-3 p-5">
            {days.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center">
                <div className="flex w-full flex-1 items-end">
                  <div className={cn("w-full rounded-t-md", i === 6 ? "bg-primary" : "bg-primary/20")} style={{ height: `${Math.max(3, (d.total / max) * 100)}%` }} title={naira(d.total)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Revenue by department" />
          <div className="space-y-4 p-5">
            {byDept.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
            {byDept.map((d) => (
              <div key={d.name}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{d.name}</span><span className="tabular-nums text-muted-foreground">{naira(d.total)}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-[#F2A93B]" style={{ width: `${(d.total / topDept) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader title="Recent bills" action={currentUser?.role !== "admin" && <Link to="/bills" className="text-sm font-medium text-primary hover:underline">View all</Link>} />
        {recent.length === 0 ? <Empty icon={Inbox} title="No bills yet" text="Bills will show up here as soon as they are raised." /> : (
          <ul className="divide-y">
            {recent.map((b) => {
              const p = patients.find((x) => x.id === b.patientId)
              return (
                <li key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                  <Avatar name={p?.name ?? "?"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">{departments.find((d) => d.id === b.departmentId)?.name} · {fmtDate(b.createdAt)}</p>
                  </div>
                  <span className="hidden text-sm font-semibold tabular-nums sm:block">{naira(b.total)}</span>
                  <StatusPill status={b.status} />
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </>
  )
}