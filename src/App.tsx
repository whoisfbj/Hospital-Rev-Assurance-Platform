import { Building2, ChevronRight, LayoutDashboard, LogOut, Pill, QrCode, ReceiptText, ShieldCheck, UserRound, Users, Wallet } from "lucide-react"
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { Avatar, Brand } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StoreProvider, useStore, type Role } from "@/lib/store"
import { CatalogPage, DepartmentsPage, UsersPage } from "@/pages/AdminPages"
import BillsPage from "@/pages/BillsPage"
import DashboardPage from "@/pages/DashboardPage"
import PatientsPage from "@/pages/PatientsPage"
import ReceiptPage from "@/pages/ReceiptPage"
import VerifyPage from "@/pages/VerifyPage"

const roleLabel: Record<Role, string> = { admin: "Administrator", service_staff: "Service staff", cashier: "Cashier" }

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "service_staff", "cashier"] },
  { to: "/admin/users", label: "Users & roles", icon: Users, roles: ["admin"] },
  { to: "/admin/departments", label: "Departments", icon: Building2, roles: ["admin"] },
  { to: "/admin/catalog", label: "Drugs & services", icon: Pill, roles: ["admin"] },
  { to: "/patients", label: "Patients", icon: UserRound, roles: ["service_staff", "cashier"] },
  { to: "/bills", label: "Bills & payments", icon: ReceiptText, roles: ["service_staff", "cashier"] },
] as { to: string; label: string; icon: React.ElementType; roles: Role[] }[]

function Login() {
  const { users, departments, login } = useStore()
  const approved = users.filter((u) => u.status === "approved")
  const describe = (u: (typeof users)[number]) =>
    u.role === "service_staff" ? `Service staff · ${departments.find((d) => d.id === u.departmentId)?.name ?? "No department"}` : roleLabel[u.role]

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#0B2F3A] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-40 -top-40 size-136 rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-16 size-88 rounded-full border border-white/10" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-[#F2A93B]/10" />
        <div className="relative"><Brand light /></div>
        <div className="relative max-w-lg space-y-8">
          <h1 className="font-display text-5xl font-bold leading-[1.05]">Every naira billed is a naira collected.</h1>
          <p className="text-lg text-white/70">One place to raise bills, clear payments and prove every receipt, without an EMR.</p>
          <ul className="space-y-4 text-sm">
            {[
              [ReceiptText, "Bills raised at the service point, patient alerted instantly"],
              [Wallet, "Payments cleared by staff or cashiers, receipts issued on the spot"],
              [QrCode, "Every receipt carries a QR code anyone can verify"],
            ].map(([Icon, text], i) => {
              const I = Icon as React.ElementType
              return (
                <li key={i} className="flex items-center gap-3 text-white/85">
                  <span className="grid size-9 place-items-center rounded-lg bg-white/10"><I className="size-4" /></span>{text as string}
                </li>
              )
            })}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-white/50"><ShieldCheck className="size-4" /> Built for hospital revenue teams</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden"><Brand /></div>
          <div>
            <h2 className="font-display text-3xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Demo access: choose a role to continue.</p>
          </div>
          <div className="space-y-3">
            {approved.map((u) => (
              <button key={u.id} onClick={() => login(u.id)}
                className="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-md">
                <Avatar name={u.name} className="size-11 text-sm" />
                <span className="flex-1">
                  <span className="block font-medium">{u.name}</span>
                  <span className="block text-xs text-muted-foreground">{describe(u)}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Shell() {
  const { currentUser, logout } = useStore()
  if (!currentUser) return <Login />
  const links = nav.filter((n) => n.roles.includes(currentUser.role))
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#0B2F3A] p-4 text-white lg:flex print:hidden">
        <div className="px-2 py-3"><Brand light /></div>
        <nav className="mt-6 flex-1 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white shadow-[inset_3px_0_0_#F2A93B]" : "text-white/60 hover:bg-white/5 hover:text-white")}>
              <l.icon className="size-4.5" />{l.label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.name} className="bg-[#F2A93B] text-[#0B2F3A]" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-white/50">{roleLabel[currentUser.role]}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="mt-3 w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-8 print:hidden">
          <div className="lg:hidden"><Brand /></div>
          <p className="hidden text-sm text-muted-foreground lg:block">{today}</p>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground sm:block">{roleLabel[currentUser.role]}</span>
            <Button variant="outline" size="sm" onClick={logout} className="lg:hidden"><LogOut className="size-4" /></Button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden print:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => cn("flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              <l.icon className="size-4" />{l.label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            {currentUser.role === "admin" && <>
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/catalog" element={<CatalogPage />} />
            </>}
            {currentUser.role !== "admin" && <>
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/bills" element={<BillsPage />} />
              <Route path="/receipt/:id" element={<ReceiptPage />} />
            </>}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/verify/:receiptNo" element={<VerifyPage />} />
          <Route path="/*" element={<Shell />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </StoreProvider>
  )
}