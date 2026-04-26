export type EntityId = string;

export type InventoryItem = {
  id: EntityId;
  sku: string;
  name: string;
  unit: "pcs" | "m" | "sheet" | "kg";
  onHand: number;
  reorderPoint: number;
  updatedAt: string;
};

export type WorkOrder = {
  id: EntityId;
  code: string;
  client: string;
  itemId: EntityId;
  quantity: number;
  dueDate: string;
  status: "queued" | "in_progress" | "done";
  updatedAt: string;
};

export type ScanEvent = {
  id: EntityId;
  itemId: EntityId;
  delta: number;
  source: "qr_scan" | "manual";
  createdAt: string;
};

export type SyncOperation = {
  id: EntityId;
  type: "UPSERT_ITEM" | "UPSERT_ORDER" | "ADD_SCAN";
  payload: unknown;
  createdAt: string;
};

export type Snapshot = {
  items: InventoryItem[];
  orders: WorkOrder[];
  scans: ScanEvent[];
  queue: SyncOperation[];
};

export type Connector = {
  key: string;
  label: string;
  send: (ops: SyncOperation[]) => Promise<{ sent: number; remoteRef: string }>;
};
