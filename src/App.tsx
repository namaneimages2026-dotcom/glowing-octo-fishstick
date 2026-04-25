import { useMemo, useState } from "react";
import "./styles.css";

type Route = "home" | "services" | "products" | "materials" | "quote" | "laser" | "education" | "internships" | "dashboard" | "admin" | "contact";
type Material = { name: string; thickness: string; cut: boolean; engrave: boolean; power: [number, number]; speed: [number, number]; risks: string[] };
type Job = { title: string; client: string; material: string; qty: number; deadline: string; budget: [number, number] };

const materials: Material[] = [
  { name: "3mm MDF", thickness: "3mm", cut: true, engrave: true, power: [55, 70], speed: [16, 25], risks: ["charring", "smoke staining", "incomplete cut"] },
  { name: "6mm MDF", thickness: "6mm", cut: true, engrave: true, power: [70, 90], speed: [8, 14], risks: ["multiple passes", "edge burn"] },
  { name: "3mm Acrylic", thickness: "3mm", cut: true, engrave: true, power: [60, 78], speed: [10, 18], risks: ["melting", "warping", "flame polish inconsistency"] },
  { name: "Genuine Leather", thickness: "1.5-3mm", cut: true, engrave: true, power: [28, 45], speed: [35, 55], risks: ["over-burning", "smell", "shrinkage"] },
  { name: "Glass", thickness: "engrave only", cut: false, engrave: true, power: [18, 35], speed: [60, 85], risks: ["micro cracking", "cannot cut"] },
  { name: "Metal", thickness: "not supported", cut: false, engrave: false, power: [0, 0], speed: [0, 0], risks: ["Namane Supply does not offer metal cutting"] }
];

const jobs: Job[] = [
  { title: "100 leather tags", client: "Fashion brand", material: "Genuine Leather", qty: 100, deadline: "3 days", budget: [900, 1600] },
  { title: "Acrylic reception sign", client: "Office client", material: "3mm Acrylic", qty: 1, deadline: "5 days", budget: [650, 1800] },
  { title: "MDF wall signage", client: "Restaurant", material: "3mm MDF", qty: 1, deadline: "7 days", budget: [1200, 4500] },
  { title: "Corporate keyrings", client: "Activation agency", material: "3mm MDF", qty: 200, deadline: "4 days", budget: [1800, 4000] }
];

const modules = ["CO₂ laser safety", "Machine components", "Materials behavior", "Power, speed and passes", "File preparation", "Troubleshooting", "Maintenance", "Quoting real jobs"];

function quoteTotal(qty: number, materialCost: number, machineMinutes: number, setupFee: number, margin: number) {
  const machine = (machineMinutes / 60) * 350;
  const labour = Math.max(150, machineMinutes * 3.5);
  const subtotal = materialCost + machine + labour + setupFee;
  return Math.max(250, Math.round(subtotal * (1 + margin / 100)));
}

function simulate(material: Material, power: number, speed: number, passes: number, mirror: number, lens: number, cooling: number, air: boolean) {
  if (!material.cut && !material.engrave) return { status: "Rejected", feedback: "This material is not supported by Namane Supply. No metal cutting, fiber laser, CNC routing, or UV printing.", score: 0 };
  if (!material.cut && passes > 0) return { status: "Failed", feedback: `${material.name} can be engraved but not cut on this CO₂ workflow.`, score: 20 };
  const effectivePower = power * (mirror / 100) * (lens / 100) * (cooling > 26 ? 0.85 : 1);
  let score = 100;
  let feedback: string[] = [];
  if (effectivePower < material.power[0]) { score -= 35; feedback.push("Power is too low after machine losses: incomplete cut risk."); }
  if (effectivePower > material.power[1]) { score -= 25; feedback.push("Power is too high: burn, melt, or over-engraving risk."); }
  if (speed < material.speed[0]) { score -= 18; feedback.push("Speed is too slow: excessive heat buildup."); }
  if (speed > material.speed[1]) { score -= 25; feedback.push("Speed is too fast: weak cut or light engraving."); }
  if (!air) { score -= 15; feedback.push("Air assist is off: smoke staining and fire risk increase."); }
  if (mirror < 60 || lens < 60) { score -= 15; feedback.push("Optics need cleaning before production."); }
  if (cooling > 28) { score -= 20; feedback.push("Cooling temperature is high: protect the tube."); }
  if (passes > 2) { score -= 10; feedback.push("Too many passes can char edges and slow production."); }
  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? "Clean production result" : score >= 55 ? "Usable but needs adjustment" : "Failed production result";
  return { status, feedback: feedback.length ? feedback.join(" ") : "Settings are inside a realistic beginner-safe window.", score };
}

function Nav({ route, setRoute }: { route: Route; setRoute: (r: Route) => void }) {
  const links: Route[] = ["home", "services", "products", "materials", "quote", "laser", "education", "internships", "dashboard", "admin", "contact"];
  return <header className="nav"><button className="brand" onClick={() => setRoute("home")}>NAMANE SUPPLY</button><nav>{links.map(l => <button key={l} className={route === l ? "active" : ""} onClick={() => setRoute(l)}>{l}</button>)}</nav></header>;
}
function Home({ setRoute }: { setRoute: (r: Route) => void }) { return <><section className="hero"><p className="kicker">Supplying the streets · Johannesburg CO₂ laser studio</p><h1>Precision-made branding, fabrication and laser training.</h1><p>Namane Supply combines non-metal CO₂ laser cutting, engraving, education, internships and a virtual Laser Lab for operator training.</p><div className="actions"><button onClick={() => setRoute("quote")}>Get a quote</button><button onClick={() => setRoute("laser")}>Enter Laser Lab</button></div></section><section className="section grid"><Card title="Business website" text="Leather tags, acrylic signage, MDF products, prototyping and short-run manufacturing."/><Card title="Education hub" text="Structured modules for laser safety, materials, machine care, quoting and workflow."/><Card title="Simulation game" text="Practice jobs, settings, maintenance and quoting before touching a real machine."/></section></>; }
function Card({ title, text }: { title: string; text: string }) { return <div className="card"><h3>{title}</h3><p className="muted">{text}</p></div>; }
function Services(){ const s=["Leather tags & patches","Acrylic signage & displays","MDF / wood signage","Fabric engraving","Prototype support","Short-run manufacturing"]; return <section className="section"><h2>Services</h2><div className="grid">{s.map(x=><Card key={x} title={x} text="Includes material guidance, vector file prep, production notes and quote handoff."/>)}</div></section>; }
function Products(){ const p=["Fashion brands","Corporate gifting","Events","Retail branding","Makers","Schools","Signage clients","Manufacturers"]; return <section className="section"><h2>Markets</h2><div className="grid">{p.map(x=><Card key={x} title={x} text="Suggested packages and repeatable production workflows for this market."/>)}</div></section>; }
function Materials(){ return <section className="section"><h2>Materials database</h2><div className="grid">{materials.map(m=><div className="card" key={m.name}><h3>{m.name}</h3><p>{m.thickness}</p><p className="muted">Cut: {m.cut ? "Yes" : "No"} · Engrave: {m.engrave ? "Yes" : "No"}</p><p className="muted">Power {m.power[0]}–{m.power[1]} · Speed {m.speed[0]}–{m.speed[1]}</p>{m.risks.map(r=><span className="pill" key={r}>{r}</span>)}</div>)}</div></section>; }
function Quote(){ const [qty,setQty]=useState(100),[mat,setMat]=useState(550),[min,setMin]=useState(90),[setup,setSetup]=useState(250),[margin,setMargin]=useState(35); const total=quoteTotal(qty,mat,min,setup,margin); const unit=Math.round(total/qty); return <section className="section split"><div><h2>Quote system</h2><Field label="Quantity" value={qty} set={setQty}/><Field label="Material cost" value={mat} set={setMat}/><Field label="Machine minutes" value={min} set={setMin}/><Field label="Setup fee" value={setup} set={setSetup}/><Field label="Margin %" value={margin} set={setMargin}/></div><div className="card"><p className="kicker">Estimate</p><div className="stat">R{total}</div><p>Approx unit price: R{unit}</p><p className="muted">Uses R350/hr machine time, setup/design fee and minimum job logic.</p><p className={total < 500 ? "warn" : "good"}>{total < 500 ? "Below B2B minimum. Review before quoting." : "Within workable quote range."}</p></div></section>; }
function Field({ label, value, set }: any){ return <label className="field">{label}<input type="number" value={value} onChange={e=>set(Number(e.target.value))}/></label>; }
function LaserLab(){ const [job,setJob]=useState(0),[materialName,setMaterialName]=useState("Genuine Leather"),[power,setPower]=useState(40),[speed,setSpeed]=useState(45),[passes,setPasses]=useState(1),[mirror,setMirror]=useState(92),[lens,setLens]=useState(88),[cooling,setCooling]=useState(22),[air,setAir]=useState(true),[cash,setCash]=useState(2500),[xp,setXp]=useState(0),[rep,setRep]=useState(70); const mat=materials.find(m=>m.name===materialName)!; const result=useMemo(()=>simulate(mat,power,speed,passes,mirror,lens,cooling,air),[mat,power,speed,passes,mirror,lens,cooling,air]); function deliver(){ setXp(x=>x+result.score); setCash(c=>c+(result.score>=80?jobs[job].budget[0]:-250)); setRep(r=>Math.max(0,Math.min(100,r+(result.score>=80?4:-6)))); setMirror(m=>Math.max(20,m-6)); setLens(l=>Math.max(20,l-4)); setJob(j=>(j+1)%jobs.length); } return <section className="section"><h2>Laser Lab simulation</h2><div className="split"><div className="card"><p className="kicker">Client job</p><h3>{jobs[job].title}</h3><p>{jobs[job].client} · {jobs[job].qty} units · deadline {jobs[job].deadline}</p><select value={materialName} onChange={e=>setMaterialName(e.target.value)}>{materials.map(m=><option key={m.name}>{m.name}</option>)}</select><div className="laserbed"><div className="beam"></div></div><Range label="Power" v={power} set={setPower}/><Range label="Speed" v={speed} set={setSpeed}/><Range label="Mirror cleanliness" v={mirror} set={setMirror}/><Range label="Lens cleanliness" v={lens} set={setLens}/><Field label="Passes" value={passes} set={setPasses}/><Field label="Cooling °C" value={cooling} set={setCooling}/><label><input type="checkbox" checked={air} onChange={e=>setAir(e.target.checked)}/> Air assist on</label><div className="actions"><button onClick={()=>{setMirror(100);setLens(100)}}>Clean optics</button><button onClick={deliver}>Deliver job</button></div></div><div className="card"><p className="kicker">Technician feedback</p><h3>{result.status}</h3><div className="stat">{result.score}%</div><p className="muted">{result.feedback}</p><hr/><p>Cash: R{cash} · XP: {xp} · Reputation: {rep}%</p></div></div></section>; }
function Range({label,v,set}:any){return <label className="field">{label}: {v}<input type="range" min="0" max="100" value={v} onChange={e=>set(Number(e.target.value))}/></label>}
function Education(){ return <section className="section"><h2>Education hub</h2><div className="grid">{modules.map((m,i)=><Card key={m} title={`${i+1}. ${m}`} text="Lesson content, quiz, XP reward and operator progression checkpoint."/>)}</div></section>; }
function Internships(){ return <section className="section split"><div><h2>Internship hub</h2><p className="muted">Learn → Practice → Build portfolio → Apply → Work on production.</p>{["Safety quiz","Virtual jobs","Portfolio upload","Operator readiness score"].map(x=><span className="pill" key={x}>{x}</span>)}</div><div className="card"><h3>Readiness score</h3><div className="stat">68%</div><p className="muted">Complete Laser Lab jobs and safety modules to improve this score.</p></div></section>; }
function Dashboard(){ return <section className="section"><h2>User dashboard</h2><div className="grid"><Card title="Level: Junior Operator" text="XP 1,250 · 4 badges unlocked"/><Card title="Machine health" text="Optics 88% · Cooling stable · Exhaust OK"/><Card title="Completed jobs" text="12 passed · 3 failed · 78% average score"/></div></section>; }
function Admin(){ return <section className="section"><h2>Admin dashboard</h2><div className="grid"><Card title="Quote pipeline" text="New 6 · Quoted 3 · Approved 2 · In production 4"/><Card title="Training" text="Courses 8 · Applications 5 · Active learners 24"/><Card title="Materials" text="Manage pricing, power/speed references and risk notes."/></div></section>; }
function Contact(){ return <section className="section"><h2>Contact</h2><p>Namane Supply / Namane Images · Johannesburg · CO₂ laser cutting and engraving for non-metal materials.</p><p className="muted">Use WhatsApp CTA, quote form or email workflow in the next backend phase.</p></section>; }
export default function App(){ const [route,setRoute]=useState<Route>("home"); return <div className="app"><Nav route={route} setRoute={setRoute}/>{route==="home"&&<Home setRoute={setRoute}/>} {route==="services"&&<Services/>}{route==="products"&&<Products/>}{route==="materials"&&<Materials/>}{route==="quote"&&<Quote/>}{route==="laser"&&<LaserLab/>}{route==="education"&&<Education/>}{route==="internships"&&<Internships/>}{route==="dashboard"&&<Dashboard/>}{route==="admin"&&<Admin/>}{route==="contact"&&<Contact/>}<footer className="footer">Precision-Made. Digitally Delivered. · Non-metal CO₂ laser fabrication only.</footer></div> }
