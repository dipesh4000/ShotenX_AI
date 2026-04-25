"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Wallet, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent, api, Checkout } from "@/lib/api";

const categories = ["all", "data", "code", "security", "design", "automation", "research"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [status, setStatus] = useState("Search marketplace to begin.");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const result = await api.searchAgents(query, category);
        setAgents(result);
        if (!selectedAgent && result.length > 0) {
          setSelectedAgent(result[0]);
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load agents");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [query, category]);

  const selectedPrice = useMemo(() => selectedAgent?.priceSats ?? 0, [selectedAgent]);

  const handleCreateCheckout = async () => {
    if (!selectedAgent) return;
    try {
      setStatus("Creating Lightning checkout...");
      const result = await api.createCheckout(selectedAgent.id);
      setCheckout(result);
      setStatus(`Invoice created (${result.amountSats} sats). Click settle for demo.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
    }
  };

  const handleSettle = async () => {
    if (!checkout) return;
    try {
      const result = await api.settleCheckout(checkout.id);
      setCheckout(result);
      setStatus("Payment settled. You can now execute paid actions.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Settlement failed");
    }
  };

  const handleRunPaidTool = async () => {
    if (!chatInput.trim()) return;

    try {
      setStatus("Calling paid summarize endpoint...");
      const firstAttempt = await api.runPaidSummary(chatInput);
      if (!firstAttempt.success && firstAttempt.paywall) {
        setStatus("Received L402 paywall. Settling automatically for demo...");
        await api.settleCheckout(firstAttempt.paywall.checkoutId);
        const secondAttempt = await api.runPaidSummary(chatInput, firstAttempt.paywall.checkoutId);
        if (secondAttempt.success && secondAttempt.data) {
          const paidResult = secondAttempt.data;
          setChatLog((prev) => [
            `You: ${chatInput}`,
            `Agent: ${paidResult.summary}`,
            ...prev
          ]);
          setChatInput("");
          setStatus("Paid execution complete.");
        }
        return;
      }

      if (firstAttempt.success && firstAttempt.data) {
        const directResult = firstAttempt.data;
        setChatLog((prev) => [
          `You: ${chatInput}`,
          `Agent: ${directResult.summary}`,
          ...prev
        ]);
        setChatInput("");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tool execution failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto grid h-[calc(100vh-3rem)] max-w-7xl grid-cols-12 gap-4">
        <Card className="col-span-2 flex flex-col justify-between p-3">
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              Agent<br />Wallet
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs">
              <Wallet className="h-4 w-4" />
              Wallet
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 text-xs">
            <UserCircle2 className="h-4 w-4" />
            User profile
          </Button>
        </Card>

        <section className="col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>agent search</CardTitle>
              <CardDescription>Find hardcoded + registered agents ready for Lightning payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-md border bg-white px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by skill, owner, tag..."
                    className="h-10 w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 rounded-md border bg-white px-2 text-sm"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="max-h-[52vh] space-y-2 overflow-auto pr-1">
                {loading && <p className="text-sm text-muted-foreground">Loading agents...</p>}
                {!loading &&
                  agents.map((agent) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full rounded-md border bg-white p-3 text-left transition ${
                        selectedAgent?.id === agent.id ? "border-blue-500" : "border-border"
                      }`}
                    >
                      <p className="text-sm font-semibold">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.tagline}</p>
                      <p className="mt-1 text-xs">
                        {agent.priceSats} sats • {agent.rating}★
                      </p>
                    </motion.button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="col-span-4 space-y-4">
          <Card className="h-[74%]">
            <CardHeader>
              <CardTitle>Agent create</CardTitle>
              <CardDescription>Checkout + paid execution panel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedAgent ? (
                <>
                  <div className="rounded-md border bg-white p-3 text-sm">
                    <p className="font-semibold">{selectedAgent.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{selectedAgent.description}</p>
                    <p className="mt-2 text-xs">Base price: {selectedPrice} sats</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCheckout} className="flex-1">
                      pay button
                    </Button>
                    <Button onClick={handleSettle} variant="outline" className="flex-1">
                      settle demo
                    </Button>
                  </div>
                  {checkout && (
                    <div className="rounded-md border bg-slate-50 p-2 text-xs">
                      <p>Status: {checkout.status}</p>
                      <p className="truncate">Invoice: {checkout.invoice}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select an agent first.</p>
              )}
              <p className="rounded-md border bg-muted p-2 text-xs">{status}</p>
            </CardContent>
          </Card>

          <Card className="h-[24%]">
            <CardContent className="flex h-full flex-col gap-2 p-3">
              <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-white p-2 text-xs">
                {chatLog.length === 0 ? (
                  <p className="text-muted-foreground">Run paid summarize to see output here.</p>
                ) : (
                  chatLog.map((line, idx) => (
                    <p key={`${line}-${idx}`} className="mb-1">
                      {line}
                    </p>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Chat input"
                  className="h-9 flex-1 rounded-md border bg-white px-3 text-sm outline-none"
                />
                <Button size="sm" onClick={handleRunPaidTool}>
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
