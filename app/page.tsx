"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Star, Lock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridBackground } from "@/components/grid-background";
import { ThemeToggle } from "@/components/theme-toggle";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ── */
const STATS = [
  { val: "< 1s",    label: "Per request" },
  { val: "< 0.01¢", label: "Per call" },
  { val: "Zero",    label: "Accounts needed" },
  { val: "Instant", label: "Settlement" },
];

const STEPS = [
  { num: "01", title: "Query the registry",  desc: "Hit GET /services — get a JSON list of APIs with prices in sats. No auth, no setup." },
  { num: "02", title: "Receive an invoice",  desc: "Call any endpoint. Get HTTP 402 back with a Lightning invoice. L402 handles it automatically." },
  { num: "03", title: "Pay and get results", desc: "Agent wallet auto-pays. Access token issued. Result returned — all under one second." },
];

const FEATURES = [
  { icon: Zap,    title: "Lightning-native payments", desc: "Every API call is a micropayment. No checkout forms, no minimums, no delays." },
  { icon: Shield, title: "Provider verification",     desc: "Every provider is verified before listing. Reputation scores tracked on every call." },
  { icon: Lock,   title: "L402 paywall protocol",     desc: "Industry-standard HTTP 402 + Lightning. Works with any agent that supports MDK or Alby." },
  { icon: Star,   title: "Reputation system",         desc: "On-chain track record for every provider. Ratings and call counts visible to all agents." },
];

const ROW1 = [
  { name: "Document Summarizer", price: "50 sats", category: "AI",       endpoint: "POST /api/summarize",  icon: "📄" },
  { name: "Code Reviewer",       price: "80 sats", category: "AI",       endpoint: "POST /api/review",     icon: "💻" },
  { name: "Sentiment Analyzer",  price: "30 sats", category: "AI",       endpoint: "POST /api/sentiment",  icon: "🧠" },
  { name: "Web Scraper",         price: "40 sats", category: "Data",     endpoint: "GET  /api/scrape",     icon: "🕷️" },
  { name: "SQL Query Agent",     price: "35 sats", category: "Data",     endpoint: "POST /api/query",      icon: "🗄️" },
  { name: "PDF Extractor",       price: "45 sats", category: "AI",       endpoint: "POST /api/extract",    icon: "📑" },
];

const ROW2 = [
  { name: "Image Captioner",     price: "60 sats", category: "Media",    endpoint: "POST /api/caption",    icon: "🖼️" },
  { name: "Currency Converter",  price: "10 sats", category: "Utility",  endpoint: "GET  /api/convert",    icon: "💱" },
  { name: "Email Drafter",       price: "25 sats", category: "AI",       endpoint: "POST /api/draft",      icon: "✉️" },
  { name: "Language Translator", price: "20 sats", category: "AI",       endpoint: "POST /api/translate",  icon: "🌐" },
  { name: "Audio Transcriber",   price: "70 sats", category: "Media",    endpoint: "POST /api/transcribe", icon: "🎙️" },
  { name: "Threat Scanner",      price: "55 sats", category: "Security", endpoint: "POST /api/scan",       icon: "🔒" },
];

const FLOW = ["Agent", "GET /services", "HTTP 402", "⚡ Pay 50 sats", "Result ✓"];

const CATEGORY_COLOR: Record<string, string> = {
  AI:       "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Data:     "bg-blue-50   text-blue-700   dark:bg-blue-500/10   dark:text-blue-400",
  Media:    "bg-pink-50   text-pink-700   dark:bg-pink-500/10   dark:text-pink-400",
  Utility:  "bg-green-50  text-green-700  dark:bg-green-500/10  dark:text-green-400",
  Security: "bg-red-50    text-red-700    dark:bg-red-500/10    dark:text-red-400",
};

/* ── Service card used in marquee ── */
function ServiceCard({ name, price, category, endpoint, icon }: {
  name: string; price: string; category: string; endpoint: string; icon: string;
}) {
  return (
    <div className="inline-flex w-[256px] shrink-0 flex-col gap-3 border border-border bg-card p-4 transition-colors hover:border-blue-500/40">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className={`px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[category] ?? "bg-muted text-muted-foreground"}`}>
          {category}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{endpoint}</p>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="font-mono text-sm font-bold text-blue-500">{price}</span>
        <span className="text-[10px] text-muted-foreground">per call · instant</span>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const rootRef    = useRef<HTMLDivElement>(null);
  const navbarRef  = useRef<HTMLElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const featRef    = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* navbar elements fall from top */
      gsap.set(".nav-logo, .nav-link, .nav-action", { y: -60, opacity: 0 });
      gsap.to(".nav-logo",   { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.05 });
      gsap.to(".nav-link",   { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.08, delay: 0.15 });
      gsap.to(".nav-action", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1,  delay: 0.35 });

      /* hero orb parallax */
      gsap.to(".hero-orb", {
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        y: -140, ease: "none",
      });

      /* stats */
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      });

      /* steps */
      gsap.from(".step-card", {
        scrollTrigger: { trigger: stepsRef.current, start: "top 80%" },
        x: -36, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
      });

      /* features */
      gsap.from(".feat-card", {
        scrollTrigger: { trigger: featRef.current, start: "top 80%" },
        scale: 0.91, opacity: 0, duration: 0.55, stagger: 0.1, ease: "back.out(1.4)",
      });

      /* marquee heading */
      gsap.from(".marquee-heading", {
        scrollTrigger: { trigger: marqueeRef.current, start: "top 85%" },
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
      });

      /* cta */
      gsap.from(".cta-content", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        y: 32, opacity: 0, duration: 0.7, ease: "power3.out",
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-background text-foreground font-sans">

      {/* ── Navbar ── */}
      <header ref={navbarRef} className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="nav-logo flex items-center gap-2 font-bold text-base text-foreground">
            <div className="flex h-7 w-7 items-center justify-center bg-blue-600">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            ShotenX AI
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {[
              { href: "/marketplace", label: "Marketplace" },
              { href: "/demo",        label: "Demo" },
            ].map((l, i) => (
              <Link key={i} href={l.href}
                className="nav-link px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="nav-action"><ThemeToggle /></div>
            <Link href="/login"
              className="nav-action text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
              Sign in
            </Link>
            <Link href="/login"
              className="nav-action bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-28 pt-24 text-center">
        <GridBackground />
        <div className="hero-orb pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 65%)" }} />

        <div className="relative mx-auto max-w-4xl">
          <div className="land-badge mb-7 inline-flex items-center gap-2 border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 bg-blue-500 animate-pulse" />
            Lightning-native · Pay per request · No accounts
          </div>

          <h1 className="land-title text-5xl font-bold leading-[1.08] tracking-tight text-foreground lg:text-[64px]">
            The API marketplace
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 bg-clip-text text-transparent">
              for AI agents
            </span>
          </h1>

          <p className="land-sub mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Agents discover services, pay fractions of a cent via Lightning, and get results instantly.
            No keys. No accounts. No friction.
          </p>

          <div className="land-cta mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/marketplace"
              className="btn-gradient-border flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Explore services <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login"
              className="border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Get started
            </Link>
          </div>

          <div className="land-flow mt-14 flex flex-wrap items-center justify-center gap-2 text-xs">
            {FLOW.map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                <span className="border border-border bg-card px-3 py-1.5 font-mono text-muted-foreground">{item}</span>
                {i < FLOW.length - 1 && <span className="text-muted-foreground/30">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-border sm:grid-cols-4">
          {STATS.map(({ val, label }) => (
            <div key={label} className="stat-item flex flex-col items-center gap-1.5 py-10 text-center">
              <span className="text-3xl font-bold tracking-tight text-foreground">{val}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section ref={stepsRef} className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Three steps. Under one second.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="step-card border border-border bg-card p-6 transition-colors hover:border-blue-500/40">
              <span className="mb-5 block font-mono text-xs text-muted-foreground/30">{num}</span>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featRef} className="border-t border-border bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">Platform</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Built for the agent economy</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feat-card border border-border bg-background p-5 transition-colors hover:border-blue-500/40">
                <div className="mb-4 flex h-9 w-9 items-center justify-center bg-blue-600/10">
                  <Icon className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Marquee ── */}
      <section ref={marqueeRef} className="border-t border-border bg-background py-20 overflow-hidden">
        <div className="marquee-heading mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">Services</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">What agents can buy</h2>
          <p className="mt-3 text-sm text-muted-foreground">Pay-per-call. Instant settlement. No subscriptions.</p>
        </div>

        {/* Row 1 — left */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32"
            style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32"
            style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
          <div className="flex overflow-hidden">
            <div className="marquee-left flex gap-3">
              {[...ROW1, ...ROW1].map((s, i) => <ServiceCard key={i} {...s} />)}
            </div>
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32"
            style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32"
            style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
          <div className="flex overflow-hidden">
            <div className="marquee-right flex gap-3">
              {[...ROW2, ...ROW2].map((s, i) => <ServiceCard key={i} {...s} />)}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/marketplace"
            className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            Browse all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} className="relative overflow-hidden border-t border-border bg-card py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%)" }} />
        <div className="cta-content relative mx-auto max-w-2xl px-6">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Ready to plug in?</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Register your API in minutes and start earning sats per call.
            Or explore the services as an agent.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login"
              className="btn-gradient-border flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Register your API <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace"
              className="border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Browse services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center bg-blue-600">
              <Zap className="h-3 w-3 fill-white text-white" />
            </div>
            <span className="font-semibold text-foreground">ShotenX AI</span>
            <span>— Payment = Access.</span>
          </div>
          <span>Built on Lightning ⚡</span>
        </div>
      </footer>
    </div>
  );
}
