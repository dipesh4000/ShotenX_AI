"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { Search, Zap, TrendingUp, Activity, CheckCircle2, Clock, Download } from "lucide-react";
import { Agent, api, Checkout } from "@/lib/api";

/* ── Mock chart data ── */
const LINE_DATA = [
  { date: "Jan 29", calls: 38, avgSats: 42 },
  { date: "Jan 31", calls: 52, avgSats: 45 },
  { date: "Feb 02", calls: 47, avgSats: 41 },
  { date: "Feb 04", calls: 61, avgSats: 50 },
  { date: "Feb 06", calls: 55, avgSats: 48 },
  { date: "Feb 08", calls: 72, avgSats: 53 },
  { date: "Feb 10", calls: 68, avgSats: 49 },
  { date: "Feb 12", calls: 85, avgSats: 58 },
  { date: "Feb 14", calls: 79, avgSats: 55 },
  { date: "Feb 16", calls: 94, avgSats: 62 },
  { date: "Feb 18", calls: 88, avgSats: 59 },
  { date: "Feb 20", calls: 103, avgSats: 67 },
  { date: "Feb 22", calls: 97, avgSats: 64 },
  { date: "Feb 24", calls: 115, avgSats: 71 },
  { date: "Feb 26", calls: 108, avgSats: 68 },
  { date: "Feb 28", calls: 124, avgSats: 75 },
];

const BAR_DATA = [
  { date: "Jan 29", subs: 120 },
  { date: "Jan 31", subs: 145 },
  { date: "Feb 02", subs: 98 },
  { date: "Feb 04", subs: 167 },
  { date: "Feb 06", subs: 134 },
  { date: "Feb 08", subs: 189 },
  { date: "Feb 10", subs: 156 },
  { date: "Feb 12", subs: 210 },
  { date: "Feb 14", subs: 178 },
  { date: "Feb 16", subs: 234 },
  { date: "Feb 18", subs: 198 },
  { date: "Feb 20", subs: 256 },
  { date: "Feb 22", subs: 221 },
  { date: "Feb 24", subs: 278 },
  { date: "Feb 26", subs: 243 },
  { date: "Feb 28", subs: 295 },
];

const RECENT_AGENTS = [
  { name: "Ryan Parker", type: "Guest", email: "ryan@shotenx.ai", spend: "$856.2", payments: 4, created: "Feb 03, 2025 10:19..." },
  { name: "Simon Alt", type: "Guest", email: "simon@shotenx.ai", spend: "$209.1", payments: 2, created: "Jan 29, 2025 02:56..." },
  { name: "Emma Thompson", type: "Subscriber", email: "emma@shotenx.ai", spend: "$495.8", payments: 3, created: "Jan 27, 2025 06:30..." },
  { name: "Sophia Baker", type: "Subscriber", email: "sophia@shotenx.ai", spend: "$268.5", payments: 1, created: "Jan 24, 2025 08:14..." },
  { name: "Mason Clark", type: "Guest", email: "mason@shotenx.ai", spend: "$180.2", payments: 5, created: "Jan 19, 2025 12:37..." },
  { name: "James Griffin", type: "Guest", email: "james@shotenx.ai", spend: "$392.6", payments: 4, created: "Jan 09, 2025 06:55..." },
];

const categories = ["all", "data", "code", "security", "design", "automation", "research"];

/* ── Custom tooltip ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}</span>
          <span className="ml-auto font-mono font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [status, setStatus] = useState("Select an agent to begin.");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const result = await api.searchAgents(query, category);
        setAgents(result);
        if (!selectedAgent && result.length > 0) setSelectedAgent(result[0]);
      } catch {
        setStatus("Backend offline — showing mock data.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  const selectedPrice = useMemo(() => selectedAgent?.priceSats ?? 0, [selectedAgent]);

  const handleCreateCheckout = async () => {
    if (!selectedAgent) return;
    try {
      setStatus("Creating Lightning invoice...");
      const result = await api.createCheckout(selectedAgent.id);
      setCheckout(result);
      setStatus(`Invoice ready — ${result.amountSats} sats`);
    } catch (e) { setStatus(e instanceof Error ? e.message : "Checkout failed"); }
  };

  const handleSettle = async () => {
    if (!checkout) return;
    try {
      const result = await api.settleCheckout(checkout.id);
      setCheckout(result);
      setStatus("Payment settled ✅");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Settlement failed"); }
  };

  const handleRun = async () => {
    if (!chatInput.trim()) return;
    try {
      setStatus("Calling paid endpoint...");
      const first = await api.runPaidSummary(chatInput);
      if (!first.success && first.paywall) {
        setStatus("L402 paywall hit — settling...");
        await api.settleCheckout(first.paywall.checkoutId);
        const second = await api.runPaidSummary(chatInput, first.paywall.checkoutId);
        if (second.success && second.data) {
          setChatLog((p) => [`You: ${chatInput}`, `Agent: ${second.data!.summary}`, ...p]);
          setChatInput(""); setStatus("Done ✅");
        }
        return;
      }
      if (first.success && first.data) {
        setChatLog((p) => [`You: ${chatInput}`, `Agent: ${first.data!.summary}`, ...p]);
        setChatInput(""); setStatus("Done ✅");
      }
    } catch (e) { setStatus(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div className="space-y-5 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Overview</h1>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Analyze
          </button>
          <button className="btn-outline flex items-center gap-1.5">
            Last 30 days ▾
          </button>
          <button className="btn-outline"><span className="text-base leading-none">⋯</span></button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 stagger">
        {[
          { label: "Net revenue", val: "$24,609", change: "+91%", sub: "vs 12,908 last period", icon: TrendingUp, up: true },
          { label: "Total calls", val: "1,280", change: "+56%", sub: "vs last period", icon: Zap, up: true },
          { label: "Active agents", val: "42", change: "+12%", sub: "vs last period", icon: Activity, up: true },
          { label: "Avg latency", val: "0.8s", change: "-5%", sub: "vs last period", icon: Clock, up: false }
        ].map(({ label, val, change, sub, icon: Icon, up }) => (
          <div key={label} className="border border-border bg-card p-4 animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{val}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={`font-semibold ${up ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>{change}</span>
              {" "}{sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Line chart — Net revenue / Calls */}
        <div className="lg:col-span-2 border border-border bg-card animate-scale-in">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <button className="text-xs font-medium text-foreground border-b border-foreground pb-0.5 mr-3">
                  Net revenue ▾
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-emerald-500" /> Calls
                  <span className="font-mono font-semibold text-foreground ml-1">318</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-orange-400" /> Avg. sats
                  <span className="font-mono font-semibold text-foreground ml-1">$292.87</span>
                </span>
              </div>
            </div>
          </div>
          <div className="px-2 pb-3 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={LINE_DATA} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                <Line type="monotone" dataKey="calls" stroke="#10b981" strokeWidth={2} dot={false} name="calls" />
                <Line type="monotone" dataKey="avgSats" stroke="#f97316" strokeWidth={2} dot={false} name="avg sats" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-2 text-[10px] text-muted-foreground mt-1">
              <span>January 29</span><span>February 28</span>
            </div>
          </div>
        </div>

        {/* Bar chart — Subscriptions */}
        <div className="border border-border bg-card animate-scale-in">
          <div className="border-b border-border px-5 py-3">
            <button className="text-xs font-medium text-foreground border-b border-foreground pb-0.5">
              Subscriptions ▾
            </button>
          </div>
          <div className="px-5 pt-3 pb-1">
            <p className="text-2xl font-bold tracking-tight text-foreground">3,260</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-semibold text-green-600 dark:text-green-400">+56%</span> vs 2,080 last period
            </p>
          </div>
          <div className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={BAR_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                <Bar dataKey="subs" fill="#10b981" name="subs" radius={0} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-2 text-[10px] text-muted-foreground mt-1">
              <span>January 29</span><span>February 28</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent agents table ── */}
      <div className="border border-border bg-card animate-fade-in">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Last agents</h2>
          <div className="flex items-center gap-2">
            <button className="btn-outline flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="btn-primary flex items-center gap-1.5 py-1.5 px-3">
              + Add agent <kbd className="ml-1 border border-white/20 px-1 text-[10px]">/</kbd>
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="w-8 px-4 py-2.5"><input type="checkbox" className="h-3.5 w-3.5" /></th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name ↕</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Email ↕</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Total spend ↕</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Payments ↕</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Created ↕</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {RECENT_AGENTS.map((a, i) => (
              <tr key={a.email} className={`table-row-hover ${i < RECENT_AGENTS.length - 1 ? "border-b border-border" : ""}`}>
                <td className="px-4 py-3"><input type="checkbox" className="h-3.5 w-3.5" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground">
                      {a.name[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-foreground">{a.spend}</td>
                <td className="px-4 py-3 text-sm text-foreground">{a.payments}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.created}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <button className="text-xs hover:text-foreground">···</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Payment panel (collapsed at bottom) ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Agent Search</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 border border-border bg-muted/50 px-3 h-9">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by skill, tag..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-9 border border-border bg-muted/50 px-2 text-sm text-foreground outline-none">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="max-h-[220px] space-y-1 overflow-auto">
              {loading && <p className="py-4 text-center text-sm text-muted-foreground">Loading agents...</p>}
              {!loading && agents.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No agents found. Start the backend.</p>}
              {!loading && agents.map((agent) => (
                <button key={agent.id} onClick={() => setSelectedAgent(agent)}
                  className={`w-full border px-4 py-3 text-left transition-colors ${
                    selectedAgent?.id === agent.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/5" : "border-border hover:bg-muted/50"
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{agent.priceSats} sats</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{agent.tagline}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Payment Panel</h2>
            </div>
            <div className="p-4 space-y-3">
              {selectedAgent ? (
                <>
                  <div className="border border-border bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{selectedAgent.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{selectedAgent.description}</p>
                    <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">{selectedPrice} sats / call</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleCreateCheckout} className="btn-primary flex items-center justify-center gap-1.5 py-2">
                      <Zap className="h-3.5 w-3.5 fill-white" /> Pay via Lightning
                    </button>
                    <button onClick={handleSettle} className="btn-outline py-2">Simulate Settle</button>
                  </div>
                  {checkout && (
                    <div className="border border-border bg-muted/30 p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${checkout.status === "settled" ? "text-green-500" : "text-yellow-500"}`} />
                        <span className="text-xs font-medium capitalize text-foreground">{checkout.status}</span>
                      </div>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{checkout.invoice}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Select an agent to begin.</p>
              )}
              <div className="border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{status}</div>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Paid Summarize</h2>
            </div>
            <div className="p-3 space-y-2">
              <div className="h-24 overflow-auto border border-border bg-muted/20 p-2.5 text-xs">
                {chatLog.length === 0
                  ? <p className="text-muted-foreground">Output will appear here...</p>
                  : chatLog.map((line, i) => (
                    <p key={i} className={`mb-1 ${line.startsWith("Agent:") ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>{line}</p>
                  ))}
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()} placeholder="Enter text to summarize..."
                  className="h-8 flex-1 border border-border bg-muted/50 px-3 text-xs outline-none focus:border-blue-500 placeholder:text-muted-foreground transition-colors" />
                <button onClick={handleRun} className="btn-primary px-4">Run</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
