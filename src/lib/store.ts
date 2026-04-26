import { seedItems, seedOrders } from "../data/materials";
import { ScanEvent, Snapshot, SyncOperation, WorkOrder, InventoryItem } from "../types";

const STORAGE_KEY = "namane-supply-os.snapshot.v1";

const now = () => new Date().toISOString();
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const initialState: Snapshot = {
  items: seedItems,
  orders: seedOrders,
  scans: [],
  queue: []
};

export const readSnapshot = (): Snapshot => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;
  try {
    return JSON.parse(raw) as Snapshot;
  } catch {
    return initialState;
  }
};

export const writeSnapshot = (snapshot: Snapshot) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const upsertItem = (snapshot: Snapshot, draft: Omit<InventoryItem, "updatedAt">): Snapshot => {
  const item: InventoryItem = { ...draft, updatedAt: now() };
  const next = snapshot.items.some((i) => i.id === item.id)
    ? snapshot.items.map((i) => (i.id === item.id ? item : i))
    : [...snapshot.items, item];
  const op: SyncOperation = { id: uid(), type: "UPSERT_ITEM", payload: item, createdAt: now() };
  return { ...snapshot, items: next, queue: [...snapshot.queue, op] };
};

export const upsertOrder = (snapshot: Snapshot, order: Omit<WorkOrder, "updatedAt">): Snapshot => {
  const record: WorkOrder = { ...order, updatedAt: now() };
  const next = snapshot.orders.some((o) => o.id === record.id)
    ? snapshot.orders.map((o) => (o.id === record.id ? record : o))
    : [...snapshot.orders, record];
  const op: SyncOperation = { id: uid(), type: "UPSERT_ORDER", payload: record, createdAt: now() };
  return { ...snapshot, orders: next, queue: [...snapshot.queue, op] };
};

export const applyScan = (snapshot: Snapshot, itemId: string, delta: number, source: ScanEvent["source"]): Snapshot => {
  const scan: ScanEvent = { id: uid(), itemId, delta, source, createdAt: now() };
  const items = snapshot.items.map((item) =>
    item.id === itemId ? { ...item, onHand: Math.max(0, item.onHand + delta), updatedAt: now() } : item
  );
  const op: SyncOperation = { id: uid(), type: "ADD_SCAN", payload: scan, createdAt: now() };
  return { ...snapshot, items, scans: [scan, ...snapshot.scans], queue: [...snapshot.queue, op] };
};

export const clearQueue = (snapshot: Snapshot): Snapshot => ({ ...snapshot, queue: [] });
