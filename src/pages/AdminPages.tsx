import { Building2, Hourglass, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, Empty, Field, PageHeader, Panel, PanelHeader, StatusPill } from "@/components/kit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { naira, useStore, type Role, type User } from "@/lib/store"

export function UsersPage() {
  const { users, departments, currentUser, approveUser, removeUser, setRole } = useStore()
  const [target, setTarget] = useState<User | null>(null)
  const pending = users.filter((u) => u.status === "pending")

  return (
    <>
      <PageHeader title="Users & roles" subtitle="Approve new staff, assign roles and remove access." />
      {pending.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Hourglass className="size-4" /> {pending.length} user{pending.length > 1 ? "s are" : " is"} waiting for your approval.
        </div>
      )}
      <Panel>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-5">User</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead className="pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} />
                    <div className="leading-tight"><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => setRole(u.id, v as Role, departments[0]?.id)}>
                    <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="service_staff">Service staff</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {u.role === "service_staff" ? (
                    <Select value={u.departmentId} onValueChange={(v) => setRole(u.id, "service_staff", v)}>
                      <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Assign" /></SelectTrigger>
                      <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell><StatusPill status={u.status} /></TableCell>
                <TableCell className="pr-5">
                  <div className="flex justify-end gap-2">
                    {u.status === "pending" && <Button size="sm" onClick={() => { approveUser(u.id); toast.success(`${u.name} approved`) }}>Approve</Button>}
                    <Button size="sm" variant="outline" disabled={u.id === currentUser?.id} onClick={() => setTarget(u)} className="text-destructive hover:text-destructive">
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {target?.name}?</DialogTitle>
            <DialogDescription>They will lose access to the platform immediately. Bills they raised stay on record.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (target) { removeUser(target.id); toast.success(`${target.name} removed`) } setTarget(null) }}>Remove user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function DepartmentsPage() {
  const { departments, catalog, users, bills, addDepartment } = useStore()
  const [name, setName] = useState("")
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addDepartment(name.trim()); setName(""); toast.success("Department added")
  }
  return (
    <>
      <PageHeader title="Departments" subtitle="Service points that raise bills, such as Pharmacy, Lab and Radiology." />
      <Panel className="mb-6">
        <form onSubmit={submit} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1"><Field label="New department"><Input className="h-10" placeholder="e.g. Dental" value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
          <Button type="submit" className="h-10 px-4"><Plus className="size-4" /> Add department</Button>
        </form>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <Panel key={d.id} className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-5" /></span>
              <p className="font-display text-lg font-semibold">{d.name}</p>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Items</dt><dd className="font-semibold">{catalog.filter((c) => c.departmentId === d.id).length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Staff</dt><dd className="font-semibold">{users.filter((u) => u.departmentId === d.id).length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Collected</dt><dd className="font-semibold tabular-nums">{naira(bills.filter((b) => b.departmentId === d.id && b.status === "paid").reduce((s, b) => s + b.total, 0))}</dd></div>
            </dl>
          </Panel>
        ))}
      </div>
    </>
  )
}

export function CatalogPage() {
  const { catalog, departments, addCatalogItem, removeCatalogItem } = useStore()
  const [f, setF] = useState({ name: "", price: "", type: "drug" as "drug" | "service", departmentId: "" })
  const [q, setQ] = useState("")
  const rows = catalog.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name || !f.price || !f.departmentId) return toast.error("Fill in name, price and department")
    addCatalogItem({ name: f.name, price: Number(f.price), type: f.type, departmentId: f.departmentId })
    setF({ ...f, name: "", price: "" }); toast.success("Item added")
  }

  return (
    <>
      <PageHeader title="Drugs & services" subtitle="Everything that can appear on a bill, with its price." />
      <Panel className="mb-6">
        <PanelHeader title="Add an item" />
        <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div className="lg:col-span-2"><Field label="Name"><Input className="h-10" placeholder="Amoxicillin 500mg" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
          <Field label="Price (₦)"><Input className="h-10" type="number" min={0} placeholder="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as "drug" | "service" })}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="drug">Drug</SelectItem><SelectItem value="service">Service</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Department">
            <Select value={f.departmentId} onValueChange={(v) => setF({ ...f, departmentId: v })}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Button type="submit" className="h-10 sm:col-span-2 lg:col-span-5 lg:w-fit"><Plus className="size-4" /> Add item</Button>
        </form>
      </Panel>

      <Panel>
        <PanelHeader title={`Price list (${catalog.length})`}
          action={<div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 w-56 pl-9" placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} /></div>} />
        {rows.length === 0 ? <Empty icon={Search} title="No items found" /> : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-5">Name</TableHead><TableHead>Type</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="pr-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="pl-5 font-medium">{i.name}</TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", i.type === "drug" ? "bg-amber-50 text-amber-700" : "bg-primary/10 text-primary")}>{i.type === "drug" ? "Drug" : "Service"}</span>
                  </TableCell>
                  <TableCell>{departments.find((d) => d.id === i.departmentId)?.name}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{naira(i.price)}</TableCell>
                  <TableCell className="pr-5 text-right"><Button size="icon" variant="ghost" onClick={() => removeCatalogItem(i.id)} aria-label={`Remove ${i.name}`}><Trash2 className="size-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  )
}