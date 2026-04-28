import { FormEvent, useMemo, useState } from "react";
import { buildQuote } from "./engine/quoteEngine";
import { integrationPlaceholders } from "./connectors";
import { retainers, seedJobs, simulatorQuests, supportedMaterials, sustainabilitySeed } from "./data/materials";
import {
  ArtworkStatus,
  ClientType,
  DeliveryOption,
  Job,
  NamaneMaterial,
  ProductType,
  Quote,
  QuoteRequest,
  ServiceType,
  SustainabilityOption,
  SustainabilityRecord,
  WorkflowStatus
} from "./types";
import "./styles.css";

const pages = ["Home", "Services", "Materials", "Sustainability", "Education", "Quote Request", "B2B Retainers", "Portfolio", "Contact", "Operations"] as const;

const workflowSteps: WorkflowStatus[] = [
  "New Request",
  "Quote Drafted",
  "Quote Sent",
  "Client Approved",
  "Deposit Required",
  "Deposit Paid",
  "Production Queued",
  "In Production",
  "Quality Check",
  "Ready for Collection/Delivery",
  "Completed",
  "Follow-up Sent"
];

const quoteStatuses: Quote["status"][] = ["Draft", "Sent", "Approved", "Deposit Paid", "In Production", "Ready", "Collected/Delivered"];

const materialOptions: NamaneMaterial[] = [...supportedMaterials, "Metal"];

const defaultForm = {
  clientName: "",
  businessName: "",
  whatsapp: "",
  email: "",
  clientType: "Retail" as ClientType,
  serviceType: "Cutting" as ServiceType,
  productType: "Leather tags" as ProductType,
  material: "Leather" as NamaneMaterial,
  thicknessOrGsm: "2mm",
  dimensionsMm: "80x40",
  quantity: 50,
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
  artworkStatus: "Vector ready" as ArtworkStatus,
  specialNotes: "",
  sustainabilityOption: "Use offcuts where possible" as SustainabilityOption,
  deliveryOption: "Collection" as DeliveryOption
};

type SimResult = { result: string; quality: number; safety: number; waste: number; cost: number; warning?: string };

const simulateLaser = (material: NamaneMaterial, power: number, speed: number, passes: number, focusOffset: number, airAssist: boolean): SimResult => {
  if (material === "Metal") return { result: "Unsafe/unsupported", quality: 0, safety: 0, waste: 100, cost: 100, warning: "CO2 workflow does not process metals." };
  const score = power * 0.8 + (120 - speed) * 0.6 + passes * 12 - Math.abs(focusOffset) * 8 + (airAssist ? 10 : -10);
  const quality = Math.max(5, Math.min(100, Math.round(score)));
  const safety = Math.max(10, Math.min(100, Math.round((airAssist ? 70 : 45) + (material === "Acrylic" ? -5 : 5) - Math.abs(focusOffset) * 5)));
  const waste = Math.max(5, Math.min(100, Math.round(100 - quality + (material === "Acrylic" && power > 70 ? 20 : 0))));
  const cost = Math.max(20, Math.min(100, Math.round((power + passes * 8 + (speed < 20 ? 25 : 0)) / 1.5)));

  let result = "Clean cut";
  if (material.includes("engraving") && passes >= 1) result = "Engrave only";
  if (quality < 35) result = "Not cut through";
  if (power > 85 && speed < 18) result = material === "Acrylic" ? "Melted edge" : "Excess burn";
  if (material === "MDF" && !airAssist) result = "Charring";

  return { result, quality, safety, waste, cost };
};

export default function App() {
  const [activePage, setActivePage] = useState<(typeof pages)[number]>("Home");
  const [form, setForm] = useState(defaultForm);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [sustainabilityRecords, setSustainabilityRecords] = useState<SustainabilityRecord[]>(sustainabilitySeed);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("New Request");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [integrationLog, setIntegrationLog] = useState("No automation action triggered yet.");

  const [simMaterial, setSimMaterial] = useState<NamaneMaterial>("MDF");
  const [simPower, setSimPower] = useState(60);
  const [simSpeed, setSimSpeed] = useState(24);
  const [simPasses, setSimPasses] = useState(1);
  const [simFocus, setSimFocus] = useState(0);
  const [simAir, setSimAir] = useState(true);

  const sim = useMemo(() => simulateLaser(simMaterial, simPower, simSpeed, simPasses, simFocus, simAir), [simMaterial, simPower, simSpeed, simPasses, simFocus, simAir]);

  const groupedJobs = useMemo(() => {
    const columns: WorkflowStatus[] = ["Deposit Required", "Production Queued", "In Production", "Quality Check", "Ready for Collection/Delivery", "Completed"];
    return columns.map((status) => ({ status, items: jobs.filter((job) => job.status === status) }));
  }, [jobs]);

  const handleQuoteSubmit = (event: FormEvent) => {
    event.preventDefault();
    const request: QuoteRequest = {
      id: `qr-${crypto.randomUUID().slice(0, 8)}`,
      client: {
        id: `cl-${crypto.randomUUID().slice(0, 8)}`,
        name: form.clientName,
        businessName: form.businessName,
        whatsapp: form.whatsapp,
        email: form.email,
        clientType: form.clientType
      },
      serviceType: form.serviceType,
      productType: form.productType,
      material: form.material,
      thicknessOrGsm: form.thicknessOrGsm,
      dimensionsMm: form.dimensionsMm,
      quantity: Number(form.quantity),
      deadline: form.deadline,
      artworkStatus: form.artworkStatus,
      specialNotes: form.specialNotes,
      sustainabilityOption: form.sustainabilityOption,
      deliveryOption: form.deliveryOption
    };

    const quoteNumber = `NS-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, "0")}`;
    const quote = buildQuote(quoteNumber, request);
    setQuotes((prev) => [quote, ...prev]);
    setSelectedQuote(quote);
    setWorkflowStatus("Quote Drafted");

    if (!quote.validationMessage) {
      const nextJob: Job = {
        id: `job-${crypto.randomUUID().slice(0, 7)}`,
        quoteNumber,
        title: `${request.productType} for ${request.client.businessName || request.client.name}`,
        dueDate: request.deadline,
        priority: quote.rushFee > 0 ? "High" : "Medium",
        clientType: request.client.clientType,
        material: request.material,
        quantity: request.quantity,
        estimatedMinutes: quote.estimatedMinutes,
        depositStatus: "Pending",
        balanceStatus: "Pending",
        status: "Deposit Required",
        sustainabilityUsed: request.sustainabilityOption === "Use offcuts where possible"
      };
      setJobs((prev) => [nextJob, ...prev]);
      setSustainabilityRecords((prev) => [
        {
          id: `sus-${crypto.randomUUID().slice(0, 8)}`,
          jobId: nextJob.id,
          materialSource:
            request.sustainabilityOption === "Use offcuts where possible"
              ? "Offcut"
              : request.sustainabilityOption === "Client supplied material"
                ? "Client supplied"
                : "New sheet",
          materialType: request.material,
          estimatedWastePercent: request.sustainabilityOption === "Use offcuts where possible" ? 9 : 18,
          offcutsGeneratedKg: 0.6,
          offcutsReusedKg: request.sustainabilityOption === "Use offcuts where possible" ? 0.45 : 0.12,
          wasteDivertedPercent: request.sustainabilityOption === "Use offcuts where possible" ? 75 : 22,
          storytellingNotes: request.specialNotes || "Captured from quote intake notes."
        },
        ...prev
      ]);
    }
  };

  const runIntegration = async (action: keyof typeof integrationPlaceholders) => {
    if (!selectedQuote) return;
    const res = await integrationPlaceholders[action](selectedQuote as never);
    setIntegrationLog(res);
  };

  const updateJobStatus = (jobId: string, status: WorkflowStatus) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
  };

  return (
    <main className="shell">
      <header className="hero">
        <p className="pill">Namane Supply · Johannesburg · CO2 Laser Studio</p>
        <h1>Supplying the streets with precision fabrication.</h1>
        <p>
          CO2 laser cutting + engraving partner for fashion brands, signage teams, events, and lean manufacturing runs. Non-metal workflow only,
          with disciplined sustainability tracking.
        </p>
      </header>

      <nav className="topNav" aria-label="Primary pages">
        {pages.map((page) => (
          <button key={page} onClick={() => setActivePage(page)} className={activePage === page ? "active" : ""}>
            {page}
          </button>
        ))}
      </nav>

      <section className="panel">
        {activePage === "Home" && <Home />}
        {activePage === "Services" && <Services />}
        {activePage === "Materials" && <Materials />}
        {activePage === "Sustainability" && <Sustainability records={sustainabilityRecords} />}
        {activePage === "Education" && (
          <Education
            material={simMaterial}
            setMaterial={setSimMaterial}
            power={simPower}
            setPower={setSimPower}
            speed={simSpeed}
            setSpeed={setSimSpeed}
            passes={simPasses}
            setPasses={setSimPasses}
            focus={simFocus}
            setFocus={setSimFocus}
            air={simAir}
            setAir={setSimAir}
            sim={sim}
          />
        )}
        {activePage === "Quote Request" && (
          <QuoteRequestPage
            form={form}
            setForm={setForm}
            onSubmit={handleQuoteSubmit}
            selectedQuote={selectedQuote}
            workflowStatus={workflowStatus}
            setWorkflowStatus={setWorkflowStatus}
            runIntegration={runIntegration}
            integrationLog={integrationLog}
          />
        )}
        {activePage === "B2B Retainers" && <RetainersPage />}
        {activePage === "Portfolio" && <Portfolio />}
        {activePage === "Contact" && <Contact />}
        {activePage === "Operations" && <Operations jobs={jobs} groupedJobs={groupedJobs} updateJobStatus={updateJobStatus} quotes={quotes} />}
      </section>
    </main>
  );
}

function Home() {
  return <div className="stack"><h2>Namane Supply Operating System</h2><p>From quote request to deposit, production, dispatch, and follow-up in one workflow.</p></div>;
}
function Services() {
  return <div className="stack"><h2>Services</h2><ul><li>CO2 laser cutting and engraving</li><li>Leather labels, tags, and patches</li><li>Signage and branding fabrication</li><li>Corporate gifts + short-run manufacturing</li></ul></div>;
}
function Materials() {
  return <div className="stack"><h2>Materials</h2><p>Supported: MDF, plywood, acrylic, leather, paper/cardboard, fabric, glass engraving, slate engraving.</p><p>Not supported: metal cutting, fiber laser, CNC routing, UV printing.</p></div>;
}
function Sustainability({ records }: { records: SustainabilityRecord[] }) {
  return (
    <div className="stack">
      <h2>Sustainability Workflow</h2>
      <p>Digital-first prototyping, efficient nesting, offcut reuse, local small-batch manufacturing, and transparent scrap tracking.</p>
      <p className="muted">Reality check: CO2 cutting uses electricity, extraction is required for fumes, and acrylic must be used responsibly.</p>
      <div className="grid">
        {records.map((record) => (
          <article key={record.id} className="card">
            <h3>{record.materialType}</h3>
            <p>Source: {record.materialSource}</p>
            <p>Waste estimate: {record.estimatedWastePercent}%</p>
            <p>Offcuts reused: {record.offcutsReusedKg}kg</p>
            <p>Waste diverted: {record.wasteDivertedPercent}%</p>
          </article>
        ))}
      </div>
    </div>
  );
}
function Education(props: {
  material: NamaneMaterial;
  setMaterial: (material: NamaneMaterial) => void;
  power: number;
  setPower: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  passes: number;
  setPasses: (value: number) => void;
  focus: number;
  setFocus: (value: number) => void;
  air: boolean;
  setAir: (value: boolean) => void;
  sim: SimResult;
}) {
  return (
    <div className="stack">
      <h2>CO2 Laser Education Simulator</h2>
      <p>Learn why power, speed, focus, passes, air assist, and extraction control quality/safety.</p>
      <div className="form twoCol">
        <label>Material<select value={props.material} onChange={(e) => props.setMaterial(e.target.value as NamaneMaterial)}>{materialOptions.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>Power %<input type="range" min={10} max={100} value={props.power} onChange={(e) => props.setPower(Number(e.target.value))} /></label>
        <label>Speed mm/s<input type="range" min={5} max={120} value={props.speed} onChange={(e) => props.setSpeed(Number(e.target.value))} /></label>
        <label>Passes<input type="number" min={1} max={6} value={props.passes} onChange={(e) => props.setPasses(Number(e.target.value))} /></label>
        <label>Focus offset mm<input type="number" min={-5} max={5} value={props.focus} onChange={(e) => props.setFocus(Number(e.target.value))} /></label>
        <label className="check">Air assist<input type="checkbox" checked={props.air} onChange={(e) => props.setAir(e.target.checked)} /></label>
      </div>
      <article className="card result">
        <strong>Predicted result: {props.sim.result}</strong>
        <p>Cut quality: {props.sim.quality}/100</p>
        <p>Safety: {props.sim.safety}/100</p>
        <p>Waste level: {props.sim.waste}/100</p>
        <p>Production cost score: {props.sim.cost}/100</p>
        {props.sim.warning && <p className="error">{props.sim.warning}</p>}
      </article>
      <h3>Training Quests</h3>
      <ul>{simulatorQuests.map((q) => <li key={q.id}><strong>{q.title}</strong>: {q.goal}</li>)}</ul>
    </div>
  );
}

function QuoteRequestPage({
  form,
  setForm,
  onSubmit,
  selectedQuote,
  workflowStatus,
  setWorkflowStatus,
  runIntegration,
  integrationLog
}: {
  form: typeof defaultForm;
  setForm: (next: typeof defaultForm) => void;
  onSubmit: (event: FormEvent) => void;
  selectedQuote: Quote | null;
  workflowStatus: WorkflowStatus;
  setWorkflowStatus: (status: WorkflowStatus) => void;
  runIntegration: (key: keyof typeof integrationPlaceholders) => void;
  integrationLog: string;
}) {
  return (
    <div className="stack">
      <h2>Quote Request</h2>
      <form className="form quoteForm" onSubmit={onSubmit}>
        <label>Client name<input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></label>
        <label>Business name<input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
        <label>WhatsApp number<input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
        <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Client type<select value={form.clientType} onChange={(e) => setForm({ ...form, clientType: e.target.value as ClientType })}>{["Retail", "B2B", "Corporate", "Fashion Brand", "Event", "School", "Other"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Service type<select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as ServiceType })}>{["Cutting", "Engraving", "Cutting + Engraving", "Design + Production", "Prototype", "Retainer Inquiry"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Product type<select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value as ProductType })}>{["Leather tags", "Patches", "Acrylic signage", "MDF signage", "Gifts", "Packaging", "Stencil", "Educational project", "Other"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Material<select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value as NamaneMaterial })}>{materialOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Thickness/GSM<input value={form.thicknessOrGsm} onChange={(e) => setForm({ ...form, thicknessOrGsm: e.target.value })} /></label>
        <label>Dimensions mm<input value={form.dimensionsMm} onChange={(e) => setForm({ ...form, dimensionsMm: e.target.value })} /></label>
        <label>Quantity<input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></label>
        <label>Deadline<input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
        <label>Artwork status<select value={form.artworkStatus} onChange={(e) => setForm({ ...form, artworkStatus: e.target.value as ArtworkStatus })}>{["Vector ready", "Needs cleanup", "Needs design from scratch", "No artwork"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>File upload placeholder<input placeholder="Upload coming soon" disabled /></label>
        <label>Special notes<textarea value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} /></label>
        <label>Sustainability option<select value={form.sustainabilityOption} onChange={(e) => setForm({ ...form, sustainabilityOption: e.target.value as SustainabilityOption })}>{["Use offcuts where possible", "New material only", "Client supplied material"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Delivery option<select value={form.deliveryOption} onChange={(e) => setForm({ ...form, deliveryOption: e.target.value as DeliveryOption })}>{["Collection", "Courier", "Local delivery"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <button type="submit">Generate internal quote draft</button>
      </form>

      {selectedQuote ? (
        <article className="card">
          <h3>Quote {selectedQuote.quoteNumber}</h3>
          {selectedQuote.validationMessage ? (
            <p className="error">{selectedQuote.validationMessage}</p>
          ) : (
            <>
              <p>Client: {selectedQuote.request.client.name} ({selectedQuote.request.client.clientType})</p>
              <p>Scope: {selectedQuote.scopeOfWork}</p>
              <p>Material: {selectedQuote.request.material}</p>
              <p>Qty: {selectedQuote.request.quantity}</p>
              <p>Setup/design fee: R{selectedQuote.setupFee.toFixed(2)}</p>
              <p>Machine time: {selectedQuote.estimatedMinutes} min (R{selectedQuote.machineCost.toFixed(2)})</p>
              <p>Material estimate: R{selectedQuote.materialEstimate.toFixed(2)}</p>
              <p>Rush fee: R{selectedQuote.rushFee.toFixed(2)}</p>
              <p>Sustainability: {selectedQuote.sustainabilityNote}</p>
              <p>Total: <strong>R{selectedQuote.total.toFixed(2)}</strong></p>
              <p>60% deposit: <strong>R{selectedQuote.deposit.toFixed(2)}</strong></p>
              <p>Balance due: R{selectedQuote.balance.toFixed(2)}</p>
              <p>Terms: Production starts after 60% deposit + artwork approval. Final balance before collection/delivery. Non-metal materials only.</p>
            </>
          )}
        </article>
      ) : (
        <p className="muted">No quote drafted yet.</p>
      )}

      <h3>Client Approval Workflow</h3>
      <p>Current status: <strong>{workflowStatus}</strong></p>
      <div className="rowWrap">{workflowSteps.map((step) => <button key={step} className={workflowStatus === step ? "active" : ""} onClick={() => setWorkflowStatus(step)}>{step}</button>)}</div>
      <div className="rowWrap">{quoteStatuses.map((st) => <span key={st} className="chip">Quote status: {st}</span>)}</div>

      <h3>Automation placeholders</h3>
      <div className="rowWrap">
        <button onClick={() => runIntegration("sendQuoteEmail")}>Send quote email — coming soon</button>
        <button onClick={() => runIntegration("sendWhatsAppReminder")}>Send WhatsApp reminder — coming soon</button>
        <button onClick={() => runIntegration("bookProductionSlot")}>Book production slot — coming soon</button>
        <button onClick={() => runIntegration("uploadArtworkProof")}>Store proof file — coming soon</button>
        <button onClick={() => runIntegration("trackDepositPayment")}>Track deposit — coming soon</button>
        <button onClick={() => runIntegration("createDevTask")}>Create dev task — coming soon</button>
      </div>
      <p className="muted">{integrationLog}</p>
    </div>
  );
}

function RetainersPage() {
  return <div className="grid">{retainers.map((plan) => <article key={plan.name} className="card"><h3>{plan.name}</h3><p>R{plan.monthlyPrice.toLocaleString()}/month</p><p>{plan.productionMinutes} production minutes</p><ul>{plan.perks.map((perk) => <li key={perk}>{perk}</li>)}</ul></article>)}</div>;
}
function Portfolio() {
  return <div className="stack"><h2>Portfolio / Case Studies</h2><ul><li>Fashion leather tag rollout with repeatable files</li><li>Acrylic wayfinding signage set for agency HQ</li><li>MDF illuminated branding fabrication</li><li>Offcut-based corporate gifting program</li><li>School-friendly CO2 educational prototype packs</li></ul></div>;
}
function Contact() {
  return <div className="stack"><h2>Contact</h2><p>Johannesburg, South Africa</p><p>Email: studio@namanesupply.example</p><p>WhatsApp: +27 00 000 0000</p></div>;
}

function Operations({ jobs, groupedJobs, updateJobStatus, quotes }: { jobs: Job[]; groupedJobs: { status: WorkflowStatus; items: Job[] }[]; updateJobStatus: (jobId: string, status: WorkflowStatus) => void; quotes: Quote[] }) {
  return (
    <div className="stack">
      <h2>Production Dashboard</h2>
      <p>{jobs.length} active/seeded jobs.</p>
      <div className="kanban">{groupedJobs.map((col) => <section key={col.status} className="column"><h3>{col.status}</h3>{col.items.length === 0 ? <p className="muted">No jobs in this column.</p> : col.items.map((job) => <article className="card" key={job.id}><strong>{job.quoteNumber}</strong><p>{job.title}</p><p>Due: {job.dueDate} • Priority: {job.priority}</p><p>{job.clientType} • {job.material} • Qty {job.quantity}</p><p>Est minutes: {job.estimatedMinutes}</p><p>Deposit: {job.depositStatus} • Balance: {job.balanceStatus}</p>{job.sustainabilityUsed && <span className="badge">♻ sustainability tracked</span>}<select value={job.status} onChange={(e) => updateJobStatus(job.id, e.target.value as WorkflowStatus)}>{workflowSteps.map((s) => <option key={s}>{s}</option>)}</select></article>)}</section>)}</div>
      <h3>Quote Registry</h3>
      {quotes.length === 0 ? <p className="muted">No generated quotes yet.</p> : <div className="grid">{quotes.map((q) => <article key={q.quoteNumber} className="card"><strong>{q.quoteNumber}</strong><p>{q.request.client.name}</p><p>{q.request.productType}</p><p>Total R{q.total.toFixed(2)}</p></article>)}</div>}
    </div>
  );
}
