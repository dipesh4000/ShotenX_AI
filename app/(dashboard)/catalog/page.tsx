"use client";

import { useState } from "react";
import { Search, Star, Shield, Download, Plus } from "lucide-react";

const SERVICES = [
  { id: 1, name: "Document Summarizer", desc: "Summarize long documents into concise insights.", price: 50, category: "AI", provider: "provider@getalby.com", endpoint: "POST /api/summarize", rating: 4.9, calls: 1200, verified: true },
  { id: 2, name: "Code Reviewer", desc: "AI-powered code review with actionable feedback.", price: 80, category: "AI", provider: "codebot@getalby.com", endpoint: "POST /api/review", rating: 4.8, calls: 980, verified: true },
  { id: 3, name: "Sentiment Analyzer", desc: "Detect sentiment and emotion in any text.", price: 30, category: "AI", provider: "nlp@getalby.com", endpoint: "POST /api/sentiment", rating: 4.7, calls: 3400, verified: true },
  { id: 4, name: "Currency Converter", desc: "Real-time currency conversion with live rates.", price: 10, category: "Utility", provider: "fintools@getalby.com", endpoint: "GET /api/convert", rating: 5.0, calls: 8100, verified: true },
  { id: 5, name: "Image Captioner", desc: "Generate descriptive captions for any image.", price: 60, category: "Media", provider: "vision@getalby.com", endpoint: "POST /api/caption", rating: 4.6, calls: 540, verified: false },
  { id: 6, name: "Web Scraper", desc: "Extract structured data from any public URL.", price: 40, category: "Data", provider: "scraper@getalby.com", endpoint: "GET /api/scrape", rating: 4.8, calls: 2200, verified: true }
];

const CATEGORIES = ["All", "AI", "Data", "Media", "Utility"];

const BADGE: Record<string, string> = {
  AI: "badge-purple",
  Data: "badge-blue",
  Media: "badge-orange",
  Utility: "badge-green"
};

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = SERVICES.filter((s) => {
    const matchCat = category === "All" || s.category === category;
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Catalog</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add service
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total services", val: SERVICES.length },
          { label: "Total calls", val: "16,420" },
          { label: "Avg price", val: "45 sats" }
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 h-8 w-56">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c
                ? "bg-blue-600 text-white"
                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {SERVICES.length} results</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Endpoint</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Provider</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`table-row-hover ${i < filtered.length - 1 ? "border-b border-border" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-bold text-muted-foreground">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.desc.slice(0, 40)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={BADGE[s.category]}>{s.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-foreground">{s.price} sats</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.endpoint}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-foreground">{s.rating}</span>
                    {s.verified && <Shield className="ml-1 h-3 w-3 text-green-500" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{s.provider}</td>
                <td className="px-4 py-3">
                  <button className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
                    Call
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">{filtered.length} of {SERVICES.length} results</p>
          <div className="flex gap-2">
            <button className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">Prev</button>
            <button className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
