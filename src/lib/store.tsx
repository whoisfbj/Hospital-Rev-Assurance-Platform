import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "admin" | "service_staff" | "cashier"
export type User = { id: string; name: string; email: string; role: Role; departmentId?: string; status: "pending" | "approved" }
export type Department = { id: string; name: string }
export type CatalogItem = { id: string; name: string; type: "drug" | "service"; price: number; departmentId: string }
export type Patient = { id: string; uid: string; name: string; phone: string; email: string }
export type BillLine = { itemId: string; name: string; price: number; qty: number }
export type Bill = {
  id: string; patientId: string; departmentId: string; lines: BillLine[]; total: number
  status: "pending" | "paid"; createdAt: string; raisedBy: string
  paidAt?: string; paymentRef?: string; clearedBy?: string; receiptNo?: string
}

const uid = () => Math.random().toString(36).slice(2, 10)

const day = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const seed = {
  users: [
    { id: "u1", name: "Admin", email: "admin@hospital.com", role: "admin", status: "approved" },
    { id: "u2", name: "Ada (Pharmacy)", email: "ada@hospital.com", role: "service_staff", departmentId: "d1", status: "approved" },
    { id: "u3", name: "Tunde (Cashier)", email: "tunde@hospital.com", role: "cashier", status: "approved" },
    { id: "u4", name: "Ngozi (Lab)", email: "ngozi@hospital.com", role: "service_staff", departmentId: "d2", status: "pending" },
  ] as User[],
  departments: [{ id: "d1", name: "Pharmacy" }, { id: "d2", name: "Laboratory" }, { id: "d3", name: "Radiology" }] as Department[],
  catalog: [
    { id: "c1", name: "Paracetamol 500mg", type: "drug", price: 500, departmentId: "d1" },
    { id: "c2", name: "Malaria Test", type: "service", price: 3000, departmentId: "d2" },
    { id: "c3", name: "Chest X-Ray", type: "service", price: 12000, departmentId: "d3" },
  ] as CatalogItem[],
    patients: [
    { id: "p1", uid: "PT-482913", name: "Chioma Okafor", phone: "08031234567", email: "chioma@mail.com" },
    { id: "p2", uid: "PT-507261", name: "Emeka Nwosu", phone: "08127654321", email: "emeka@mail.com" },
    { id: "p3", uid: "PT-639045", name: "Fatima Bello", phone: "07011223344", email: "fatima@mail.com" },
  ] as Patient[],
  bills: [
    { id: "b1", patientId: "p1", departmentId: "d1", lines: [{ itemId: "c1", name: "Paracetamol 500mg", price: 500, qty: 4 }], total: 2000, status: "paid", createdAt: day(0), raisedBy: "Ada (Pharmacy)", paidAt: day(0), paymentRef: "TRF-88120", clearedBy: "Tunde (Cashier)", receiptNo: "RCP-7K2M9A" },
    { id: "b2", patientId: "p2", departmentId: "d2", lines: [{ itemId: "c2", name: "Malaria Test", price: 3000, qty: 1 }], total: 3000, status: "paid", createdAt: day(1), raisedBy: "Ngozi (Lab)", paidAt: day(1), paymentRef: "TRF-77034", clearedBy: "Tunde (Cashier)", receiptNo: "RCP-3QX81B" },
    { id: "b3", patientId: "p3", departmentId: "d3", lines: [{ itemId: "c3", name: "Chest X-Ray", price: 12000, qty: 1 }], total: 12000, status: "paid", createdAt: day(2), raisedBy: "Tunde (Cashier)", paidAt: day(2), paymentRef: "TRF-66512", clearedBy: "Tunde (Cashier)", receiptNo: "RCP-9ZD44C" },
    { id: "b6", patientId: "p3", departmentId: "d2", lines: [{ itemId: "c2", name: "Malaria Test", price: 3000, qty: 2 }], total: 6000, status: "paid", createdAt: day(3), raisedBy: "Ngozi (Lab)", paidAt: day(3), paymentRef: "TRF-55201", clearedBy: "Tunde (Cashier)", receiptNo: "RCP-5LM02D" },
    { id: "b4", patientId: "p1", departmentId: "d2", lines: [{ itemId: "c2", name: "Malaria Test", price: 3000, qty: 1 }], total: 3000, status: "pending", createdAt: day(0), raisedBy: "Ngozi (Lab)" },
    { id: "b5", patientId: "p2", departmentId: "d1", lines: [{ itemId: "c1", name: "Paracetamol 500mg", price: 500, qty: 6 }], total: 3000, status: "pending", createdAt: day(0), raisedBy: "Ada (Pharmacy)" },
  ] as Bill[],
}

function usePersisted<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV] as const
}

/**
 * MOCK STORE. Every function below maps to one backend call.
 * Swap the body of each with fetch/axios once the backend dev shares endpoints.
 */
function useStoreState() {
  const [users, setUsers] = usePersisted("hrap.users", seed.users)
  const [departments, setDepartments] = usePersisted("hrap.departments", seed.departments)
  const [catalog, setCatalog] = usePersisted("hrap.catalog", seed.catalog)
  const [patients, setPatients] = usePersisted("hrap.patients", seed.patients)
  const [bills, setBills] = usePersisted("hrap.bills", seed.bills)
  const [currentId, setCurrentId] = usePersisted<string | null>("hrap.current", null)
  const currentUser = users.find((u) => u.id === currentId && u.status === "approved") ?? null

  return {
    users, departments, catalog, patients, bills, currentUser,
    login: (id: string) => setCurrentId(id),
    logout: () => setCurrentId(null),
    // admin
    approveUser: (id: string) => setUsers((p) => p.map((u) => (u.id === id ? { ...u, status: "approved" } : u))),
    removeUser: (id: string) => setUsers((p) => p.filter((u) => u.id !== id)),
    setRole: (id: string, role: Role, departmentId?: string) =>
      setUsers((p) => p.map((u) => (u.id === id ? { ...u, role, departmentId: role === "service_staff" ? departmentId ?? u.departmentId : undefined } : u))),
    addDepartment: (name: string) => setDepartments((p) => [...p, { id: uid(), name }]),
    addCatalogItem: (i: Omit<CatalogItem, "id">) => setCatalog((p) => [...p, { ...i, id: uid() }]),
    removeCatalogItem: (id: string) => setCatalog((p) => p.filter((i) => i.id !== id)),
    // patients
    registerPatient: (d: Omit<Patient, "id" | "uid">) => {
      const p: Patient = { ...d, id: uid(), uid: "PT-" + Math.floor(100000 + Math.random() * 900000) }
      setPatients((prev) => [...prev, p])
      return p
    },
    // billing
    raiseBill: (b: { patientId: string; departmentId: string; lines: BillLine[] }) => {
      const bill: Bill = {
        ...b, id: uid(), total: b.lines.reduce((s, l) => s + l.price * l.qty, 0),
        status: "pending", createdAt: new Date().toISOString(), raisedBy: currentUser?.name ?? "",
      }
      setBills((p) => [bill, ...p])
      return bill // backend: trigger SMS + email alert here
    },
    clearBill: (id: string, paymentRef: string) =>
      setBills((p) => p.map((b) => b.id === id
        ? { ...b, status: "paid", paymentRef, paidAt: new Date().toISOString(), clearedBy: currentUser?.name, receiptNo: "RCP-" + Date.now().toString(36).toUpperCase() }
        : b)), // backend: email receipt here
  }
}

type Store = ReturnType<typeof useStoreState>
const Ctx = createContext<Store | null>(null)
export const StoreProvider = ({ children }: { children: ReactNode }) => <Ctx.Provider value={useStoreState()}>{children}</Ctx.Provider>
export const useStore = () => { const c = useContext(Ctx); if (!c) throw new Error("StoreProvider missing"); return c }
export const naira = (n: number) => "₦" + n.toLocaleString()