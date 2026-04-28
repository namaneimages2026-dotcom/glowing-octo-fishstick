import { Quote, QuoteRequest, SustainabilityOption } from "../types";

const MACHINE_RATE = 350;
const DESIGN_RATE_PER_HOUR = 350;
const RETAIL_MIN = 250;
const B2B_MIN = 500;

const artworkSetupFeeMap: Record<QuoteRequest["artworkStatus"], number> = {
  "Vector ready": 150,
  "Needs cleanup": 220,
  "Needs design from scratch": 350,
  "No artwork": 300
};

const materialRatePer100SqMm: Record<QuoteRequest["material"], number> = {
  MDF: 0.012,
  Plywood: 0.014,
  Acrylic: 0.025,
  Leather: 0.02,
  "Paper/Cardboard": 0.006,
  Fabric: 0.01,
  "Glass engraving": 0.018,
  "Slate engraving": 0.02,
  Metal: 999
};

const urgencyRushFee = (deadline: string): number => {
  const now = new Date();
  const due = new Date(deadline);
  const ms = due.getTime() - now.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  if (days <= 2) return 300;
  if (days <= 5) return 150;
  return 0;
};

const parseDimensions = (dimensionsMm: string): { width: number; height: number } => {
  const matched = dimensionsMm.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
  if (!matched) return { width: 50, height: 50 };
  return { width: Number(matched[1]), height: Number(matched[2]) };
};

const machineMinutesEstimate = (request: QuoteRequest): number => {
  const { width, height } = parseDimensions(request.dimensionsMm);
  const areaFactor = (width * height) / 10000;
  const serviceMultiplier: Record<QuoteRequest["serviceType"], number> = {
    Cutting: 1,
    Engraving: 0.8,
    "Cutting + Engraving": 1.5,
    "Design + Production": 1.6,
    Prototype: 1.8,
    "Retainer Inquiry": 0.5
  };
  const materialMultiplier: Record<QuoteRequest["material"], number> = {
    MDF: 1.2,
    Plywood: 1.3,
    Acrylic: 1.4,
    Leather: 1.1,
    "Paper/Cardboard": 0.7,
    Fabric: 0.9,
    "Glass engraving": 1.6,
    "Slate engraving": 1.7,
    Metal: 5
  };

  const minutes = Math.max(10, areaFactor * request.quantity * serviceMultiplier[request.serviceType] * materialMultiplier[request.material]);
  return Math.round(minutes);
};

const sustainabilityNarrative = (choice: SustainabilityOption): string => {
  if (choice === "Use offcuts where possible") return "Optimized nesting with offcuts prioritized to reduce virgin sheet use.";
  if (choice === "Client supplied material") return "Client-supplied material accepted with process-safe settings and waste reporting.";
  return "New material allocation selected for consistency and color matching.";
};

export function buildQuote(quoteNumber: string, request: QuoteRequest): Quote {
  if (request.material === "Metal") {
    return {
      quoteNumber,
      request,
      estimatedMinutes: 0,
      setupFee: 0,
      machineCost: 0,
      materialEstimate: 0,
      rushFee: 0,
      total: 0,
      deposit: 0,
      balance: 0,
      status: "Draft",
      scopeOfWork: "Unsupported request",
      sustainabilityNote: "Metal processing is not part of Namane Supply's CO2 workflow.",
      validationMessage: "Unsupported material: Namane Supply handles non-metal CO2 laser materials only."
    };
  }

  const setupFee = artworkSetupFeeMap[request.artworkStatus];
  const estimatedMinutes = machineMinutesEstimate(request);
  const machineCost = Number(((estimatedMinutes / 60) * MACHINE_RATE).toFixed(2));

  const { width, height } = parseDimensions(request.dimensionsMm);
  const area = width * height * request.quantity;
  const materialEstimate =
    request.sustainabilityOption === "Client supplied material" ? 0 : Number(((area / 100) * materialRatePer100SqMm[request.material]).toFixed(2));

  const designTimeHours = request.artworkStatus === "Needs design from scratch" ? 1 : request.artworkStatus === "No artwork" ? 0.75 : 0;
  const customDesignFee = Number((designTimeHours * DESIGN_RATE_PER_HOUR).toFixed(2));

  const rushFee = urgencyRushFee(request.deadline);
  const subtotal = setupFee + machineCost + materialEstimate + rushFee + customDesignFee;
  const minimum = request.client.clientType === "Retail" ? RETAIL_MIN : B2B_MIN;
  const total = Number(Math.max(subtotal, minimum).toFixed(2));
  const deposit = Number((total * 0.6).toFixed(2));
  const balance = Number((total - deposit).toFixed(2));

  return {
    quoteNumber,
    request,
    estimatedMinutes,
    setupFee: Number((setupFee + customDesignFee).toFixed(2)),
    machineCost,
    materialEstimate,
    rushFee,
    total,
    deposit,
    balance,
    status: "Draft",
    scopeOfWork: `${request.serviceType} for ${request.productType} (${request.dimensionsMm}) x ${request.quantity}`,
    sustainabilityNote: sustainabilityNarrative(request.sustainabilityOption)
  };
}
