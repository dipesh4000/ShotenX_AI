export interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  priceSats: number;
  rating: number;
  tasksCompleted: number;
  owner: string;
  tags: string[];
}

export interface Checkout {
  id: string;
  agentId: string;
  amountSats: number;
  invoice: string;
  status: "pending" | "settled" | "expired";
  paymentHash: string;
}

export interface PaidSummaryResult {
  summary: string;
  words: number;
  note: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const api = {
  async searchAgents(query: string, category?: string): Promise<Agent[]> {
    const url = new URL(`${API_BASE}/api/agents`);
    if (query) url.searchParams.set("q", query);
    if (category && category !== "all") url.searchParams.set("category", category);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("Could not fetch agents");
    const data = await res.json();
    return data.agents ?? [];
  },

  async createCheckout(agentId: string): Promise<Checkout> {
    const res = await fetch(`${API_BASE}/api/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, buyerId: "frontend-user" })
    });
    if (!res.ok) throw new Error("Could not create checkout");
    return res.json();
  },

  async settleCheckout(checkoutId: string): Promise<Checkout> {
    const res = await fetch(`${API_BASE}/api/payments/${checkoutId}/simulate-settle`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Could not settle checkout");
    return res.json();
  },

  async runPaidSummary(prompt: string, paymentToken?: string): Promise<{
    success: boolean;
    data?: PaidSummaryResult;
    paywall?: {
      checkoutId: string;
      invoice: string;
      amountSats: number;
      paymentHash: string;
    };
  }> {
    const res = await fetch(`${API_BASE}/api/tools/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(paymentToken ? { "x-payment-token": paymentToken } : {})
      },
      body: JSON.stringify({
        prompt,
        agentId: "agent-data-scout",
        buyerId: "frontend-user",
        amountSats: 20
      })
    });

    if (res.status === 402) {
      const data = await res.json();
      return {
        success: false,
        paywall: data.l402
      };
    }

    if (!res.ok) {
      throw new Error("Paid request failed");
    }

    const data = await res.json();
    return { success: true, data: data.result };
  }
};
