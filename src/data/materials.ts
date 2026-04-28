import { Job, NamaneMaterial, RetainerPlan, SimulatorScenario, SustainabilityRecord } from "../types";

export const supportedMaterials: NamaneMaterial[] = [
  "MDF",
  "Plywood",
  "Acrylic",
  "Leather",
  "Paper/Cardboard",
  "Fabric",
  "Glass engraving",
  "Slate engraving"
];

export const retainers: RetainerPlan[] = [
  { name: "Starter", monthlyPrice: 4500, productionMinutes: 300, perks: ["Monthly planning call", "Ideal for startups"] },
  { name: "Growth", monthlyPrice: 9000, productionMinutes: 750, perks: ["Priority booking", "Quarterly process review"] },
  {
    name: "Production",
    monthlyPrice: 18000,
    productionMinutes: 1600,
    perks: ["Priority turnaround", "Dedicated production lane", "Ops reporting"]
  }
];

export const seedJobs: Job[] = [
  {
    id: "job-001",
    quoteNumber: "NS-2026-001",
    title: "Leather woven labels for inner-city fashion drop",
    dueDate: "2026-05-03",
    priority: "High",
    clientType: "Fashion Brand",
    material: "Leather",
    quantity: 600,
    estimatedMinutes: 420,
    depositStatus: "Paid",
    balanceStatus: "Pending",
    status: "In Production",
    sustainabilityUsed: true
  },
  {
    id: "job-002",
    quoteNumber: "NS-2026-002",
    title: "Acrylic reception signage for creative agency",
    dueDate: "2026-05-08",
    priority: "Medium",
    clientType: "Corporate",
    material: "Acrylic",
    quantity: 4,
    estimatedMinutes: 180,
    depositStatus: "Paid",
    balanceStatus: "Pending",
    status: "Production Queued",
    sustainabilityUsed: false
  },
  {
    id: "job-003",
    quoteNumber: "NS-2026-003",
    title: "MDF illuminated market stall fascia",
    dueDate: "2026-05-12",
    priority: "High",
    clientType: "B2B",
    material: "MDF",
    quantity: 2,
    estimatedMinutes: 300,
    depositStatus: "Pending",
    balanceStatus: "Pending",
    status: "Deposit Required",
    sustainabilityUsed: true
  },
  {
    id: "job-004",
    quoteNumber: "NS-2026-004",
    title: "Corporate gifting batch with branded offcut coasters",
    dueDate: "2026-05-20",
    priority: "Low",
    clientType: "Corporate",
    material: "Slate engraving",
    quantity: 80,
    estimatedMinutes: 240,
    depositStatus: "Paid",
    balanceStatus: "Pending",
    status: "Quality Check",
    sustainabilityUsed: true
  },
  {
    id: "job-005",
    quoteNumber: "NS-2026-005",
    title: "School CO2 laser learning session kits",
    dueDate: "2026-05-22",
    priority: "Medium",
    clientType: "School",
    material: "Paper/Cardboard",
    quantity: 120,
    estimatedMinutes: 110,
    depositStatus: "Pending",
    balanceStatus: "Pending",
    status: "Quote Sent",
    sustainabilityUsed: true
  }
];

export const sustainabilitySeed: SustainabilityRecord[] = [
  {
    id: "sus-001",
    jobId: "job-001",
    materialSource: "Offcut",
    materialType: "Leather",
    estimatedWastePercent: 9,
    offcutsGeneratedKg: 1.4,
    offcutsReusedKg: 1.1,
    wasteDivertedPercent: 79,
    storytellingNotes: "Used mixed-tone leather offcuts to build patch packs for secondary branding placement."
  },
  {
    id: "sus-002",
    jobId: "job-004",
    materialSource: "Reclaimed",
    materialType: "Slate engraving",
    estimatedWastePercent: 6,
    offcutsGeneratedKg: 0.8,
    offcutsReusedKg: 0.5,
    wasteDivertedPercent: 62,
    storytellingNotes: "Reclaimed slate tiles converted into premium gift coaster sets with minimal trim loss."
  }
];

export const simulatorQuests: SimulatorScenario[] = [
  { id: "quest-1", title: "Quote leather tags", goal: "Price a 500-unit leather tag run with setup + machine time + deposit." },
  { id: "quest-2", title: "Fix MDF not cutting through", goal: "Increase passes or power, reduce speed, and check focus/air assist." },
  { id: "quest-3", title: "Reduce acrylic melting", goal: "Lower power, increase speed, and keep air assist enabled." },
  { id: "quest-4", title: "Improve leather engraving contrast", goal: "Tune power and speed balance to prevent overburn." },
  { id: "quest-5", title: "Sustainable small batch", goal: "Select offcuts/reclaimed source with low waste for 30-unit order." }
];
