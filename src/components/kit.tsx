import { HeartPulse } from "lucide-react"
import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "-"

export const initials = (name: string) =>
  name.replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")

export function Brand({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-[#F2A93B] text-[#0B2F3A]"><HeartPulse className="size-5" /></span>
      <div className="leading-tight">
        <p className={cn("font-display text-base font-bold", light ? "text-white" : "text-foreground")}>Revenue Assurance</p>
        <p className={cn("text-xs", light ? "text-white/60" : "text-muted-foreground")}>Hospital collections</p>
      </div>
    </div>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary", className)}>
      {initials(name)}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl border bg-card shadow-[0_1px_2px_rgba(12,31,38,0.04)]", className)}>{children}</section>
}

export function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
      <div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: {
  label: string; value: ReactNode; hint?: string; icon: ElementType; tone?: "primary" | "amber" | "green" | "slate"
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  }
  return (
    <div className="rounded-xl border bg-card p-5 shadow-[0_1px_2px_rgba(12,31,38,0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-lg", tones[tone])}><Icon className="size-4.5" /></span>
      </div>
      <p className="font-display mt-3 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function StatusPill({ status }: { status: "paid" | "pending" | "approved" }) {
  const ok = status !== "pending"
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
      <span className={cn("size-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
      {status === "approved" ? "Approved" : status === "paid" ? "Paid" : "Pending"}
    </span>
  )
}

export function Empty({ icon: Icon, title, text }: { icon: ElementType; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-5" /></span>
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-xs text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}