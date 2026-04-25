"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const SERVICES = [
  { id: 1, name: "Document Summarizer", desc: "Summarize long documents into concise insights.", price: 50, category: "AI", provider: "provider@getalby.com", endpoint: "POST /api/summarize", rating: 4.9, calls: 1200, verified: true },
  { id: 2, name: "Code Reviewer", desc: "AI-powered code review with actionable feedback.", price: 80, category: "AI", provider: "codebot@getalby.com", endpoint: "POST /api/review", rating: 4.8, calls: 980, verified: true },
  { id: 3, name: "Sentiment Analyzer", desc: "Detect sentiment and emotion in any text.", price: 30, category: "AI", provider: "nlp@getalby.com", endpoint: "POST /api/sentiment", rating: 4.7, calls: 3400, verified: true },
  { id: 4, name: "Currency Converter", desc: "Real-time currency conversion with live rates.", price: 10, category: "Utility", provider: "fintools@getalby.com", endpoint: "GET /api/convert", rating: 5.0, calls: 8100, verified: true },
  { id: 5, name: "Image Captioner", desc: "Generate descriptive captions for any image.", price: 60, category: "Media", provider: "vision@getalby.com", endpoint: "POST /api/caption", rating: 4.6, calls: 540, verified: false },
  { id: 6, name: "Web Scraper", desc: "Extract structured data from any public URL.", price: 40, category: "Data", provider: "scraper@getalby.com", endpoint: "GET /api/scrape", rating: 4.8, calls: 2200, verified: true },
  { id: 7, name: "Email Drafter", desc: "Draft professional emails from a short prompt.", price: 25, category: "AI", provider: "draft@getalby.com", endpoint: "POST /api/draft", rating: 4.5, calls: 760, verified: true },
  { id: 8, name: "Audio Transcriber", desc: "Transcribe audio files to accurate text.", price: 70, category: "Media", provider: "audio@getalby.com", endpoint: "POST /api/transcribe", rating: 4.7, calls: 430, verified: true },
];

const CATEGORIES = ["All", "AI", "Data", "Media", "Utility"];

const BADGE: Record<string, string> = {
  AI: "badge-purple",
  Data: "badge-blue",
  Media: "badge-orange",
  Utility: "badge-green",
};

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = SERVICES.filter((s) => {
    const matchCat = category === "All" || s.category === category;
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm text-foreground">
            <div className="flex h-7 w-7 items-center justify-center bg-blue-600">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            ShotenX AI
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Marketplace</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Available Agents</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pay per call via Lightning. No accounts needed.</p>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
            Start using agents <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available agents", val: SERVICES.length },
            { label: "Total calls made", val: "16,420" },
            { label: "Avg price", val: "45 sats" },
          ].map(({ label, val }) => (
            <div key={label} className="border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{val}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 border border-border bg-card px-3 h-8 w-56">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "bg-blue-600 text-white"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {SERVICES.length} agents</span>
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <div key={s.id} className="border border-border bg-card p-5 flex flex-col gap-3 hover:border-blue-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center border border-border bg-muted text-sm font-bold text-muted-foreground">
                  {s.name[0]}
                </div>
                <span className={BADGE[s.category]}>{s.category}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  {s.verified && <Shield className="h-3 w-3 text-green-500 shrink-0" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              <div className="font-mono text-[10px] text-muted-foreground border border-border bg-muted/30 px-2 py-1">
                {s.endpoint}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-foreground">{s.rating}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">({s.calls.toLocaleString()})</span>
                </div>
                <span className="font-mono text-sm font-bold text-blue-500">{s.price} sats</span>
              </div>
              <Link
                href="/login"
                className="w-full bg-blue-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Use agent ⚡
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
