export type ClientType = "Retail" | "B2B" | "Corporate" | "Fashion Brand" | "Event" | "School" | "Other";

export type ServiceType =
  | "Cutting"
  | "Engraving"
  | "Cutting + Engraving"
  | "Design + Production"
  | "Prototype"
  | "Retainer Inquiry";

export type ProductType =
  | "Leather tags"
  | "Patches"
  | "Acrylic signage"
  | "MDF signage"
  | "Gifts"
  | "Packaging"
  | "Stencil"
  | "Educational project"
  | "Other";

export type ArtworkStatus = "Vector ready" | "Needs cleanup" | "Needs design from scratch" | "No artwork";
export type SustainabilityOption = "Use offcuts where possible" | "New material only" | "Client supplied material";
export type DeliveryOption = "Collection" | "Courier" | "Local delivery";

export type NamaneMaterial =
  | "MDF"
  | "Plywood"
  | "Acrylic"
  | "Leather"
  | "Paper/Cardboard"
  | "Fabric"
  | "Glass engraving"
  | "Slate engraving"
  | "Metal";

export type QuoteStatus = "Draft" | "Sent" | "Approved" | "Deposit Paid" | "In Production" | "Ready" | "Collected/Delivered";

export type WorkflowStatus =
  | "New Request"
  | "Quote Drafted"
  | "Quote Sent"
  | "Client Approved"
  | "Deposit Required"
  | "Deposit Paid"
  | "Production Queued"
  | "In Production"
  | "Quality Check"
  | "Ready for Collection/Delivery"
  | "Completed"
  | "Follow-up Sent";

export type Client = {
  id: string;
  name: string;
  businessName: string;
  whatsapp: string;
  email: string;
  clientType: ClientType;
};

export type QuoteRequest = {
  id: string;
  client: Client;
  serviceType: ServiceType;
  productType: ProductType;
  material: NamaneMaterial;
  thicknessOrGsm: string;
  dimensionsMm: string;
  quantity: number;
  deadline: string;
  artworkStatus: ArtworkStatus;
  specialNotes: string;
  sustainabilityOption: SustainabilityOption;
  deliveryOption: DeliveryOption;
};

export type Quote = {
  quoteNumber: string;
  request: QuoteRequest;
  estimatedMinutes: number;
  setupFee: number;
  machineCost: number;
  materialEstimate: number;
  rushFee: number;
  total: number;
  deposit: number;
  balance: number;
  status: QuoteStatus;
  sustainabilityNote: string;
  scopeOfWork: string;
  validationMessage?: string;
};

export type Job = {
  id: string;
  quoteNumber: string;
  title: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  clientType: ClientType;
  material: NamaneMaterial;
  quantity: number;
  estimatedMinutes: number;
  depositStatus: "Pending" | "Paid";
  balanceStatus: "Pending" | "Paid";
  status: WorkflowStatus;
  sustainabilityUsed: boolean;
};

export type SustainabilityRecord = {
  id: string;
  jobId: string;
  materialSource: "New sheet" | "Offcut" | "Client supplied" | "Reclaimed";
  materialType: NamaneMaterial;
  estimatedWastePercent: number;
  offcutsGeneratedKg: number;
  offcutsReusedKg: number;
  wasteDivertedPercent: number;
  storytellingNotes: string;
};

export type RetainerPlan = {
  name: "Starter" | "Growth" | "Production";
  monthlyPrice: number;
  productionMinutes: number;
  perks: string[];
};

export type SimulatorScenario = {
  id: string;
  title: string;
  goal: string;
};
