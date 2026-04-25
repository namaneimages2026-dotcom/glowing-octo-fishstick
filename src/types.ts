export type Route = "home" | "services" | "products" | "materials" | "quote" | "laser" | "education" | "internships" | "dashboard" | "admin" | "contact";

export type Material = {
  name: string;
  thickness: string;
  cut: boolean;
  engrave: boolean;
  power: [number, number];
  speed: [number, number];
  risks: string[];
};

export type Job = {
  title: string;
  client: string;
  material: string;
  qty: number;
  deadline: string;
  budget: [number, number];
};

export type SimulationResult = {
  status: string;
  feedback: string;
  score: number;
};

export type QuoteRequest = {
  id: string;
  clientName: string;
  whatsapp: string;
  service: string;
  material: string;
  size: string;
  quantity: number;
  deadline: string;
  notes: string;
  estimate: number;
  status: "New" | "Quoted" | "Approved" | "In Production" | "Completed";
};
